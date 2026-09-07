import { Link } from 'react-router-dom'
import './GemCard.css'

type GemCardProps = {
  id: number
  name: string
  gemType: string
  colour : string
  origin?: string
  carat: number
  price: number
  certificate?: string
  certificateId?: string
  image: string 
}

function GemCard({
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

}: GemCardProps) {
  return (
    <Link to={`/gems/${id}`} className="gem-card-link">
      <article className="gem-card">
        <h2>{name}</h2>
      <img
        src={image}
        alt={name}
        className="gem-card-image"
      />

      <div className="gem-card-info"></div>

        <p>{gemType}</p>
        <p>{colour}</p>

        {origin && (
          <p>Origin: {origin}</p>
        )}

        <p>{carat} ct</p>

        {certificate && (
          <p>
            Certificate: {certificate}
            {certificateId && ` · ${certificateId}`}
          </p>
        )}

        <p className="gem-price">
          NZ${price.toLocaleString()}
        </p>
      </article>
    </Link>
  )
}

export default GemCard