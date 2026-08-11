import GemCard from '../components/GemCard'

function Shop() {
  return (
    <main>
      <h1>Shop Gems</h1>

      <div>
        <GemCard
          id={1}
          name="Madagascar Blue Sapphire"
          gemType="Sapphire"
          carat={1.2}
          price={1500}
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