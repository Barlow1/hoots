import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages'
import './index.css'

import { Routes } from 'generouted'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>
)
