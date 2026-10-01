'use client'

import { useMemo, useState } from 'react'
import { FileText, Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { read, utils } from 'xlsx'
import { createClient } from '@/lib/supabase/client'
import { FinanceAppShell, EmptyState, PageIntro, FormButton, DataCard } from '@/components/finance-app-shell'

type ImportedRow = { date: string; merchant: string; amount: number; category: string; notes: string }
const categories = ['Essentials', 'Lifestyle', 'Transport', 'Bills', 'Other']

function parseDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const text = String(value ?? '').trim()
  if (!text) return ''
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
}

function parseAmount(value: unknown) {
  const text = String(value ?? '').replace(/[£$,\s]/g, '').replace(/\(([^)]+)\)/, '-$1')
  const amount = Number(text)
  return Number.isFinite(amount) ? amount : NaN
}

function normaliseRows(rows: Record<string, unknown>[]): ImportedRow[] {
  return rows.map((row) => {
    const keys = Object.keys(row)
    const find = (names: string[]) => { const key = keys.find((candidate) => names.some((name) => candidate.toLowerCase().replace(/[^a-z]/g, '').includes(name))); return key ? row[key] : '' }
    const amount = parseAmount(find(['amount', 'value', 'debit', 'credit']))
    return { date: parseDate(find(['date', 'occurred', 'transactiondate'])), merchant: String(find(['merchant', 'description', 'payee', 'details']) || 'Imported transaction'), amount, category: String(find(['category']) || 'Other'), notes: String(find(['note', 'reference', 'memo']) || '') }
  }).filter((row) => row.date && row.merchant && Number.isFinite(row.amount) && row.amount !== 0)
}

export default function BankStatementsPage() {
  const [rows, setRows] = useState<ImportedRow[]>([]); const [file, setFile] = useState<File | null>(null); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [imported, setImported] = useState(false)
  const total = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), [rows])
  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => { const selected = event.target.files?.[0]; if (!selected) return; setFile(selected); setError(''); setMessage(''); setImported(false); try { const buffer = await selected.arrayBuffer(); const workbook = read(buffer, { type: 'array', cellDates: true }); const sheet = workbook.Sheets[workbook.SheetNames[0]]; setRows(normaliseRows(utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' }))) } catch { setRows([]); setError('We could not read that file. Choose a CSV or XLSX with date, merchant/description, and amount columns.') } }
  const importRows = async () => { if (!file || !rows.length) return; setBusy(true); setError(''); const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { setError('Please sign in again before importing.'); setBusy(false); return } const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`; const upload = await supabase.storage.from('bank-statements').upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' }); if (upload.error) { setError('The file could not be stored privately. Please try again.'); setBusy(false); return } const statement = await supabase.from('bank_statements').insert({ user_id: user.id, file_path: path, statement_month: `${rows[0].date.slice(0, 7)}-01` }).select('id').single(); if (statement.error) { await supabase.storage.from('bank-statements').remove([path]); setError('The statement could not be saved. Please try again.'); setBusy(false); return } const transactionRows = rows.map((row) => ({ user_id: user.id, merchant: row.merchant, category: categories.includes(row.category) ? row.category : 'Other', amount: row.amount, occurred_at: `${row.date}T12:00:00Z`, notes: row.notes || `Imported from ${file.name}` })); const inserted = await supabase.from('transactions').insert(transactionRows); if (inserted.error) { setError('The statement was stored, but transactions could not be imported.'); setBusy(false); return } setImported(true); setMessage(`${rows.length} transactions imported securely.`); setBusy(false) }
  return <FinanceAppShell title="Bank statements"><PageIntro title="Bank statements" description="Upload a CSV or XLSX statement. Files remain private to your account and imported rows are previewed before saving." action={<><input id="statement-upload" type="file" accept=".csv,.xlsx" className="hidden" onChange={onFile} /><FormButton onClick={() => document.getElementById('statement-upload')?.click()}><Upload data-icon="inline-start" />Choose file</FormButton></>} />
    {!file && <EmptyState title="No statement selected" description="Choose a CSV or XLSX file to preview and import its transactions." />}
    {file && <DataCard><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-[#1b2f27]">{file.name}</p><p className="text-sm text-[#718078]">{rows.length} valid rows · Net {total >= 0 ? '+' : ''}£{total.toFixed(2)}</p></div>{imported && <CheckCircle2 className="size-5 text-[#21866B]" />}</div>{error && <p className="mt-4 flex items-center gap-2 text-sm text-[#b54747]"><AlertCircle className="size-4" />{error}</p>}{message && <p className="mt-4 text-sm text-[#21866B]">{message}</p>}{rows.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[#edf0ed] text-xs uppercase tracking-wider text-[#91a09a]"><th className="pb-3">Date</th><th className="pb-3">Merchant</th><th className="pb-3">Category</th><th className="pb-3 text-right">Amount</th></tr></thead><tbody>{rows.slice(0, 50).map((row, index) => <tr key={`${row.date}-${index}`} className="border-b border-[#f1f4f1]"><td className="py-3">{row.date}</td><td className="py-3">{row.merchant}</td><td className="py-3">{row.category}</td><td className="py-3 text-right">£{row.amount.toFixed(2)}</td></tr>)}</tbody></table>{rows.length > 50 && <p className="mt-3 text-xs text-[#91a09a]">Showing the first 50 rows.</p>}</div>}<div className="mt-5 flex justify-end"><FormButton disabled={busy || !rows.length || imported} onClick={importRows}>{busy ? <><Loader2 className="size-4 animate-spin" />Importing…</> : imported ? 'Imported' : 'Import transactions'}</FormButton></div></DataCard>}
  </FinanceAppShell>
}
