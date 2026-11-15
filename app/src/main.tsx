import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/theme' // applies the saved theme and follows the phone in Auto
import App from './App.tsx'
import { startRouter } from './lib/router'
import { startUpdates } from './lib/update'

startRouter()
startUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
