'use client'
import { FinanceAppShell } from '@/components/finance-app-shell'
import { FinanceRecordPage, configs } from '@/components/finance-record-page'
export default function DebtsPage() { return <FinanceAppShell title="Debts"><FinanceRecordPage config={configs.debts} /></FinanceAppShell> }
