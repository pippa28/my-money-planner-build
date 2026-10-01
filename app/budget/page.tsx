'use client'
import { FinanceAppShell, PageIntro } from '@/components/finance-app-shell'
import { FinanceRecordPage, configs } from '@/components/finance-record-page'
export default function BudgetPage() { return <FinanceAppShell title="My budget"><PageIntro title="My budget" description="Manage saved income and expenses for your selected budgeting period." /><FinanceRecordPage config={configs.budget} /><div className="mt-10"><FinanceRecordPage config={configs.expenses} /></div></FinanceAppShell> }
