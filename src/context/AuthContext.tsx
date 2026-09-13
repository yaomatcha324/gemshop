import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'

type AuthContextValue = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSession() {
      const { data } =
        await supabase.auth.getSession()

      if (active) {
        const nextUser = data.session?.user ?? null

        setUser(nextUser)
        setSessionLoading(false)

        if (!nextUser) {
          setAdminLoading(false)
        }
      }
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const nextUser = session?.user ?? null

        setUser(nextUser)
        setSessionLoading(false)

        if (nextUser) {
          setAdminLoading(true)
        } else {
          setIsAdmin(false)
          setAdminLoading(false)
        }
      },
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true

    if (sessionLoading) {
      return () => {
        active = false
      }
    }

    if (!user) {
      setIsAdmin(false)
      setAdminLoading(false)

      return () => {
        active = false
      }
    }

    setAdminLoading(true)
    const userId = user.id

    async function checkAdminStatus() {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!active) return

      if (error) {
        console.error('Failed to check admin status:', error)
        setIsAdmin(false)
      } else {
        setIsAdmin(Boolean(data))
      }

      setAdminLoading(false)
    }

    void checkAdminStatus()

    return () => {
      active = false
    }
  }, [sessionLoading, user])

  async function signOut() {
    const { error } = await supabase.auth.signOut({
      scope: 'local',
    })

    if (error) {
      throw error
    }
  }

  const loading = sessionLoading || adminLoading

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}
