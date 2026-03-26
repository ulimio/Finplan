import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request
from pypdf import PdfReader


app = Flask(__name__)

KANTONE = [
    {"value": "ag", "label": "Aargau"},
    {"value": "ai", "label": "Appenzell Innerrhoden"},
    {"value": "ar", "label": "Appenzell Ausserrhoden"},
    {"value": "be", "label": "Bern"},
    {"value": "bl", "label": "Basel-Landschaft"},
    {"value": "bs", "label": "Basel-Stadt"},
    {"value": "fr", "label": "Freiburg"},
    {"value": "ge", "label": "Genf"},
    {"value": "gl", "label": "Glarus"},
    {"value": "gr", "label": "Graubünden"},
    {"value": "ju", "label": "Jura"},
    {"value": "lu", "label": "Luzern"},
    {"value": "ne", "label": "Neuenburg"},
    {"value": "nw", "label": "Nidwalden"},
    {"value": "ow", "label": "Obwalden"},
    {"value": "sg", "label": "St. Gallen"},
    {"value": "sh", "label": "Schaffhausen"},
    {"value": "so", "label": "Solothurn"},
    {"value": "sz", "label": "Schwyz"},
    {"value": "tg", "label": "Thurgau"},
    {"value": "ti", "label": "Tessin"},
    {"value": "ur", "label": "Uri"},
    {"value": "vd", "label": "Waadt"},
    {"value": "vs", "label": "Wallis"},
    {"value": "zg", "label": "Zug"},
    {"value": "zh", "label": "Zürich"},
]


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\x00", " ")).strip()


def parse_swiss_number(value: str):
    normalized = (
        value.replace("CHF", "")
        .replace("Fr.", "")
        .replace("Fr", "")
        .replace("’", "")
        .replace("'", "")
        .replace(" ", "")
    )
    normalized = re.sub(r",(?=\d{1,2}$)", ".", normalized)
    normalized = normalized.replace(",", "")

    try:
        return float(normalized)
    except ValueError:
        return None


def currency_string(value: float) -> str:
    return f"{value:,.0f}".replace(",", "’") + " CHF"


def push_field(fields, field_key, label, value, confidence="medium"):
    if not any(entry["fieldKey"] == field_key and entry["value"] == value for entry in fields):
        fields.append(
            {
                "fieldKey": field_key,
                "label": label,
                "value": value,
                "confidence": confidence,
                "status": "pending",
            }
        )


def amount_validation(field_key: str, value: float):
    limits = {
        "anzahlKinder": (0, 10, "high"),
        "bruttoeinkommen": (10000, 2000000, "high"),
        "variablesEinkommen": (500, 1000000, "medium"),
        "liquiditaet": (500, 20000000, "medium"),
        "wertschriften": (500, 50000000, "medium"),
        "immobilienwert": (50000, 50000000, "high"),
        "sonstigesVermoegen": (500, 50000000, "medium"),
        "hypothek": (10000, 50000000, "high"),
        "pkGuthaben": (1000, 10000000, "medium"),
        "saule3aGesamt": (500, 2000000, "medium"),
        "grenzsteuersatz": (1, 50, "medium"),
    }

    if field_key not in limits:
        return True, "medium"

    min_value, max_value, confidence = limits[field_key]
    return min_value <= value <= max_value, confidence


def first_match(text: str, patterns):
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match and match.group(1):
            return match.group(1).strip()
    return None


def find_labeled_amount(text: str, labels):
    escaped = "|".join(re.escape(label) for label in labels)
    patterns = [
        rf"(?:{escaped})\D{{0,40}}([\d'’., ]+)\s*CHF",
        rf"(?:{escaped})\D{{0,40}}([\d'’., ]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match and match.group(1):
            value = parse_swiss_number(match.group(1))
            if value is not None:
                return value
    return None


def detect_canton(text: str):
    contextual = first_match(
        text,
        [
            r"(?:wohnkanton|kanton des wohnsitzes|steuerdomizil|steuerkanton|veranlagungskanton)\s*[:\-]?\s*([A-Za-zÄÖÜäöü.\- ]{2,40})",
            r"(?:wohnort|wohnsitz|domizil)\s*[:\-]?\s*[A-Za-zÄÖÜäöü.\- ]+,\s*([A-Za-zÄÖÜäöü.\- ]{2,40})",
        ],
    )

    if contextual:
        contextual = contextual.lower()
        for entry in KANTONE:
            label = entry["label"].lower()
            if contextual == label or label in contextual:
                return entry

    for entry in KANTONE:
        label = entry["label"].lower()
        if re.search(rf"\b{re.escape(label)}\b", text, re.IGNORECASE):
            if label == "uri" and "wohnkanton uri" not in text and "kanton uri" not in text:
                continue
            return entry

    return None


def extract_profile(text: str):
    normalized = normalize_text(text)
    lower = normalized.lower()
    profile = {}
    fields = []

    canton = detect_canton(lower)
    if canton:
        profile["kanton"] = canton["value"]
        push_field(fields, "kanton", "Wohnkanton", canton["label"], "high")

    if "verheiratet" in lower:
        profile["zivilstand"] = "verheiratet"
        push_field(fields, "zivilstand", "Zivilstand", "Verheiratet", "high")
    elif "geschieden" in lower:
        profile["zivilstand"] = "geschieden"
        push_field(fields, "zivilstand", "Zivilstand", "Geschieden", "high")
    elif "verwitwet" in lower:
        profile["zivilstand"] = "verwitwet"
        push_field(fields, "zivilstand", "Zivilstand", "Verwitwet", "high")
    elif "ledig" in lower:
        profile["zivilstand"] = "ledig"
        push_field(fields, "zivilstand", "Zivilstand", "Ledig", "high")

    children_match = re.search(r"(?:anzahl kinder|kinder)\D{0,12}(\d{1,2})", normalized, re.IGNORECASE)
    if children_match:
        value = int(children_match.group(1))
        allowed, confidence = amount_validation("anzahlKinder", value)
        if allowed:
            profile["anzahlKinder"] = value
            push_field(fields, "anzahlKinder", "Kinder", str(value), confidence)

    if re.search(r"(?:nicht kirchensteuerpflichtig|ohne kirchensteuer|keine kirchensteuer)", normalized, re.IGNORECASE):
        profile["kirchensteuer"] = False
        push_field(fields, "kirchensteuer", "Kirchensteuer", "Nein", "high")
    elif "kirchensteuer" in lower:
        profile["kirchensteuer"] = True
        push_field(fields, "kirchensteuer", "Kirchensteuer", "Ja", "medium")

    amount_fields = [
        ("bruttoeinkommen", "Bruttoeinkommen", ["bruttolohn", "jahreslohn", "bruttoeinkommen", "einkünfte aus unselbständiger erwerbstätigkeit"]),
        ("variablesEinkommen", "Variables Einkommen", ["bonus", "gratifikation", "provisionen", "nebeneinkünfte"]),
        ("liquiditaet", "Liquidität", ["bankguthaben", "kontoguthaben", "flüssige mittel", "liquidität", "guthaben bei banken"]),
        ("wertschriften", "Wertschriften", ["wertschriften", "depotwert"]),
        ("immobilienwert", "Immobilienwert", ["steuerwert der liegenschaft", "steuerwert liegenschaft", "amtlicher wert", "immobilienwert"]),
        ("sonstigesVermoegen", "Sonstiges Vermögen", ["übriges vermögen", "sonstiges vermögen", "übrige vermögenswerte"]),
        ("hypothek", "Hypothek", ["hypothekarschulden", "hypothek", "grundpfandschulden"]),
        ("pkGuthaben", "Pensionskasse", ["pensionskassenguthaben", "guthaben berufliche vorsorge", "freizügigkeitsguthaben", "2. säule"]),
        ("saule3aGesamt", "Säule 3a", ["säule 3a", "3a-guthaben", "gebundene vorsorge", "vorsorgekonto 3a"]),
    ]

    for field_key, label, labels in amount_fields:
        amount = find_labeled_amount(normalized, labels)
        if amount is None:
            continue
        allowed, confidence = amount_validation(field_key, amount)
        if not allowed:
            continue
        profile[field_key] = round(amount)
        push_field(fields, field_key, label, currency_string(round(amount)), confidence)

    tax_rate = first_match(
        normalized,
        [
            r"(?:grenzsteuersatz|marginaler steuersatz)\D{0,20}(\d{1,2}(?:[.,]\d{1,2})?)\s*%",
            r"(?:steuersatz)\D{0,20}(\d{1,2}(?:[.,]\d{1,2})?)\s*%",
        ],
    )
    if tax_rate:
        value = parse_swiss_number(tax_rate)
        if value is not None:
            allowed, confidence = amount_validation("grenzsteuersatz", value)
            if allowed:
                profile["grenzsteuersatz"] = value
                push_field(fields, "grenzsteuersatz", "Steuersatz", f"{value:.1f} %".replace(".", ","), confidence)

    return profile, fields


def extract_text_from_pdf(path: Path):
    reader = PdfReader(str(path))
    pages = [page.extract_text() or "" for page in reader.pages]
    return normalize_text("\n".join(pages))


def run_ocrmypdf(input_path: Path, output_path: Path):
    command = [
        "ocrmypdf",
        "--force-ocr",
        "--skip-big",
        "50",
        "--language",
        "deu+eng",
        str(input_path),
        str(output_path),
    ]
    subprocess.run(command, check=True, capture_output=True)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = os.getenv("CORS_ALLOW_ORIGIN", "*")
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})


@app.route("/extract-tax", methods=["OPTIONS"])
def extract_tax_options():
    return ("", 204)


@app.route("/extract-tax", methods=["POST"])
def extract_tax():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported."}), 400

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        input_path = temp_path / "input.pdf"
        output_path = temp_path / "ocr.pdf"
        file.save(input_path)

        raw_text = extract_text_from_pdf(input_path)
        mode = "pdf-text"
        text = raw_text

        if len(raw_text) < 120:
            run_ocrmypdf(input_path, output_path)
            text = extract_text_from_pdf(output_path)
            mode = "ocr"

        profile, fields = extract_profile(text)

        return jsonify(
            {
                "mode": mode if fields else "empty",
                "profile": profile,
                "fields": fields,
                "textLength": len(text),
            }
        )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
