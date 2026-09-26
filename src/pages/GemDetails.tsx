import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import './GemDetails.css'

type Gem = {
  id: number
  name: string
  gemType: string
  colour: string
  origin: string | null
  carat: number
  price: number
  certificate: string | null
  certificateId: string | null
  image: string | null
  images: string[] | null
  description: string | null
}

function getImageUrl(path: string) {
  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(path)

  return data.publicUrl
}

function GemDetails() {
  const { id } = useParams<{ id: string }>()
  const {
    addToCart,
    cartCount,
    cartError,
    cartLoading,
    isGemUpdating,
    isInCart,
  } = useCart()

  const [gem, setGem] = useState<Gem | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadGem() {
      if (!id) {
        setErrorMessage('Gem ID is missing')
        setLoading(false)
        return
      }

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
          image,
          images,
          description
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error('Failed to load gem:', error)
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      setGem(data)
      setLoading(false)
    }

    void loadGem()
  }, [id])

  useEffect(() => {
    setActiveImageIndex(0)
    galleryRef.current?.scrollTo({ left: 0 })
  }, [id])

  const galleryImages = gem
    ? [...new Set([
        ...(gem.images ?? []),
        ...(gem.image ? [gem.image] : []),
      ])]
    : []

  function showImage(index: number) {
    const gallery = galleryRef.current

    if (!gallery) return

    gallery.scrollTo({
      left: gallery.clientWidth * index,
      behavior: 'smooth',
    })
    setActiveImageIndex(index)
  }

  function handleGalleryScroll() {
    const gallery = galleryRef.current

    if (!gallery || gallery.clientWidth === 0) return

    const nextIndex = Math.round(gallery.scrollLeft / gallery.clientWidth)

    if (nextIndex !== activeImageIndex) {
      setActiveImageIndex(nextIndex)
    }
  }

  if (loading) {
    return (
      <main className="gem-details-page">
        <p>Loading gem...</p>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main className="gem-details-page">
        <Link to="/shop" className="gem-details-back">
          ← Back to shop
        </Link>

        <p role="alert">
          Could not load gem: {errorMessage}
        </p>
      </main>
    )
  }

  if (!gem) {
    return (
      <main className="gem-details-page">
        <Link to="/shop" className="gem-details-back">
          ← Back to shop
        </Link>

        <h1>Gem not found</h1>
      </main>
    )
  }

  return (
    <main className="gem-details-page">
      <Link to="/shop" className="gem-details-back">
        ← Back to shop
      </Link>

      <article className="gem-details">
        <div className="gem-gallery">
          <div className="gem-gallery-stage">
            {galleryImages.length > 0 ? (
              <div
                className="gem-gallery-track"
                ref={galleryRef}
                onScroll={handleGalleryScroll}
              >
                {galleryImages.map((image, index) => (
                  <div className="gem-gallery-slide" key={image}>
                    <img
                      src={getImageUrl(image)}
                      alt={`${gem.name} — view ${index + 1}`}
                      className="gem-details-image"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
            ) : (
            <div className="gem-details-no-image">
              No image available
            </div>
            )}

            {galleryImages.length > 1 && (
              <>
                <button
                  className="gem-gallery-arrow gem-gallery-arrow--previous"
                  type="button"
                  aria-label="Show previous image"
                  onClick={() => showImage(activeImageIndex - 1)}
                  disabled={activeImageIndex === 0}
                >
                  ←
                </button>

                <button
                  className="gem-gallery-arrow gem-gallery-arrow--next"
                  type="button"
                  aria-label="Show next image"
                  onClick={() => showImage(activeImageIndex + 1)}
                  disabled={activeImageIndex === galleryImages.length - 1}
                >
                  →
                </button>

                <span className="gem-gallery-count" aria-live="polite">
                  {activeImageIndex + 1} / {galleryImages.length}
                </span>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="gem-gallery-thumbnails" aria-label="Choose product image">
              {galleryImages.map((image, index) => (
                <button
                  className={`gem-gallery-thumbnail${index === activeImageIndex ? ' is-active' : ''}`}
                  type="button"
                  key={image}
                  aria-label={`Show image ${index + 1}`}
                  onClick={() => showImage(index)}
                >
                  <img src={getImageUrl(image)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="gem-details-info">
          <p className="gem-details-type">
            {gem.gemType}
          </p>

          <h1>{gem.name}</h1>

          <dl className="gem-details-list">
            <div>
              <dt>Colour</dt>
              <dd>{gem.colour}</dd>
            </div>

            {gem.origin && (
              <div>
                <dt>Origin</dt>
                <dd>{gem.origin}</dd>
              </div>
            )}

            <div>
              <dt>Carat</dt>
              <dd>{gem.carat} ct</dd>
            </div>

            {gem.certificate && (
              <div>
                <dt>Certificate</dt>
                <dd>
                  {gem.certificate}

                  {gem.certificateId &&
                    ` · ${gem.certificateId}`}
                </dd>
              </div>
            )}
          </dl>

          <p className="gem-details-price">
            NZ${gem.price.toLocaleString()}
          </p>

          <div className="gem-details-cart-actions">
            <button
              type="button"
              onClick={() => void addToCart(gem.id)}
              disabled={cartLoading || isGemUpdating(gem.id) || isInCart(gem.id)}
            >
              {isGemUpdating(gem.id)
                ? 'Adding to Satchel...'
                : isInCart(gem.id)
                  ? 'Already in Satchel'
                  : 'Add to Trade Satchel'}
            </button>

            <Link to="/cart">
              View Satchel{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
          </div>

          <p className="gem-details-cart-note">
            Adding a gemstone to your satchel does not reserve it.
          </p>

          {cartError && (
            <p className="gem-details-cart-error" role="alert">
              {cartError}
            </p>
          )}

        {gem.description && (
        <section className="gem-description">
          <h2>Description</h2>

          <p>{gem.description}</p>
        </section>
      )}
        </div>
      </article>


    </main>
  )
}

export default GemDetails
