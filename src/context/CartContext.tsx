import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

type CartContextValue = {
  cartIds: number[]
  cartCount: number
  cartLoading: boolean
  cartError: string | null
  addToCart: (gemId: number) => Promise<void>
  removeFromCart: (gemId: number) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (gemId: number) => boolean
  isGemUpdating: (gemId: number) => boolean
  isCartUpdating: boolean
}

const CART_STORAGE_KEY = 'yao-gems-trade-satchel'

const CartContext = createContext<CartContextValue | undefined>(undefined)

function getStoredCart() {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsedCart: unknown = storedCart ? JSON.parse(storedCart) : []

    if (!Array.isArray(parsedCart)) return []

    return [...new Set(
      parsedCart.filter(
        (gemId): gemId is number => Number.isInteger(gemId) && gemId > 0,
      ),
    )]
  } catch {
    return []
  }
}

function saveStoredCart(cartIds: number[]) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartIds))
  } catch (error) {
    console.error('Failed to save the guest cart:', error)
  }
}

function clearStoredCart() {
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear the guest cart:', error)
  }
}

function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [cartIds, setCartIds] = useState<number[]>(getStoredCart)
  const [cartLoading, setCartLoading] = useState(true)
  const [cartError, setCartError] = useState<string | null>(null)
  const [pendingGemIds, setPendingGemIds] = useState<number[]>([])
  const [clearingCart, setClearingCart] = useState(false)

  const userId = user?.id

  useEffect(() => {
    let active = true

    async function loadCart() {
      if (authLoading) {
        setCartLoading(true)
        return
      }

      setCartError(null)
      setPendingGemIds([])
      setClearingCart(false)

      if (!userId) {
        setCartIds(getStoredCart())
        setCartLoading(false)
        return
      }

      setCartLoading(true)
      const guestCartIds = getStoredCart()

      if (guestCartIds.length > 0) {
        const rowsToMerge = guestCartIds.map((gemId) => ({
          user_id: userId,
          gem_id: gemId,
        }))

        const { error: mergeError } = await supabase
          .from('cart_items')
          .upsert(rowsToMerge, {
            onConflict: 'user_id,gem_id',
            ignoreDuplicates: true,
          })

        if (!active) return

        if (mergeError) {
          console.error('Failed to merge the guest cart:', mergeError)
          setCartIds(guestCartIds)
          setCartError('Your saved satchel could not be synced. Please try again.')
          setCartLoading(false)
          return
        }
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select('gem_id')
        .order('created_at', { ascending: true })

      if (!active) return

      if (error) {
        console.error('Failed to load the account cart:', error)
        setCartIds(guestCartIds)
        setCartError('Your account satchel could not be loaded. Please try again.')
        setCartLoading(false)
        return
      }

      setCartIds((data ?? []).map((item) => item.gem_id))
      clearStoredCart()
      setCartLoading(false)
    }

    void loadCart()

    return () => {
      active = false
    }
  }, [authLoading, userId])

  const addToCart = useCallback(async (gemId: number) => {
    if (
      cartLoading
      || !Number.isInteger(gemId)
      || gemId <= 0
      || cartIds.includes(gemId)
      || pendingGemIds.includes(gemId)
    ) {
      return
    }

    setCartError(null)

    if (!userId) {
      setCartIds((currentCart) => {
        if (currentCart.includes(gemId)) return currentCart

        const nextCart = [...currentCart, gemId]
        saveStoredCart(nextCart)
        return nextCart
      })
      return
    }

    setPendingGemIds((currentIds) => [...currentIds, gemId])

    const { error } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: userId, gem_id: gemId },
        { onConflict: 'user_id,gem_id', ignoreDuplicates: true },
      )

    if (error) {
      console.error('Failed to add a gem to the account cart:', error)
      setCartError('This gemstone could not be added to your satchel. Please try again.')
    } else {
      setCartIds((currentCart) => (
        currentCart.includes(gemId)
          ? currentCart
          : [...currentCart, gemId]
      ))
    }

    setPendingGemIds((currentIds) => (
      currentIds.filter((currentGemId) => currentGemId !== gemId)
    ))
  }, [cartIds, cartLoading, pendingGemIds, userId])

  const removeFromCart = useCallback(async (gemId: number) => {
    if (cartLoading || pendingGemIds.includes(gemId)) return

    setCartError(null)

    if (!userId) {
      setCartIds((currentCart) => {
        const nextCart = currentCart.filter(
          (currentGemId) => currentGemId !== gemId,
        )
        saveStoredCart(nextCart)
        return nextCart
      })
      return
    }

    setPendingGemIds((currentIds) => [...currentIds, gemId])

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('gem_id', gemId)

    if (error) {
      console.error('Failed to remove a gem from the account cart:', error)
      setCartError('This gemstone could not be removed. Please try again.')
    } else {
      setCartIds((currentCart) => (
        currentCart.filter((currentGemId) => currentGemId !== gemId)
      ))
    }

    setPendingGemIds((currentIds) => (
      currentIds.filter((currentGemId) => currentGemId !== gemId)
    ))
  }, [cartLoading, pendingGemIds, userId])

  const clearCart = useCallback(async () => {
    if (cartLoading || clearingCart) return

    setCartError(null)

    if (!userId) {
      setCartIds([])
      saveStoredCart([])
      return
    }

    setClearingCart(true)

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to clear the account cart:', error)
      setCartError('Your satchel could not be cleared. Please try again.')
    } else {
      setCartIds([])
    }

    setClearingCart(false)
  }, [cartLoading, clearingCart, userId])

  const isInCart = useCallback(
    (gemId: number) => cartIds.includes(gemId),
    [cartIds],
  )

  const isGemUpdating = useCallback(
    (gemId: number) => pendingGemIds.includes(gemId),
    [pendingGemIds],
  )

  const isCartUpdating = pendingGemIds.length > 0 || clearingCart

  const value = useMemo(
    () => ({
      cartIds,
      cartCount: cartIds.length,
      cartLoading,
      cartError,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      isGemUpdating,
      isCartUpdating,
    }),
    [
      addToCart,
      cartError,
      cartIds,
      cartLoading,
      clearCart,
      isCartUpdating,
      isGemUpdating,
      isInCart,
      removeFromCart,
    ],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}

export { CartProvider, useCart }
