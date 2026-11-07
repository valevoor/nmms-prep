import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/theme' // applies the saved theme and follows the phone in Auto
import App from './App.tsx'
import { startAnalytics } from './lib/analytics'
import { startUpdates } from './lib/update'

startAnalytics()
startUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
