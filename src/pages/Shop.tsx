import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GemCard from '../components/GemCard'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase.ts'
import './Shop.css'



type GemRow = {
  id: number
  name: string
  gemType: string
  colour: string
  origin: string | null
  carat: number
  price: number
  certificate: string | null
  certificateId: string | null
  image: string
}


function getImageUrl(path: string) {
  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(path)

  return data.publicUrl
}



function Shop() {
  const { cartCount } = useCart()
  const [gems, setGems] = useState<GemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [caratFilter, setCaratFilter] = useState('all')
  const [colourFilter, setColourFilter] = useState('all')
  const [gemTypeFilter, setGemTypeFilter] = useState('all')

  useEffect(() => {
    async function loadGems() {
      const { data, error } = await supabase
        .from('gems')
        .select(`
          id,
          name,
          gemType,
          colour,
          origin,
          carat,
          price,
          certificate,
          certificateId,
          image
        `)
        .order('id', { ascending: true })

      if (error) {
        console.error('Failed to load gems:', error)
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      setGems(data ?? [])
      setLoading(false)
    }

    void loadGems()
  }, [])

  const colours = useMemo(
    () => [...new Set(gems.map((gem) => gem.colour))].sort(),
    [gems],
  )

  const gemTypes = useMemo(
    () => [...new Set(gems.map((gem) => gem.gemType))].sort(),
    [gems],
  )

  const filteredGems = useMemo(
    () => gems.filter((gem) => {
      const matchesCarat = caratFilter === 'all' || gem.carat > 1
      const matchesColour = colourFilter === 'all' || gem.colour === colourFilter
      const matchesGemType = gemTypeFilter === 'all' || gem.gemType === gemTypeFilter

      return matchesCarat && matchesColour && matchesGemType
    }),
    [caratFilter, colourFilter, gemTypeFilter, gems],
  )

  const hasActiveFilters =
    caratFilter !== 'all' || colourFilter !== 'all' || gemTypeFilter !== 'all'

  function resetFilters() {
    setCaratFilter('all')
    setColourFilter('all')
    setGemTypeFilter('all')
  }

  return (
    <main className="shop-page">
      <header className="shop-heading">
        <h1>Shop Gems</h1>

        <Link className="shop-cart-link" to="/cart">
          Trade Satchel <span>{cartCount}</span>
        </Link>
      </header>

      {loading && <p>Digging and cutting gems...</p>}

      {errorMessage && (
        <p role="alert">
          Could not load gems: {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && (
        <>
          <section className="shop-filters" aria-label="Filter gemstones">
            <label className="shop-filter">
              <span>Carat weight</span>
              <select
                value={caratFilter}
                onChange={(event) => setCaratFilter(event.target.value)}
              >
                <option value="all">All carat weights</option>
                <option value="over-one">Over 1 ct</option>
              </select>
            </label>

            <label className="shop-filter">
              <span>Colour</span>
              <select
                value={colourFilter}
                onChange={(event) => setColourFilter(event.target.value)}
              >
                <option value="all">All colours</option>
                {colours.map((colour) => (
                  <option key={colour} value={colour}>{colour}</option>
                ))}
              </select>
            </label>

            <label className="shop-filter">
              <span>Gemstone type</span>
              <select
                value={gemTypeFilter}
                onChange={(event) => setGemTypeFilter(event.target.value)}
              >
                <option value="all">All gemstone types</option>
                {gemTypes.map((gemType) => (
                  <option key={gemType} value={gemType}>{gemType}</option>
                ))}
              </select>
            </label>

            <button
              className="shop-filter-reset"
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              Clear filters
            </button>
          </section>

          <p className="shop-result-count" aria-live="polite">
            {filteredGems.length} {filteredGems.length === 1 ? 'gemstone' : 'gemstones'}
          </p>

          {filteredGems.length > 0 ? (
            <div className="gem-grid">
              {filteredGems.map((gem) => (
                <GemCard
                  key={gem.id}
                  id={gem.id}
                  name={gem.name}
                  gemType={gem.gemType}
                  colour={gem.colour}
                  origin={gem.origin ?? undefined}
                  carat={gem.carat}
                  price={gem.price}
                  certificate={gem.certificate ?? undefined}
                  certificateId={gem.certificateId ?? undefined}
                  image={getImageUrl(gem.image)}
                />
              ))}
            </div>
          ) : (
            <p className="shop-empty-state">
              No gemstones match these filters. Try clearing one of your choices.
            </p>
          )}
        </>
      )}
    </main>
  )
}

export default Shop
