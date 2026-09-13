import FAQ from '../components/FAQ'
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
            Gemstones and more
          </h1>

          <p className="about-intro">
            Hi, I'm Yao — 
            and this is my online independent gemstone shop based in Auckland, New Zealand.
          </p>

          <p>
            I've always been fascinated by gemstones, especially stones
            with unusual colours and interesting fires.
          </p>

          <p>
            When people think of gemstones, engagement rings, and commitment, diamonds are often the first thing that comes to mind. But they are far from the only choice.
            There is an entire world of colourful, distinctive, and often more affordable gemstones waiting to be discovered.
          </p>

          <p>
            A meaningful piece of jewellery does not have to follow a formula.
            The stone you choose can reflect a colour you love, a memory, a person, or simply something that feels unmistakably yours.
          </p>

        </div>

      </section>

      <FAQ />

    </main>
  )
}

export default About
