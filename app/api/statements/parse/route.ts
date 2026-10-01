import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseCsvStatement } from '@/lib/csv-statement-parser'
import { diagnosticForPdfError, parseStatementItems, type PdfTextItem } from '@/lib/statement-parser'

export const runtime = 'nodejs'
const MAX_BYTES = 15 * 1024 * 1024
const BANKS = ['HSBC', 'Barclays', 'Lloyds', 'NatWest', 'Monzo', 'Starling', 'Santander', 'Halifax', 'Nationwide', 'Revolut', 'TSB', 'Metro Bank', 'The Co-operative Bank']

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const form = await request.formData(); const file = form.get('file'); if (!(file instanceof File)) return NextResponse.json({ error: 'Upload a PDF or CSV bank statement.' }, { status: 400 }); if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Files must be 15 MB or smaller.' }, { status: 413 })
  const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
  if (isCsv) { let mapping; const rawMapping = form.get('mapping'); if (typeof rawMapping === 'string' && rawMapping) { try { mapping = JSON.parse(rawMapping) } catch { return NextResponse.json({ error: 'Invalid CSV mapping.' }, { status: 400 }) } } const parsed = parseCsvStatement(await file.text(), mapping); return NextResponse.json({ bankName: parsed.bankName, pageCount: 0, selectableText: true, rows: parsed.rows, columns: parsed.columns, mapping: parsed.mapping, needsMapping: parsed.needsMapping, diagnostics: parsed.diagnostics, openingBalance: null, closingBalance: null, totals: null }, { status: parsed.rows.length ? 200 : 422 }) }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'Upload a PDF or CSV bank statement.' }, { status: 400 })
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs'); const bytes = new Uint8Array(await file.arrayBuffer()); const document = await pdfjs.getDocument({ data: bytes, isEvalSupported: false }).promise; const items: PdfTextItem[] = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) { const page = await document.getPage(pageNumber); const content = await page.getTextContent(); for (const item of content.items) { if ('str' in item && 'transform' in item) items.push({ str: item.str, x: item.transform[4], y: item.transform[5], page: pageNumber }) } }
    const parsed = parseStatementItems(items); const bankName = BANKS.find((bank) => new RegExp(bank.replace(' ', '\\s+'), 'i').test(items.map((item) => item.str).join(' '))) ?? ''; return NextResponse.json({ bankName, pageCount: document.numPages, selectableText: items.length > 0, rows: parsed.rows, diagnostics: parsed.diagnostics, openingBalance: parsed.openingBalance, closingBalance: parsed.closingBalance, totals: parsed.totals }, { status: parsed.rows.length ? 200 : 422 })
  } catch (error) { const diagnostic = diagnosticForPdfError(error); return NextResponse.json({ error: diagnostic.detail, diagnostics: [diagnostic], rows: [] }, { status: 422 }) }
}
