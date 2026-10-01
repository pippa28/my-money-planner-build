import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const MAX_BYTES = 15 * 1024 * 1024

function parseDate(text: string) {
  const match = text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/)
  if (!match) return ''
  const year = match[3].length === 2 ? Number(`20${match[3]}`) : Number(match[3])
  return `${year.toString().padStart(4, '0')}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
}

function amount(value: string) {
  const cleaned = value.replace(/[£,\s]/g, '').replace(/[()]/g, '')
  const number = Number(cleaned)
  return Number.isFinite(number) ? number : 0
}

function extractRows(text: string) {
  const rows: { date: string; description: string; moneyIn: number; moneyOut: number; balance: number | null }[] = []
  for (const line of text.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)) {
    const dateMatch = line.match(/^((?:\d{1,2}[\/.-]){2}\d{2,4})\s+(.*)$/)
    if (!dateMatch) continue
    const date = parseDate(dateMatch[1]); const numbers = dateMatch[2].match(/(?:£|\(?-?\d[\d,]*\.\d{2}\)?)/g) ?? []
    if (!date || numbers.length === 0) continue
    const description = dateMatch[2].replace(/(?:£|\(?-?\d[\d,]*\.\d{2}\)?)/g, '').replace(/\s{2,}/g, ' ').trim()
    const values = numbers.map(amount); const last = values[values.length - 1]; const hasBalance = values.length > 1
    const movement = values[0]
    rows.push({ date, description: description || 'Imported transaction', moneyIn: /\b(?:paid in|credit|deposit)\b/i.test(line) ? movement : 0, moneyOut: /\b(?:paid out|debit|payment|direct debit)\b/i.test(line) ? movement : 0, balance: hasBalance ? last : null })
  }
  return rows
}

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const form = await request.formData(); const file = form.get('file')
  if (!(file instanceof File) || file.type !== 'application/pdf') return NextResponse.json({ error: 'Upload a PDF bank statement.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'PDFs must be 15 MB or smaller.' }, { status: 413 })
  const buffer = Buffer.from(await file.arrayBuffer())
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const document = await pdfjs.getDocument({ data: buffer, password: () => { throw new Error('PASSWORD_REQUIRED') } }).promise
    let text = ''
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber); const content = await page.getTextContent()
      text += `${content.items.map((item) => ('str' in item ? item.str : '')).join(' ')}\n`
    }
    const rows = extractRows(text)
    if (!rows.length) return NextResponse.json({ error: 'This PDF has no reliably extractable transaction text. It may be scanned, password-protected, or use an unsupported layout. No data was imported.' }, { status: 422 })
    return NextResponse.json({ bankName: text.match(/(?:HSBC|Barclays|Lloyds|NatWest|Monzo|Starling|Santander|Halifax|Nationwide|Revolut)/i)?.[0] ?? '', pageCount: document.numPages, rows })
  } catch (error) {
    const message = error instanceof Error && error.message === 'PASSWORD_REQUIRED' ? 'This PDF is password-protected. Create an unlocked copy in your banking app and try again.' : 'This PDF could not be processed reliably. No data was imported.'
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
