import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { supabase } from '../../lib/supabase'
import type { UserProfile, UserRole } from '../../types'
import { ensureUserProfile, signInWithPassword, signOutUser, signUpWithProfile } from './authService'

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (payload: { name: string; email: string; password: string; role: UserRole }) => Promise<{ error: Error | null }>
  signIn: (payload: { email: string; password: string }) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const hydrateProfile = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setProfile(null)
      return
    }

    const { data, error } = await ensureUserProfile(authUser)
    if (!error) {
      setProfile(data)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function initSession() {
      const { data } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      const activeSession = data.session
      setSession(activeSession)
      await hydrateProfile(activeSession?.user ?? null)
      setIsLoading(false)
    }

    void initSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      void hydrateProfile(nextSession?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [hydrateProfile])

  const signUp: AuthContextValue['signUp'] = useCallback(async (payload) => {
    const { data, error } = await signUpWithProfile(payload)

    if (error) {
      return { error }
    }

    if (data?.session) {
      setSession(data.session)
      setProfile(data.profile)
    }

    return { error: null }
  }, [])

  const signIn: AuthContextValue['signIn'] = useCallback(async (payload) => {
    const { data, error } = await signInWithPassword(payload)

    if (error) {
      return { error }
    }

    setSession(data?.session ?? null)
    setProfile(data?.profile ?? null)

    return { error: null }
  }, [])

  const signOut: AuthContextValue['signOut'] = useCallback(async () => {
    const { error } = await signOutUser()

    if (!error) {
      setSession(null)
      setProfile(null)
    }

    return { error }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isAuthenticated: Boolean(session),
      signUp,
      signIn,
      signOut,
    }),
    [session, profile, isLoading, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return context
}
