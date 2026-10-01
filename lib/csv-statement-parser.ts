export type CsvStatementRow = { date: string; description: string; moneyIn: number; moneyOut: number; balance: number | null }

function parseAmount(value: string) {
  const normalized = value.trim().replace(/[£,\s]/g, '').replace(/[()]/g, (mark) => mark === '(' ? '-' : '')
  const amount = Number(normalized.replace(/CR|DR/gi, ''))
  return Number.isFinite(amount) ? amount : 0
}

function splitCsvLine(line: string) {
  const cells: string[] = []; let cell = ''; let quoted = false
  for (let index = 0; index < line.length; index += 1) { const character = line[index]; if (character === '"') { if (quoted && line[index + 1] === '"') { cell += '"'; index += 1 } else quoted = !quoted } else if (character === ',' && !quoted) { cells.push(cell.trim()); cell = '' } else cell += character }
  cells.push(cell.trim()); return cells
}

function toIsoDate(value: string) { const match = value.trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/); if (!match) return ''; const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]); return `${year.toString().padStart(4, '0')}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` }

export function parseCsvStatement(text: string): { rows: CsvStatementRow[]; bankName: string; diagnostics: { code: string; detail: string }[] } {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim()); if (!lines.length) return { rows: [], bankName: '', diagnostics: [{ code: 'empty_csv', detail: 'The CSV file is empty.' }] }
  const header = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase()); const find = (...names: string[]) => header.findIndex((cell) => names.some((name) => cell.includes(name)))
  const dateIndex = find('date', 'transaction date', 'posted'); const descriptionIndex = find('description', 'merchant', 'details', 'narrative', 'memo'); const inIndex = find('money in', 'credit', 'deposit', 'paid in'); const outIndex = find('money out', 'debit', 'withdrawal', 'paid out'); const amountIndex = find('amount', 'value'); const balanceIndex = find('balance', 'running balance')
  if (dateIndex < 0 || descriptionIndex < 0 || (inIndex < 0 && outIndex < 0 && amountIndex < 0)) return { rows: [], bankName: '', diagnostics: [{ code: 'csv_columns_not_recognized', detail: 'We could not identify date, description, and amount columns. Use a CSV with headers such as Date, Description, Amount, Money In, Money Out, or Balance.' }] }
  const rows = lines.slice(1).map(splitCsvLine).map((cells) => { const amount = amountIndex >= 0 ? parseAmount(cells[amountIndex] || '') : 0; const moneyIn = inIndex >= 0 ? Math.abs(parseAmount(cells[inIndex] || '')) : amount > 0 ? amount : 0; const moneyOut = outIndex >= 0 ? Math.abs(parseAmount(cells[outIndex] || '')) : amount < 0 ? Math.abs(amount) : 0; return { date: toIsoDate(cells[dateIndex] || ''), description: cells[descriptionIndex] || 'Imported transaction', moneyIn, moneyOut, balance: balanceIndex >= 0 ? parseAmount(cells[balanceIndex] || '') : null } }).filter((row) => row.date && (row.moneyIn > 0 || row.moneyOut > 0))
  return { rows, bankName: '', diagnostics: rows.length ? [] : [{ code: 'no_valid_transactions', detail: 'No valid transactions were found in this CSV.' }] }
}
