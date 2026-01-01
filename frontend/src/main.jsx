import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Set base path CSS variable for background images
document.documentElement.style.setProperty('--base-path', import.meta.env.BASE_URL.slice(0, -1))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

