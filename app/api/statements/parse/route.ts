import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { diagnosticForPdfError, parseStatementItems, type PdfTextItem } from '@/lib/statement-parser'

export const runtime = 'nodejs'
const MAX_BYTES = 15 * 1024 * 1024
const BANKS = ['HSBC', 'Barclays', 'Lloyds', 'NatWest', 'Monzo', 'Starling', 'Santander', 'Halifax', 'Nationwide', 'Revolut', 'TSB', 'Metro Bank', 'The Co-operative Bank']

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const form = await request.formData(); const file = form.get('file'); if (!(file instanceof File) || file.type !== 'application/pdf') return NextResponse.json({ error: 'Upload a PDF bank statement.' }, { status: 400 }); if (file.size > MAX_BYTES) return NextResponse.json({ error: 'PDFs must be 15 MB or smaller.' }, { status: 413 })
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const bytes = new Uint8Array(await file.arrayBuffer())
    const document = await pdfjs.getDocument({ data: bytes, isEvalSupported: false }).promise
    const items: PdfTextItem[] = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) { const page = await document.getPage(pageNumber); const content = await page.getTextContent(); for (const item of content.items) { if ('str' in item && 'transform' in item) items.push({ str: item.str, x: item.transform[4], y: item.transform[5], page: pageNumber }) } }
    const parsed = parseStatementItems(items); const bankName = BANKS.find((bank) => new RegExp(bank.replace(' ', '\\s+'), 'i').test(items.map((item) => item.str).join(' '))) ?? ''; const hardFailure = parsed.rows.length === 0
    return NextResponse.json({ bankName, pageCount: document.numPages, selectableText: items.length > 0, rows: parsed.rows, diagnostics: parsed.diagnostics, openingBalance: parsed.openingBalance, closingBalance: parsed.closingBalance, totals: parsed.totals }, { status: hardFailure ? 422 : 200 })
  } catch (error) { const diagnostic = diagnosticForPdfError(error); return NextResponse.json({ error: diagnostic.detail, diagnostics: [diagnostic], rows: [] }, { status: 422 }) }
}
