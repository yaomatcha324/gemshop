import './FAQ.css'

const FAQ_ITEMS = [
  {
    question: 'Are all gemstones natural?',
    answer:
      'Yes! All gems are 100% natural and accept any gem lab tests. Some gems may have heat treatmemt whcih is a widely accepted treatment for gemstones.',
  },
  {
    question: 'What is the 72h inspection period?',
    answer:
      'There is an inspection period for most stones. This period starts after you receive the gemstone. During this period, we offer a offer a no-questions-asked return policy, the customer will pay for courier or shipping fees if applicable. This means that, for every stone you like, you will get a chance to have a look at it on your hands.',
  },
  {
    question: 'Do the gemstones come with certificates?',
    answer:
      'Some gemstones include an independent laboratory certificate. When a certificate is available, its laboratory and certificate number will be shown on the gemstone details page.',
  },
  {
    question: 'Can I request more photos or videos?',
    answer:
      'Yes! You are welcome to contact us before purchasing if you would like to see additional photos or videos of a gemstone in different lighting.',
  },
  {
    question: 'Do you ship outside New Zealand?',
    answer:
      'We can ship outside of New Zealand with request, but there will be no inspection period.',
  },
  {
    question: 'How should I care for my gemstone?',
    answer:
      'Different gemstones require different care. Keep your stone away from harsh chemicals and sudden temperature changes, and ask us if you need advice for a particular gem.',
  },
]

function FAQ() {
  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="faq-heading">
        <p>FAQ</p>
        <h2 id="faq-title">RULES OF THE HOARD</h2>
      </div>

      <div className="faq-list">
        {FAQ_ITEMS.map((faq) => (
          <details className="faq-item" key={faq.question}>
            <summary>
              <span>{faq.question}</span>
              <span className="faq-icon" aria-hidden="true">+</span>
            </summary>

            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default FAQ
