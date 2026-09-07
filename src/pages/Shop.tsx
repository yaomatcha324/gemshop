import GemCard from '../components/GemCard'
import './Shop.css'


function Shop() {
  return (
    <main>
      <h1>Shop Gems</h1>
      <div className="gem-grid">
 
        <GemCard
          id={1}
          name="Madagascar Blue Sapphire"
          gemType="Sapphire"
          carat={1.2}
          price={1500}
          image="/images/madagascar-sapphire.jpg"
        />

        <GemCard
          id={2}
          name="Mozambique Ruby"
          gemType="Ruby"
          carat={1}
          price={850}
        />

        <GemCard
          id={3}
          name="Orange Garnet"
          gemType="Garnet"
          carat={2.1}
          price={620}
        />

    </div>
    </main>
  )
}

export default Shop