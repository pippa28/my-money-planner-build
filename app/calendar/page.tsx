'use client'
import { FinanceAppShell } from '@/components/finance-app-shell'
import { FinanceRecordPage, configs } from '@/components/finance-record-page'
export default function CalendarPage() { return <FinanceAppShell title="Calendar"><FinanceRecordPage config={configs.calendar} /></FinanceAppShell> }
