'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold">Créer un compte</h1>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? 'Création...' : 'Créer mon compte'}
      </button>
      <p className="text-center text-sm text-neutral-500">
        Déjà un compte ?{' '}
        <Link href="/login" className="underline">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
