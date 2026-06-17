// main.jsx
// Entry point. Mounts the studio inside the AppProvider, which loads settings,
// seeds the demo rituals on first run, and persists everything locally.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './store/AppStore.jsx'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
)
