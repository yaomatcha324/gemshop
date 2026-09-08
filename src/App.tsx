import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import GemDetails from './pages/GemDetails'
import Home from './pages/Home'
import Shop from './pages/Shop'
import About from './pages/About'
import Login from './pages/Login'

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
      </Routes>
    </>
  )
}

export default App