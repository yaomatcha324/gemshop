import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import './Cart.css'

type CartGem = {
  id: number
  name: string
  gemType: string
  carat: number
  price: number
  image: string | null
}

function getImageUrl(path: string) {
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

function Cart() {
  const {
    cartIds,
    cartCount,
    cartError,
    cartLoading,
    clearCart,
    isCartUpdating,
    isGemUpdating,
    removeFromCart,
  } = useCart()
  const [gems, setGems] = useState<CartGem[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignoreResult = false

    async function loadCartGems() {
      if (cartIds.length === 0) {
        setGems([])
        setErrorMessage(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from('gems')
        .select('id, name, gemType, carat, price, image')
        .in('id', cartIds)

      if (ignoreResult) return

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      const cartOrder = new Map(cartIds.map((gemId, index) => [gemId, index]))
      const sortedGems = [...(data ?? [])].sort(
        (firstGem, secondGem) => (
          (cartOrder.get(firstGem.id) ?? 0) - (cartOrder.get(secondGem.id) ?? 0)
        ),
      )

      setGems(sortedGems)
      setLoading(false)
    }

    void loadCartGems()

    return () => {
      ignoreResult = true
    }
  }, [cartIds])

  const total = useMemo(
    () => gems.reduce((currentTotal, gem) => currentTotal + gem.price, 0),
    [gems],
  )

  const unavailableCount = Math.max(0, cartCount - gems.length)

  return (
    <main className="cart-page">
      <header className="cart-header">
        <div>
          <p className="cart-eyebrow">Your chosen treasures</p>
          <h1>Trade Satchel</h1>
        </div>

        <Link className="cart-back-link" to="/shop">
          ← Continue exploring
        </Link>
      </header>

      {cartError && (
        <p className="cart-status cart-status--error" role="alert">
          {cartError}
        </p>
      )}

      {(cartLoading || loading) && (
        <p className="cart-status">Opening your satchel...</p>
      )}

      {errorMessage && (
        <p className="cart-status cart-status--error" role="alert">
          Your satchel could not be loaded: {errorMessage}
        </p>
      )}

      {!cartLoading && !loading && !errorMessage && cartCount === 0 && (
        <section className="cart-empty-state">
          <p className="cart-eyebrow">The satchel is empty</p>
          <h2>No treasures have been chosen yet.</h2>
          <p>Explore the hoard and add a gemstone when one catches your eye.</p>
          <Link className="cart-primary-link" to="/shop">
            Enter the Hoard
          </Link>
        </section>
      )}

      {!cartLoading && !loading && !errorMessage && cartCount > 0 && (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Gemstones in your trade satchel">
            {unavailableCount > 0 && (
              <p className="cart-unavailable" role="status">
                {unavailableCount} saved {unavailableCount === 1 ? 'gemstone is' : 'gemstones are'} no longer available.
              </p>
            )}

            {gems.map((gem) => (
              <article className="cart-item" key={gem.id}>
                <Link className="cart-item-image-link" to={`/gems/${gem.id}`}>
                  {gem.image ? (
                    <img src={getImageUrl(gem.image)} alt={gem.name} />
                  ) : (
                    <span>No image</span>
                  )}
                </Link>

                <div className="cart-item-info">
                  <p>{gem.gemType} · {gem.carat} ct</p>
                  <h2>
                    <Link to={`/gems/${gem.id}`}>{gem.name}</Link>
                  </h2>
                  <button
                    type="button"
                    onClick={() => void removeFromCart(gem.id)}
                    disabled={isGemUpdating(gem.id)}
                  >
                    {isGemUpdating(gem.id) ? 'Removing...' : 'Remove'}
                  </button>
                </div>

                <strong>NZ${gem.price.toLocaleString()}</strong>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <p className="cart-eyebrow">Trade summary</p>
            <div>
              <span>{gems.length} {gems.length === 1 ? 'gemstone' : 'gemstones'}</span>
              <strong>NZ${total.toLocaleString()}</strong>
            </div>
            <p>
              Adding a gemstone to your satchel does not reserve it. Availability
              will be confirmed when the trade begins.
            </p>
            <button
              className="cart-clear-button"
              type="button"
              onClick={() => void clearCart()}
              disabled={isCartUpdating}
            >
              {isCartUpdating ? 'Updating...' : 'Clear satchel'}
            </button>
          </aside>
        </div>
      )}
    </main>
  )
}

export default Cart
