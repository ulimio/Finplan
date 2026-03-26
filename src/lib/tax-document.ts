import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

type PdfPageProxy = Awaited<ReturnType<Awaited<ReturnType<typeof pdfjsLib.getDocument>>['promise']['getPage']>>

export interface TaxDocumentExtractionResult {
  text: string
  mode: 'pdf-text' | 'ocr' | 'empty'
  pageCount: number
}

let workerConfigured = false

function ensurePdfWorker() {
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
    workerConfigured = true
  }
}

function normalizeExtractedText(text: string) {
  return text.replace(/\0/g, ' ').replace(/\s+/g, ' ').trim()
}

function looksLikeUsefulTaxText(text: string) {
  const normalized = normalizeExtractedText(text).toLowerCase()

  if (normalized.length < 120) {
    return false
  }

  const keywords = [
    'steuer',
    'steuererklärung',
    'veranlagung',
    'bruttolohn',
    'wertschriften',
    'hypothek',
    'liquidität',
    'pensionskasse',
    'säule 3a',
    'kirchensteuer',
    'kanton',
  ]

  return keywords.some((keyword) => normalized.includes(keyword))
}

async function extractPdfText(file: File) {
  ensurePdfWorker()

  const data = new Uint8Array(await file.arrayBuffer())
  const document = await pdfjsLib.getDocument({ data }).promise
  const pageTexts: string[] = []

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')

    pageTexts.push(text)
  }

  return {
    text: normalizeExtractedText(pageTexts.join('\n')),
    document,
  }
}

async function renderPageToCanvas(page: PdfPageProxy) {
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas-Kontext für OCR konnte nicht erstellt werden.')
  }

  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)

  await page.render({
    canvasContext: context,
    viewport,
  }).promise

  return canvas
}

async function runPdfOcr(document: Awaited<ReturnType<typeof pdfjsLib.getDocument>>['promise']) {
  const Tesseract = await import('tesseract.js')
  const pageLimit = Math.min(document.numPages, 3)
  const extractedPages: string[] = []

  for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const canvas = await renderPageToCanvas(page)
    const result = await Tesseract.recognize(canvas, 'deu+eng')
    extractedPages.push(result.data.text ?? '')
  }

  return normalizeExtractedText(extractedPages.join('\n'))
}

export async function extractSwissTaxDocumentText(file: File): Promise<TaxDocumentExtractionResult> {
  const { text, document } = await extractPdfText(file)

  if (looksLikeUsefulTaxText(text)) {
    return {
      text,
      mode: 'pdf-text',
      pageCount: document.numPages,
    }
  }

  const ocrText = await runPdfOcr(document)

  if (looksLikeUsefulTaxText(ocrText)) {
    return {
      text: ocrText,
      mode: 'ocr',
      pageCount: document.numPages,
    }
  }

  return {
    text: text || ocrText,
    mode: 'empty',
    pageCount: document.numPages,
  }
}
