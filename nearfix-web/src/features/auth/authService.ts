import type { AuthError, Session, User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { UserProfile, UserRole } from '../../types'

type AuthResult<T> = {
  data: T | null
  error: AuthError | Error | null
}

const PUBLIC_SIGNUP_ROLES: UserRole[] = ['customer', 'worker']

function getDisplayNameFromUser(user: User) {
  const fromMeta = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''
  if (fromMeta.trim()) {
    return fromMeta.trim()
  }

  const fromEmail = user.email?.split('@')[0] ?? 'NearFix User'
  return fromEmail.replace(/[._-]+/g, ' ').trim() || 'NearFix User'
}

function getSignupRole(user: User, fallbackRole: UserRole = 'customer'): UserRole {
  const metaRole = user.user_metadata?.role
  if (typeof metaRole === 'string' && PUBLIC_SIGNUP_ROLES.includes(metaRole as UserRole)) {
    return metaRole as UserRole
  }

  return PUBLIC_SIGNUP_ROLES.includes(fallbackRole) ? fallbackRole : 'customer'
}

export async function ensureUserProfile(user: User, fallbackRole: UserRole = 'customer'): Promise<AuthResult<UserProfile>> {
  const { data: existingProfile, error: fetchError } = await supabase
    .from('users')
    .select('id, auth_user_id, name, email, role, created_at')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    return { data: null, error: fetchError }
  }

  if (existingProfile) {
    return { data: existingProfile as UserProfile, error: null }
  }

  const { data: insertedProfile, error: insertError } = await supabase
    .from('users')
    .insert({
      auth_user_id: user.id,
      name: getDisplayNameFromUser(user),
      email: user.email ?? '',
      role: getSignupRole(user, fallbackRole),
    })
    .select('id, auth_user_id, name, email, role, created_at')
    .single()

  if (insertError) {
    return { data: null, error: insertError }
  }

  return { data: insertedProfile as UserProfile, error: null }
}

export async function signUpWithProfile(payload: {
  name: string
  email: string
  password: string
  role: UserRole
}): Promise<AuthResult<{ session: Session | null; profile: UserProfile | null }>> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.name,
        role: payload.role,
      },
    },
  })

  if (error) {
    return { data: null, error }
  }

  if (data.user && data.session) {
    const profileResult = await ensureUserProfile(data.user, payload.role)
    if (profileResult.error) {
      return { data: null, error: profileResult.error }
    }

    return {
      data: {
        session: data.session,
        profile: profileResult.data,
      },
      error: null,
    }
  }

  return {
    data: {
      session: data.session,
      profile: null,
    },
    error: null,
  }
}

export async function signInWithPassword(payload: {
  email: string
  password: string
}): Promise<AuthResult<{ session: Session; profile: UserProfile | null }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  })

  if (error || !data.session || !data.user) {
    return { data: null, error: error ?? new Error('Unable to establish session.') }
  }

  const profileResult = await ensureUserProfile(data.user)
  if (profileResult.error) {
    return { data: null, error: profileResult.error }
  }

  return {
    data: {
      session: data.session,
      profile: profileResult.data,
    },
    error: null,
  }
}

export async function signOutUser() {
  return supabase.auth.signOut()
}
