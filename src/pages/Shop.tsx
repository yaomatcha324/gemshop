import { useEffect, useState } from 'react'
import GemCard from '../components/GemCard'
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
  const [gems, setGems] = useState<GemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  return (
    <main className="shop-page">
      <h1>Shop Gems</h1>

      {loading && <p>Loading gems...</p>}

      {errorMessage && (
        <p role="alert">
          Could not load gems: {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && (
        <div className="gem-grid">
          {gems.map((gem) => (
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
      )}
    </main>
  )
}

export default Shop