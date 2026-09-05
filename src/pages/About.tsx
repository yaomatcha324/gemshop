import './About.css'

function About() {
  return (
    <main className="about-page">

      <section className="about-hero">

        <div className="about-image-container">
          <img
            src="/about.jpg"
            alt="Yao, founder of Yao Gems"
            className="about-image"
          />
        </div>

        <div className="about-content">
          <p className="about-label">ABOUT YAO GEMS</p>

          <h1>Hi, I'm Yao.</h1>

          <p>
            I'm the founder of Yao Gems, a small independent gemstone
            shop based in New Zealand.
          </p>

          <p>
            I've always been fascinated by gemstones — especially stones
            with unusual colours, interesting origins, and individual
            character.
          </p>

          <p>
            Yao Gems was created to share carefully selected gemstones
            that I genuinely find beautiful and interesting.
          </p>

        </div>

      </section>

    </main>
  )
}

export default About