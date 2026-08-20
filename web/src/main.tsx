import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/slds.css'
import './index.css'
import App from './App.tsx'
import Learn from './routes/Learn.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:slug" element={<Learn />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
