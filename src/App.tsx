import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import AdminRoute from './components/AdminRoute'
import Admin from './pages/Admin'
import GemDetails from './pages/GemDetails'
import Home from './pages/Home'
import Shop from './pages/Shop'
import About from './pages/About'
import Login from './pages/Login'
import Mine from './pages/Mine'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/gems/:id" element={<GemDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mine" element={<Mine />} />
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <Admin />
            </AdminRoute>
          )}
        />
      </Routes>
    </>
  )
}

export default App
