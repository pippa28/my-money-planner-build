import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const MAX_BYTES = 15 * 1024 * 1024
const BANKS = ['HSBC', 'Barclays', 'Lloyds', 'NatWest', 'Monzo', 'Starling', 'Santander', 'Halifax', 'Nationwide', 'Revolut', 'TSB', 'Metro Bank', 'The Co-operative Bank']
type ParsedRow = { date: string; description: string; moneyIn: number; moneyOut: number; balance: number | null }
type Diagnostic = { code: string; detail: string }

function parseDate(value: string, statementYear?: number) {
  const normalized = value.replace(/[.]/g, '/').replace(/\s+/g, ' ').trim()
  const numeric = normalized.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/)
  if (numeric) { const year = numeric[3] ? (numeric[3].length === 2 ? 2000 + Number(numeric[3]) : Number(numeric[3])) : statementYear; if (!year) return ''; return `${year}-${numeric[2].padStart(2, '0')}-${numeric[1].padStart(2, '0')}` }
  const named = normalized.match(/^(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{2,4}))?$/)
  if (!named) return ''
  const month = new Date(`${named[2]} 1, 2000`).getMonth() + 1; const year = named[3] ? (named[3].length === 2 ? 2000 + Number(named[3]) : Number(named[3])) : statementYear
  return month && year ? `${year}-${month.toString().padStart(2, '0')}-${named[1].padStart(2, '0')}` : ''
}

function parseMoney(value: string) {
  const negative = /^[-(]/.test(value.trim()) || /DR$/i.test(value.trim())
  const cleaned = value.replace(/[£,\s()]/g, '').replace(/(CR|DR)$/i, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? (negative ? -Math.abs(parsed) : Math.abs(parsed)) : null
}

function inferYear(text: string) { const years = [...text.matchAll(/\b(20\d{2})\b/g)].map((match) => Number(match[1])).filter((year) => year >= 2000 && year <= 2100); return years.sort((a, b) => years.filter((year) => year === b).length - years.filter((year) => year === a).length)[0] }
function findDate(line: string, year?: number) { const match = line.match(/\b\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?\b|\b\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{2,4})?\b/); return match ? { raw: match[0], date: parseDate(match[0], year) } : null }
function moneyTokens(line: string) { return line.match(/(?:£\s*)?[-(]?\d{1,3}(?:,\d{3})*(?:\.\d{2})\)?(?:\s*(?:CR|DR))?|(?:£\s*)?[-(]?\d+\.\d{2}\)?(?:\s*(?:CR|DR))?/gi) ?? [] }

function parseRows(text: string): { rows: ParsedRow[]; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = []; const rows: ParsedRow[] = []; const year = inferYear(text); let pending: { date: string; description: string; values: number[] } | null = null
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean)
  const flush = () => { if (!pending) return; const values = pending.values; if (!pending.description || !values.length) { pending = null; return } const debitCredit = /\b(?:debit|paid out|withdrawal|payment|direct debit|card purchase|out)\b/i.test(pending.description); const credit = /\b(?:credit|paid in|deposit|salary|refund|in)\b/i.test(pending.description); const movement = values.length > 1 ? values[values.length - 2] : values[0]; const balance = values.length > 1 ? values[values.length - 1] : null; rows.push({ date: pending.date, description: pending.description, moneyIn: credit && !debitCredit ? Math.abs(movement) : 0, moneyOut: debitCredit ? Math.abs(movement) : (!credit ? Math.abs(movement) : 0), balance }); pending = null }
  for (const line of lines) {
    const dateMatch = findDate(line, year)
    if (dateMatch?.date) { flush(); const rest = line.replace(dateMatch.raw, ' ').trim(); const values = moneyTokens(rest).map(parseMoney).filter((value): value is number => value !== null); const description = rest.replace(/(?:£\s*)?[-(]?\d{1,3}(?:,\d{3})*(?:\.\d{2})\)?(?:\s*(?:CR|DR))?/gi, ' ').replace(/\s+/g, ' ').trim(); pending = { date: dateMatch.date, description, values }; continue }
    if (pending && !moneyTokens(line).length && !/^(page|opening|closing|balance|sort code|account|statement|date|description|money in|money out)/i.test(line)) pending.description = `${pending.description} ${line}`.trim()
    else if (pending && moneyTokens(line).length) pending.values.push(...moneyTokens(line).map(parseMoney).filter((value): value is number => value !== null))
  }
  flush()
  if (!year && rows.length === 0) diagnostics.push({ code: 'missing_year', detail: 'No statement year was found for day/month-only dates.' })
  if (!rows.length) diagnostics.push({ code: 'no_transaction_rows', detail: 'No lines matched a supported UK transaction date and amount pattern.' })
  if (rows.length && rows.some((row) => !row.description || (row.moneyIn === 0 && row.moneyOut === 0))) diagnostics.push({ code: 'ambiguous_columns', detail: 'Some rows have no clear description or debit/credit direction and require manual review.' })
  return { rows, diagnostics }
}

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const form = await request.formData(); const file = form.get('file'); if (!(file instanceof File) || file.type !== 'application/pdf') return NextResponse.json({ error: 'Upload a PDF bank statement.' }, { status: 400 }); if (file.size > MAX_BYTES) return NextResponse.json({ error: 'PDFs must be 15 MB or smaller.' }, { status: 413 })
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs'); const document = await pdfjs.getDocument({ data: Buffer.from(await file.arrayBuffer()), password: () => { throw new Error('PASSWORD_REQUIRED') } }).promise; let text = ''
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) { const page = await document.getPage(pageNumber); const content = await page.getTextContent(); const items = content.items.filter((item): item is typeof item & { str: string; transform: number[] } => 'str' in item && 'transform' in item); const lines = new Map<number, string[]>(); for (const item of items) { const y = Math.round(item.transform[5]); const line = lines.get(y) ?? []; line.push(item.str); lines.set(y, line) } text += `${[...lines.entries()].sort((a, b) => b[0] - a[0]).map(([, value]) => value.join(' ')).join('\n')}\n` }
    const parsed = parseRows(text); if (!parsed.rows.length) return NextResponse.json({ error: 'No transactions were extracted. This may be an image-only scan or an unsupported layout.', diagnostics: parsed.diagnostics, pageCount: document.numPages, selectableText: text.trim().length > 0, rows: [] }, { status: 422 })
    const bankName = BANKS.find((bank) => new RegExp(bank.replace(' ', '\\s+'), 'i').test(text)) ?? ''; const totals = parsed.rows.reduce((result, row) => ({ moneyIn: result.moneyIn + row.moneyIn, moneyOut: result.moneyOut + row.moneyOut }), { moneyIn: 0, moneyOut: 0 })
    return NextResponse.json({ bankName, pageCount: document.numPages, selectableText: true, rows: parsed.rows, diagnostics: parsed.diagnostics, totals })
  } catch (error) { const code = error instanceof Error && error.message === 'PASSWORD_REQUIRED' ? 'password_protected' : 'pdf_parse_failed'; const message = code === 'password_protected' ? 'This PDF is password-protected. Create an unlocked copy in your banking app and try again.' : 'This PDF could not be read safely. It may be corrupted or use an unsupported encoding.'; return NextResponse.json({ error: message, diagnostics: [{ code, detail: message }], rows: [] }, { status: 422 }) }
}
