import './App.css'

function App() {
  return (
    <>
      <header className="site-header">
        <span className="brand">Invite Only Portal</span>
        <nav>
          <a href="#learn">Learn</a>
        </nav>
      </header>

      <main className="hello">
        <p className="eyebrow">⚛️ React + Salesforce</p>
        <h1>Hello World</h1>
        <p className="lead">I&apos;m learning React in Salesforce.</p>
        <p className="sub">
          This is the first homepage of the <strong>Invite Only Portal</strong> —
          a learning project pairing a React front end with a Salesforce org.
        </p>
      </main>

      <footer className="site-footer">
        <p>
          Independent educational project — not affiliated with, endorsed by,
          or connected to Stripe.
        </p>
      </footer>
    </>
  )
}

export default App
