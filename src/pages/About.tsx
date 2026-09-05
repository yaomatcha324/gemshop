import './About.css'

function About() {
  return (
    <main className="about-page">

      <section className="about-hero">

        <div className="about-image-wrapper">
          <div className="about-image-glow"></div>

          <img
            src="/about.jpg"
            alt="Yao Gems"
            className="about-image"
          />
        </div>


        <div className="about-content">

          <p className="about-label">
            ABOUT YAO GEMS
          </p>

          <h1>
            Gemstones with
            <span> character.</span>
          </h1>

          <p className="about-intro">
            Hi, I'm Yao — the founder of Yao Gems,
            an independent gemstone shop based in New Zealand.
          </p>

          <p>
            I've always been fascinated by gemstones — especially stones
            with unusual colours, interesting origins, and individual
            character.
          </p>

          <p>
            Rather than looking only for conventional perfection,
            I'm drawn to gemstones that have something distinctive:
            beautiful colour, unusual fire, an interesting cut,
            or simply a personality of their own.
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