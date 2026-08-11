import './GemCard.css'

type GemCardProps = {
  id: number
  name: string
  gemType: string
  origin?: string
  carat: number
  price: number
  certificate?: string
  certificateId?: string
}

function GemCard({
  id,
  name,
  gemType,
  carat,
  price
}: GemCardProps) {
  return (
    <div className="gem-card">
      <h2>{name}</h2>

      <p>{gemType}</p>
      <p>{carat} ct</p>
      <p>NZ${price}</p>
    </div>
  )
}

export default GemCard