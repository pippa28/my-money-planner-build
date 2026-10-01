'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Ellipsis,
  FileText,
  Flag,
  LayoutDashboard,
  Lightbulb,
  Menu,
  PiggyBank,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'My Budget', icon: Wallet },
  { label: 'Transactions', icon: ArrowDownLeft },
  { label: 'Bank Statements', icon: FileText },
  { label: 'Savings', icon: PiggyBank },
  { label: 'Debts', icon: CreditCard },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Forecast', icon: TrendingUp },
  { label: 'Insights', icon: Lightbulb },
]

const trendData = [
  { month: 'Jan', income: 3800, spending: 2460 },
  { month: 'Feb', income: 4100, spending: 2810 },
  { month: 'Mar', income: 4000, spending: 2580 },
  { month: 'Apr', income: 4300, spending: 3020 },
  { month: 'May', income: 4200, spending: 2740 },
  { month: 'Jun', income: 4500, spending: 2890 },
]

const categories = [
  { name: 'Home & utilities', amount: '£820', value: 31, color: '#21866B' },
  { name: 'Food & groceries', amount: '£420', value: 16, color: '#7BB89B' },
  { name: 'Transport', amount: '£265', value: 10, color: '#C6A96B' },
  { name: 'Lifestyle', amount: '£380', value: 14, color: '#8CA4B4' },
  { name: 'Other', amount: '£755', value: 29, color: '#DDE7E1' },
]

const transactions = [
  { merchant: 'Waitrose & Partners', category: 'Food & groceries', date: 'Today, 10:42', amount: '-£64.20', tone: 'bg-[#e9f4ed]', icon: ShoppingBasketIcon },
  { merchant: 'Octopus Energy', category: 'Home & utilities', date: 'Yesterday', amount: '-£118.00', tone: 'bg-[#edf1f5]', icon: ZapIcon },
  { merchant: 'Salary · Acme Ltd', category: 'Income', date: '28 Jun 2024', amount: '+£4,500.00', tone: 'bg-[#e9f4ed]', icon: ArrowUpRight },
  { merchant: 'TfL Travel', category: 'Transport', date: '27 Jun 2024', amount: '-£42.50', tone: 'bg-[#f5efe3]', icon: TrainIcon },
]

function ShoppingBasketIcon({ className }: { className?: string }) { return <span className={className}>⌁</span> }
function ZapIcon({ className }: { className?: string }) { return <span className={className}>ϟ</span> }
function TrainIcon({ className }: { className?: string }) { return <span className={className}>↝</span> }

function Dashboard() {
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F9F6] text-[#172B3A]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r border-[#e4e9e4] bg-white px-4 py-6 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#21866B] text-white shadow-sm"><Wallet className="size-5" /></div>
            <div><div className="text-[15px] font-bold tracking-tight">My Money</div><div className="text-[15px] font-bold leading-3 tracking-tight text-[#21866B]">Planner</div></div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X /></Button>
        </div>
        <div className="mt-10 flex flex-1 flex-col">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91a09a]">Workspace</p>
          <nav className="flex flex-col gap-1" aria-label="Main navigation">
            {navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActive(label); setSidebarOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${active === label ? 'bg-[#e9f4ed] text-[#21866B]' : 'text-[#718078] hover:bg-[#f5f8f5] hover:text-[#172B3A]'}`}><Icon className="size-[17px]" />{label}</button>)}
          </nav>
          <Separator className="my-6 bg-[#edf0ed]" />
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91a09a]">Account</p>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-[#718078] hover:bg-[#f5f8f5]"><Settings className="size-[17px]" />Settings</button>
        </div>
        <div className="rounded-2xl bg-[#f3f8f3] p-3.5"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#21866B]"><ShieldCheck className="size-4" />Your data is private</div><p className="text-[11px] leading-relaxed text-[#718078]">Demo mode is active. Your information isn&apos;t being saved.</p></div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e4e9e4] bg-[#F8F9F6]/95 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></Button><div><p className="text-xs font-medium text-[#829089]">Friday, 28 June 2024</p><h1 className="text-lg font-bold tracking-tight sm:text-xl">Good morning, Olivia</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-4"><Button variant="ghost" size="icon" className="hidden text-[#718078] sm:inline-flex" aria-label="Search"><Search /></Button><Button variant="ghost" size="icon" className="relative text-[#718078]" aria-label="Notifications"><Bell /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#D28A55]" /></Button><Separator orientation="vertical" className="hidden h-7 sm:block" /><DropdownMenu><DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1.5 hover:bg-white"><Avatar className="size-8"><AvatarFallback className="bg-[#dcece1] text-xs font-semibold text-[#21866B]">OC</AvatarFallback></Avatar><span className="hidden text-sm font-semibold sm:block">Olivia Carter</span><ChevronDown className="hidden size-4 text-[#829089] sm:block" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuItem>Preferences</DropdownMenuItem><DropdownMenuItem onClick={() => createClient().auth.signOut().then(() => window.location.assign('/'))}>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2"><Badge className="border-0 bg-[#edf6ef] text-[#21866B] hover:bg-[#edf6ef]">Demo workspace</Badge><span className="text-xs text-[#91a09a]">June 2024</span></div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Your financial overview</h2><p className="mt-1 text-sm text-[#718078]">A clear view of where your money is going this month.</p></div><Button className="w-fit rounded-xl bg-[#21866B] text-white shadow-sm hover:bg-[#176b55]"><Plus data-icon="inline-start" />Add transaction</Button></div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-0 bg-[#21866B] text-white shadow-[0_12px_30px_-16px_rgba(33,134,107,0.6)]"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-white/70">Safe to spend</p><p className="mt-2 text-[30px] font-bold tracking-tight">£1,240<span className="text-base font-medium text-white/70">.80</span></p></div><div className="rounded-xl bg-white/15 p-2.5"><Sparkles className="size-5" /></div></div><div className="mt-5 flex items-center justify-between text-xs text-white/75"><span>until 30 June</span><span className="font-semibold text-white">On track</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[62%] rounded-full bg-white" /></div></CardContent></Card>
            <MetricCard icon={ArrowUpRight} label="Monthly income" value="£4,500.00" detail="+ £250 from last month" positive />
            <MetricCard icon={ArrowDownLeft} label="Monthly outgoings" value="£2,689.20" detail="£210 under budget" positive />
            <MetricCard icon={PiggyBank} label="Total savings" value="£12,840.50" detail="+8.4% this year" positive />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <Card className="border-[#e4e9e4] shadow-none"><CardHeader className="flex-row items-center justify-between pb-2"><div><CardTitle className="text-base">Income vs expenditure</CardTitle><p className="mt-1 text-xs text-[#829089]">Your monthly cash flow over time</p></div><Button variant="outline" size="sm" className="h-8 rounded-lg border-[#e4e9e4] text-xs">Last 6 months <ChevronDown className="ml-1 size-3.5" /></Button></CardHeader><CardContent className="pt-4"><div className="h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ left: -20, right: 8, top: 10 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#21866B" stopOpacity={0.18} /><stop offset="100%" stopColor="#21866B" stopOpacity={0} /></linearGradient><linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C6A96B" stopOpacity={0.16} /><stop offset="100%" stopColor="#C6A96B" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0ed" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#91a09a', fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#91a09a', fontSize: 11 }} tickFormatter={(v) => `£${v / 1000}k`} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e4e9e4', boxShadow: '0 8px 20px rgba(23,43,58,.08)', fontSize: 12 }} formatter={(value) => [`£${Number(value).toLocaleString()}`, '']} /><Area type="monotone" dataKey="income" stroke="#21866B" strokeWidth={2.5} fill="url(#incomeFill)" /><Area type="monotone" dataKey="spending" stroke="#C6A96B" strokeWidth={2.5} fill="url(#spendingFill)" /></AreaChart></ResponsiveContainer></div><div className="mt-2 flex justify-center gap-5 text-xs text-[#718078]"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#21866B]" />Income</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#C6A96B]" />Expenditure</span></div></CardContent></Card>
            <Card className="border-[#e4e9e4] shadow-none"><CardHeader className="pb-1"><CardTitle className="text-base">Spending breakdown</CardTitle><p className="mt-1 text-xs text-[#829089]">This month by category</p></CardHeader><CardContent><div className="relative mx-auto h-[180px] w-[230px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius={57} outerRadius={78} paddingAngle={3} stroke="none">{categories.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-bold">£2,640</span><span className="text-[10px] text-[#829089]">total spent</span></div></div><div className="mt-1 flex flex-col gap-2.5">{categories.slice(0, 4).map((category) => <div key={category.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-[#718078]"><i className="size-2 rounded-full" style={{ backgroundColor: category.color }} />{category.name}</span><span className="font-semibold">{category.amount}</span></div>)}</div></CardContent></Card>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
            <Card className="border-[#e4e9e4] shadow-none"><CardHeader className="flex-row items-center justify-between pb-2"><div><CardTitle className="text-base">Recent transactions</CardTitle><p className="mt-1 text-xs text-[#829089]">Your latest activity</p></div><Button variant="ghost" className="h-8 text-xs font-semibold text-[#21866B] hover:text-[#176b55]">View all <ArrowUpRight className="ml-1 size-3.5" /></Button></CardHeader><CardContent className="pt-2">{transactions.map((transaction) => { const Icon = transaction.icon; return <div key={transaction.merchant} className="flex items-center justify-between border-t border-[#edf0ed] py-3.5 first:border-t-0"><div className="flex min-w-0 items-center gap-3"><div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-[#21866B] ${transaction.tone}`}><Icon /></div><div className="min-w-0"><p className="truncate text-sm font-semibold">{transaction.merchant}</p><p className="mt-0.5 text-xs text-[#829089]">{transaction.category} · {transaction.date}</p></div></div><span className={`ml-3 shrink-0 text-sm font-semibold ${transaction.amount.startsWith('+') ? 'text-[#21866B]' : ''}`}>{transaction.amount}</span></div> })}</CardContent></Card>
            <Card className="border-[#e4e9e4] shadow-none"><CardHeader className="flex-row items-center justify-between pb-2"><div><CardTitle className="text-base">Savings goals</CardTitle><p className="mt-1 text-xs text-[#829089]">You&apos;re making great progress</p></div><Button variant="ghost" size="icon" className="text-[#829089]" aria-label="More savings options"><Ellipsis /></Button></CardHeader><CardContent className="pt-2"><Goal name="Emergency fund" current="£6,200" target="£10,000" progress={62} color="bg-[#21866B]" /><Goal name="Summer holiday" current="£1,850" target="£2,500" progress={74} color="bg-[#C6A96B]" /><Goal name="New home deposit" current="£4,790" target="£25,000" progress={19} color="bg-[#8CA4B4]" /></CardContent></Card>
          </section>

          <section className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Card className="border-[#e4e9e4] shadow-none"><CardHeader className="flex-row items-center justify-between pb-2"><div><CardTitle className="text-base">Upcoming</CardTitle><p className="mt-1 text-xs text-[#829089]">Next 7 days</p></div><CalendarDays className="size-5 text-[#21866B]" /></CardHeader><CardContent className="pt-2"><Upcoming title="Council tax" date="Tomorrow · 29 Jun" amount="£142.00" /><Upcoming title="Monthly savings" date="Monday · 1 Jul" amount="£300.00" /><Upcoming title="Mum&apos;s birthday" date="Thursday · 4 Jul" amount="—" /></CardContent></Card>
            <Card className="border-[#e4e9e4] shadow-none"><CardHeader className="pb-2"><div className="flex items-center gap-2"><Target className="size-5 text-[#21866B]" /><CardTitle className="text-base">Budget performance</CardTitle></div><p className="mt-1 text-xs text-[#829089]">June spending by limit</p></CardHeader><CardContent className="pt-2"><BudgetLine name="Essentials" value="£1,480 / £1,800" progress={82} /><BudgetLine name="Lifestyle" value="£620 / £900" progress={69} /><BudgetLine name="Subscriptions" value="£89 / £120" progress={74} /></CardContent></Card>
            <Card className="border-[#d9e9dc] bg-[#f0f8f1] shadow-none md:col-span-2 xl:col-span-1"><CardContent className="flex h-full flex-col justify-between p-5"><div><div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-white text-[#21866B] shadow-sm"><Lightbulb className="size-5" /></div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#21866B]">A little insight</p><h3 className="mt-2 text-lg font-bold leading-snug">You&apos;ve spent 18% less on dining out this month.</h3><p className="mt-2 text-sm leading-relaxed text-[#718078]">That&apos;s £86.40 back in your pocket. Keep it going!</p></div><Button variant="link" className="mt-4 w-fit px-0 text-[#21866B]">Explore insights <ArrowUpRight className="ml-1 size-4" /></Button></CardContent></Card>
          </section>
          <p className="mt-8 text-center text-[11px] text-[#9aa69f]">This is a demonstration workspace. Data shown is fictional and isn&apos;t saved.</p>
        </main>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, detail, positive }: { icon: typeof ArrowUpRight, label: string, value: string, detail: string, positive?: boolean }) { return <Card className="border-[#e4e9e4] shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-[#829089]">{label}</p><p className="mt-2 text-[25px] font-bold tracking-tight">{value}</p></div><div className="rounded-xl bg-[#f0f6f1] p-2.5 text-[#21866B]"><Icon className="size-5" /></div></div><p className={`mt-4 text-xs font-medium ${positive ? 'text-[#21866B]' : 'text-[#829089]'}`}>{detail}</p></CardContent></Card> }
function Goal({ name, current, target, progress, color }: { name: string, current: string, target: string, progress: number, color: string }) { return <div className="border-t border-[#edf0ed] py-3.5 first:border-t-0"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold">{name}</span><span className="text-xs text-[#829089]">{current} <span className="text-[#b1bab4]">of {target}</span></span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf0ed]"><div className={`h-full rounded-full ${color}`} style={{ width: `${progress}%` }} /></div><p className="mt-1.5 text-[11px] text-[#829089]">{progress}% complete</p></div> }
function Upcoming({ title, date, amount }: { title: string, date: string, amount: string }) { return <div className="flex items-center justify-between border-t border-[#edf0ed] py-3.5 first:border-t-0"><div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs text-[#829089]">{date}</p></div><span className="text-sm font-semibold">{amount}</span></div> }
function BudgetLine({ name, value, progress }: { name: string, value: string, progress: number }) { return <div className="border-t border-[#edf0ed] py-3.5 first:border-t-0"><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">{name}</span><span className="text-xs text-[#829089]">{value}</span></div><Progress value={progress} className="h-2 bg-[#edf0ed]" /></div> }

export default function Page() {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => { setSignedIn(Boolean(data.user)); setReady(true) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)))
    return () => listener.subscription.unsubscribe()
  }, [])
  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-[#F8F9F6] text-sm text-[#718078]">Loading your private workspace…</div>
  if (!signedIn) return <main className="flex min-h-screen items-center justify-center bg-[#F8F9F6] px-5 text-center text-[#172B3A]"><div className="max-w-md"><div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#21866B] text-2xl font-bold text-white">£</div><h1 className="text-3xl font-bold">Your money, privately organised.</h1><p className="mt-3 text-sm leading-relaxed text-[#718078]">Sign in to access your personal dashboard. Every record is protected by your account and Supabase Row Level Security.</p><div className="mt-7 flex justify-center gap-3"><Link href="/auth/login" className="rounded-xl bg-[#21866B] px-5 py-3 text-sm font-semibold text-white">Sign in</Link><Link href="/auth/sign-up" className="rounded-xl border border-[#dfe7e0] bg-white px-5 py-3 text-sm font-semibold">Create account</Link></div></div></main>
  return <Dashboard />
}

