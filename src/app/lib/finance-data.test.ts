import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import {
  berechneAlter,
  formatCurrency,
  formatPercent,
  getProfileStorageKey,
  getVariantenStorageKey,
  createBasisVariante,
  analyseVariante,
  DEFAULT_PROFILE,
} from './finance-data'

// Pin system time so age calculations are deterministic
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-15'))
})

afterAll(() => {
  vi.useRealTimers()
})

describe('berechneAlter', () => {
  it('returns 40 for empty birthdate', () => {
    expect(berechneAlter('')).toBe(40)
  })

  it('calculates correct age from birthdate', () => {
    expect(berechneAlter('2000-01-01')).toBe(26)
  })

  it('clamps to max 75 for very old birthdates', () => {
    expect(berechneAlter('1940-01-01')).toBe(75)
  })

  it('clamps to min 18 for very young birthdates', () => {
    expect(berechneAlter('2015-01-01')).toBe(18)
  })
})

describe('formatCurrency', () => {
  it('appends CHF suffix', () => {
    expect(formatCurrency(80000)).toContain('CHF')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('0 CHF')
  })

  it('formats large numbers with locale separators', () => {
    expect(formatCurrency(1000000)).toContain('1')
    expect(formatCurrency(1000000)).toContain('CHF')
  })
})

describe('formatPercent', () => {
  it('appends percent sign', () => {
    expect(formatPercent(5)).toContain('%')
  })

  it('rounds to one decimal place', () => {
    expect(formatPercent(5.123)).toContain('5.1')
  })
})

describe('getProfileStorageKey', () => {
  it('returns guest key when no userId', () => {
    expect(getProfileStorageKey()).toBe('finplan.profil.guest')
  })

  it('includes userId in key', () => {
    expect(getProfileStorageKey('user-abc')).toBe('finplan.profil.user-abc')
  })
})

describe('getVariantenStorageKey', () => {
  it('returns guest key when no userId', () => {
    expect(getVariantenStorageKey()).toBe('finplan.varianten.guest')
  })

  it('includes userId in key', () => {
    expect(getVariantenStorageKey('user-abc')).toBe('finplan.varianten.user-abc')
  })
})

describe('createBasisVariante', () => {
  it('sums bruttoeinkommen + variablesEinkommen + partnerEinkommen', () => {
    const variante = createBasisVariante({ ...DEFAULT_PROFILE, variablesEinkommen: 10000, partnerEinkommen: 20000 })
    expect(variante.einkommen).toBe(80000 + 10000 + 20000)
  })

  it('sets aktienquote to 55 for ausgewogen', () => {
    expect(createBasisVariante(DEFAULT_PROFILE).aktienquote).toBe(55)
  })

  it('sets aktienquote to 80 for dynamisch', () => {
    expect(createBasisVariante({ ...DEFAULT_PROFILE, risikobereitschaft: 'dynamisch' }).aktienquote).toBe(80)
  })

  it('sets aktienquote to 30 for konservativ', () => {
    expect(createBasisVariante({ ...DEFAULT_PROFILE, risikobereitschaft: 'konservativ' }).aktienquote).toBe(30)
  })

  it('sets amortisation to 0 when no mortgage', () => {
    expect(createBasisVariante(DEFAULT_PROFILE).amortisation).toBe(0)
  })

  it('sets positive amortisation when mortgage exists', () => {
    expect(createBasisVariante({ ...DEFAULT_PROFILE, hypothek: 500000 }).amortisation).toBe(500)
  })

  it('always includes a pensionierung event', () => {
    const variante = createBasisVariante(DEFAULT_PROFILE)
    const hasPension = variante.ereignisse.some((e) => e.typ === 'pensionierung')
    expect(hasPension).toBe(true)
  })
})

describe('analyseVariante', () => {
  const variante = createBasisVariante(DEFAULT_PROFILE)
  const result = analyseVariante(variante, DEFAULT_PROFILE)

  it('returns all required output fields', () => {
    const requiredFields = [
      'endvermoegen', 'sparquote', 'steuernTotal', 'tragbarkeitStatus',
      'ahvPrognose', 'pkPrognoseRente', 'vermoegensverlauf',
      'priorisierteMassnahmen', 'risikoScore', 'umsetzungsScore',
    ]
    for (const field of requiredFields) {
      expect(result).toHaveProperty(field)
    }
  })

  it('returns stabil tragbarkeitStatus when no mortgage', () => {
    expect(result.tragbarkeitStatus).toBe('stabil')
  })

  it('returns kritisch tragbarkeitStatus when imputed housing costs exceed 34% of income', () => {
    // hypothek=900k at 5% imputed = 45k interest + 10k liegenschaft + 10k maintenance = 65k
    // annualIncome = 80k → quote = 65/80 = 0.81 → kritisch
    const highMortgage = {
      ...DEFAULT_PROFILE,
      hypothek: 900000,
      hypothekZins: 1.5,
      immobilienwert: 1000000,
      liegenschaftsKostenJahr: 10000,
    }
    const r = analyseVariante(createBasisVariante(highMortgage), highMortgage)
    expect(r.tragbarkeitStatus).toBe('kritisch')
  })

  it('ahvPrognose falls within Swiss AHV min/max range', () => {
    expect(result.ahvPrognose).toBeGreaterThanOrEqual(14000)
    expect(result.ahvPrognose).toBeLessThanOrEqual(35280)
  })

  it('uses explicit ahvRenteJaehrlich when provided', () => {
    const profile = { ...DEFAULT_PROFILE, ahvRenteJaehrlich: 28000 }
    const r = analyseVariante(createBasisVariante(profile), profile)
    expect(r.ahvPrognose).toBe(28000)
  })

  it('vermoegensverlauf covers all years from today to retirement', () => {
    // DEFAULT_PROFILE: age 40 (fallback), retirement 65 → 25 years → 26 entries (0..25)
    expect(result.vermoegensverlauf.length).toBe(26)
  })

  it('sparquote is between 0 and 100', () => {
    expect(result.sparquote).toBeGreaterThanOrEqual(0)
    expect(result.sparquote).toBeLessThanOrEqual(100)
  })

  it('risikoScore is clamped between 25 and 95', () => {
    expect(result.risikoScore).toBeGreaterThanOrEqual(25)
    expect(result.risikoScore).toBeLessThanOrEqual(95)
  })

  it('umsetzungsScore is clamped between 20 and 95', () => {
    expect(result.umsetzungsScore).toBeGreaterThanOrEqual(20)
    expect(result.umsetzungsScore).toBeLessThanOrEqual(95)
  })

  it('recommends 3a Staffelung when only 1 konto and projected balance > 50k', () => {
    // DEFAULT_PROFILE: 1 konto, saule3aGesamt=5000, sparrate3a=5000, 25 years → 5000+125000=130000 > 50k
    expect(result['3aStaffelungEmpfohlen']).toBe(true)
  })

  it('erwarteteRendite reflects aktienquote mix', () => {
    // aktienquote=55: rendite = 0.55*0.06 + 0.45*0.02 = 0.033+0.009 = 0.042 → 4.2%
    expect(result.erwarteteRendite).toBeCloseTo(4.2, 1)
  })

  it('priorisierteMassnahmen has at most 5 items', () => {
    expect(result.priorisierteMassnahmen.length).toBeLessThanOrEqual(5)
  })
})
