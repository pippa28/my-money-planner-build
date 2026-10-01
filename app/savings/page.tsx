'use client'
import { FinanceAppShell } from '@/components/finance-app-shell'
import { FinanceRecordPage, configs } from '@/components/finance-record-page'
export default function SavingsPage() { return <FinanceAppShell title="Savings"><FinanceRecordPage config={configs.savings} /></FinanceAppShell> }
