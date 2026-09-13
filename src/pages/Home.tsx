import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import heroGraphic from '../assets/hero.png'
import { supabase } from '../lib/supabase'
import './Home.css'

type FeaturedGem = {
  id: number
  name: string
  gemType: string
  carat: number
  price: number
  image: string
}

function getImageUrl(path: string) {
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

function Home() {
  const [featuredGems, setFeaturedGems] = useState<FeaturedGem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignoreResult = false

    async function loadFeaturedGems() {
      const { data, error } = await supabase
        .from('gems')
        .select('id, name, gemType, carat, price, image')
        .order('id', { ascending: false })
        .limit(3)

      if (ignoreResult) return

      if (error) {
        console.error('Failed to load featured gems:', error)
        setErrorMessage(error.message)
      } else {
        setFeaturedGems(data ?? [])
      }

      setLoading(false)
    }

    void loadFeaturedGems()

    return () => {
      ignoreResult = true
    }
  }, [])

  const aboutImage = featuredGems[0]?.image
    ? getImageUrl(featuredGems[0].image)
    : null

  return (
    <main className="home-page">
      <section className="home-section home-featured" aria-labelledby="featured-title">
        <div className="home-section-heading">
          <div>
            <h1 id="featured-title" className="home-title">Featured Gems</h1>
          </div>

          <Link className="home-text-link" to="/shop">
            View all gems <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="featured-panel">
          {loading && (
            <div className="home-message">Polishing gems...</div>
          )}

          {errorMessage && (
            <div className="home-message" role="alert">
              Featured gems could not be loaded: {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && featuredGems.length === 0 && (
            <div className="home-message">
              Featured gems will appear here after they are added to Supabase.
            </div>
          )}

          {!loading && !errorMessage && featuredGems.length > 0 && (
            <div className="featured-grid">
              {featuredGems.map((gem) => (
                <Link
                  className="featured-card"
                  to={`/gems/${gem.id}`}
                  key={gem.id}
                >
                  <div className="featured-image-wrap">
                    <img
                      className="featured-image"
                      src={getImageUrl(gem.image)}
                      alt={gem.name}
                    />
                  </div>

                  <div className="featured-card-info">
                    <div>
                      <h2>{gem.name}</h2>
                      <p>{gem.gemType} · {gem.carat} ct</p>
                    </div>
                    <strong>NZ${gem.price.toLocaleString()}</strong>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="home-divider" />

      <section className="home-section home-about" aria-labelledby="about-title">
        <div className="about-copy">
          <h2 id="about-title">About Yao Gems</h2>
          <p>
            Gemstones can be a lot more than a luxury symbol. 
          </p>
          <p>
            Have a look at our gems and admire the beautiful creation of this word.
          </p>
          <Link className="home-outline-link" to="/about">
            Explore more shininess
          </Link>
        </div>

        <div className="about-visual">
          {aboutImage ? (
            <img src={aboutImage} alt="A featured gemstone from Yao Gems" />
          ) : (
            <div className="about-placeholder">
              <img src={heroGraphic} alt="" />
              <span>Natural beauty, carefully selected.</span>
            </div>
          )}
          <div className="about-frame" aria-hidden="true" />
        </div>
      </section>

      <div className="home-divider" />

      <section className="home-section home-collections" aria-labelledby="collections-title">
        <div className="collections-heading">
          <p className="home-eyebrow">Explore</p>
          <h2 id="collections-title">Collections</h2>
        </div>

        <div className="collection-grid">
          <Link className="collection-card collection-card--one" to="/shop">
            <span>01</span>
            <div>
              <p>Curated selection</p>
              <h3>Gallery</h3>
            </div>
          </Link>


        </div>
      </section>
    </main>
  )
}

export default Home
