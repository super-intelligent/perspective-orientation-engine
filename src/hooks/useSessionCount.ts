'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export function useSessionCount(userId: string | undefined) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    supabase
      .from('user_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .then(({ count: rowCount }) => {
        setCount(rowCount ?? 0)
        setLoading(false)
      })
  }, [userId])

  const increment = useCallback(async () => {
    if (!userId) return
    const { error } = await supabase
      .from('user_sessions')
      .insert({ user_id: userId, completed: false })
    if (!error) {
      setCount((prev) => prev + 1)
    }
  }, [userId])

  return { count, loading, increment }
}
