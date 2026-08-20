import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/slds.css'
import './index.css'
import Home from './routes/Home.tsx'
import Dashboard from './routes/Dashboard.tsx'
import Learn from './routes/Learn.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:slug" element={<Learn />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
