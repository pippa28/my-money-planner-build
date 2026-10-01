'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    const { error } = await createClient().auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`, data: { full_name: fullName } } })
    setBusy(false)
    setMessage(error ? 'We could not create that account. Check your details and try again.' : 'Check your email to verify your account, then sign in.')
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#F8F9F6] px-5 py-10 text-[#172B3A]"><div className="w-full max-w-md rounded-3xl border border-[#e4e9e4] bg-white p-8 shadow-sm"><div className="mb-8"><div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-[#21866B] text-white">£</div><h1 className="text-2xl font-bold">Create your workspace</h1><p className="mt-2 text-sm text-[#718078]">Your finances stay private to your account.</p></div><form onSubmit={submit} className="flex flex-col gap-4"><label className="text-sm font-medium">Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe7e0] px-3 outline-none focus:border-[#21866B]" /></label><label className="text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe7e0] px-3 outline-none focus:border-[#21866B]" /></label><label className="text-sm font-medium">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe7e0] px-3 outline-none focus:border-[#21866B]" /></label>{message && <p role="status" className="rounded-xl bg-[#f0f8f1] p-3 text-sm text-[#21866B]">{message}</p>}<button disabled={busy} className="h-11 rounded-xl bg-[#21866B] font-semibold text-white disabled:opacity-60">{busy ? 'Creating…' : 'Create account'}</button></form><p className="mt-6 text-center text-sm text-[#718078]">Already have an account? <Link href="/auth/login" className="font-semibold text-[#21866B]">Sign in</Link></p></div></main>
}
