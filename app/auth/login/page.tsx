'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    const supabase = createClient()
    const result = resetMode
      ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` })
      : await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (result.error) setMessage(resetMode ? 'We could not send that reset email.' : 'Invalid email or password.')
    else if (resetMode) setMessage('Check your email for a secure reset link.')
    else window.location.assign('/')
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#F8F9F6] px-5 py-10 text-[#172B3A]"><div className="w-full max-w-md rounded-3xl border border-[#e4e9e4] bg-white p-8 shadow-sm"><div className="mb-8"><div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-[#21866B] text-white">£</div><h1 className="text-2xl font-bold">{resetMode ? 'Reset your password' : 'Welcome back'}</h1><p className="mt-2 text-sm text-[#718078]">{resetMode ? 'We’ll email you a secure link.' : 'Sign in to your private money workspace.'}</p></div><form onSubmit={submit} className="flex flex-col gap-4"><label className="text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe7e0] px-3 outline-none focus:border-[#21866B]" /></label>{!resetMode && <label className="text-sm font-medium">Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe7e0] px-3 outline-none focus:border-[#21866B]" /></label>}{message && <p role="status" className="rounded-xl bg-[#f0f8f1] p-3 text-sm text-[#21866B]">{message}</p>}<button disabled={busy} className="h-11 rounded-xl bg-[#21866B] font-semibold text-white disabled:opacity-60">{busy ? 'Please wait…' : resetMode ? 'Send reset link' : 'Sign in'}</button></form><div className="mt-6 flex flex-col gap-3 text-center text-sm text-[#718078]"><button onClick={() => setResetMode(!resetMode)} className="text-[#21866B]">{resetMode ? 'Back to sign in' : 'Forgot your password?'}</button><span>New here? <Link href="/auth/sign-up" className="font-semibold text-[#21866B]">Create an account</Link></span></div></div></main>
}
