'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CalendarDays, ChevronDown, CreditCard, LayoutDashboard, Menu, PiggyBank, Settings, ShieldCheck, Wallet, X } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'

export const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard }, { label: 'My Budget', href: '/budget', icon: Wallet }, { label: 'My Debts', href: '/debts', icon: CreditCard }, { label: 'Savings & Goals', href: '/savings', icon: PiggyBank }, { label: 'Calendar', href: '/calendar', icon: CalendarDays },
]

export function getDisplayName(fullName?: string | null, metadataName?: string | null) {
  const name = fullName?.trim() || metadataName?.trim()
  return name || 'Your account'
}

export function getInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length > 1) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'YA'
}

export function FinanceAppShell({ children, title, profileName }: { children: React.ReactNode; title: string; profileName?: string }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [liveName, setLiveName] = useState(getDisplayName(profileName))
  useEffect(() => {
    const supabase = createClient()
    const loadProfile = async () => { const [{ data: user }, { data: profile }] = await Promise.all([supabase.auth.getUser(), supabase.from('profiles').select('full_name').maybeSingle()]); setLiveName(getDisplayName(profile?.full_name, user.user?.user_metadata?.full_name)) }
    loadProfile()
    const onProfileUpdated = (event: Event) => setLiveName(getDisplayName((event as CustomEvent<{ fullName?: string }>).detail?.fullName))
    window.addEventListener('profile-updated', onProfileUpdated)
    return () => window.removeEventListener('profile-updated', onProfileUpdated)
  }, [])
  const displayName = profileName?.trim() || liveName
  const signOut = async () => { await createClient().auth.signOut(); router.push('/auth/login') }
  return <div className="min-h-screen bg-[#F8F9F6] text-[#172B3A]">
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r border-[#e4e9e4] bg-white px-4 py-6 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-3"><Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setOpen(false)}><div className="flex size-9 items-center justify-center rounded-xl bg-[#21866B] text-white"><Wallet className="size-5" /></div><div><div className="text-[15px] font-bold tracking-tight">My Money</div><div className="text-[15px] font-bold leading-3 tracking-tight text-[#21866B]">Planner</div></div></Link><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></Button></div>
      <div className="mt-10 flex flex-1 flex-col"><p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91a09a]">Workspace</p><nav className="flex flex-col gap-1" aria-label="Main navigation">{navItems.map(({ label, href, icon: Icon }) => { const active = pathname === href || (href === '/dashboard' && pathname === '/'); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? 'bg-[#e9f4ed] text-[#21866B]' : 'text-[#718078] hover:bg-[#f5f8f5]'}`}><Icon className="size-[17px]" />{label}</Link> })}</nav><Separator className="my-6 bg-[#edf0ed]" /><Link href="/settings" onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium ${pathname === '/settings' ? 'bg-[#e9f4ed] text-[#21866B]' : 'text-[#718078] hover:bg-[#f5f8f5]'}`}><Settings className="size-[17px]" />Settings</Link></div>
      <div className="rounded-2xl bg-[#f3f8f3] p-3.5"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#21866B]"><ShieldCheck className="size-4" />Your data is private</div><p className="text-[11px] leading-relaxed text-[#718078]">Your records are saved securely to your private account.</p></div>
    </aside>
    <div className="lg:pl-[252px]"><header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e4e9e4] bg-[#F8F9F6]/95 px-5 backdrop-blur-md sm:px-8 lg:px-10"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></Button><h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1></div><DropdownMenu><DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1.5 hover:bg-white"><Avatar className="size-8"><AvatarFallback className="bg-[#dcece1] text-xs font-semibold text-[#21866B]">{getInitials(displayName)}</AvatarFallback></Avatar><span className="hidden text-sm font-semibold sm:block">{displayName}</span><ChevronDown className="hidden size-4 text-[#829089] sm:block" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></header><main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{children}<p className="mt-8 text-center text-[11px] text-[#9aa69f]"><ShieldCheck className="mr-1 inline size-3" />Your financial data is stored privately and protected by Supabase Row Level Security.</p></main></div>
  </div>
}

export function PageIntro({ eyebrow = 'Private workspace', title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) { return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#21866B]">{eyebrow}</p><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2><p className="mt-1 text-sm text-[#718078]">{description}</p></div>{action}</div> }

export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="rounded-2xl border border-dashed border-[#dce5dd] bg-white/60 px-6 py-12 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-[#718078]">{description}</p></div> }

export function FormButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) { return <Button type={onClick ? 'button' : 'submit'} onClick={onClick} disabled={disabled} className="rounded-xl bg-[#21866B] text-white hover:bg-[#176b55]">{children}</Button> }

export function DataCard({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border border-[#e4e9e4] bg-white p-5 shadow-none">{children}</div> }

export function formatMoney(value: number) { return `£${Number(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
export function today() { return new Date().toISOString().slice(0, 10) }
