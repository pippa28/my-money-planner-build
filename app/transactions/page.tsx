'use client'
import { FinanceAppShell } from '@/components/finance-app-shell'
import { FinanceRecordPage, configs } from '@/components/finance-record-page'
export default function TransactionsPage() { return <FinanceAppShell title="Transactions"><FinanceRecordPage config={configs.transactions} /></FinanceAppShell> }
