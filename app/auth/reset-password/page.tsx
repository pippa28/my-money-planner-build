'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    const { error } = await createClient().auth.updateUser({ password })
    setMessage(error ? 'That reset link is no longer valid.' : 'Your password has been updated. You can now return to your dashboard.')
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#F8F9F6] px-5 text-[#172B3A]"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-[#e4e9e4] bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold">Choose a new password</h1><p className="mt-2 text-sm text-[#718078]">Use at least 8 characters.</p><label className="mt-6 block text-sm font-medium">New password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe7e0] px-3 outline-none focus:border-[#21866B]" /></label>{message && <p role="status" className="mt-4 rounded-xl bg-[#f0f8f1] p-3 text-sm text-[#21866B]">{message}</p>}<button className="mt-5 h-11 w-full rounded-xl bg-[#21866B] font-semibold text-white">Update password</button></form></main>
}
