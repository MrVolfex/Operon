import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="932872234935-1e5ei5rpjbejvsh09li38qvm9a0qbt36.apps.googleusercontent.com" locale="en">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
