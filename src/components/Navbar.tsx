/////the upper navigation bar of the page/////
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, loading, isAdmin } = useAuth()

  return (
    <header className="navbar">
      <h2 className="navbar-logo">
        Yao Gems
      </h2>

      <nav className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/about">About</Link>

        {!loading && isAdmin && (
          <Link to="/admin">Admin</Link>
        )}

        {!loading && (
          user ? (
            <Link to="/mine">Mine</Link>
          ) : (
            <Link to="/login">Login</Link>
          )
        )}
      </nav>
    </header>
  )
}

export default Navbar
