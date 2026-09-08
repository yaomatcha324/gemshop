import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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

  const [gem, setGem] = useState<Gem | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

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
        <div className="gem-details-image-container">
          {gem.image ? (
            <img
              src={getImageUrl(gem.image)}
              alt={gem.name}
              className="gem-details-image"
            />
          ) : (
            <div className="gem-details-no-image">
              No image available
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