import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './ui/contexts/AuthContext'
import { AccountProvider } from './ui/contexts/AccountContext'
import { ModalProvider } from './ui/contexts/ModalContext'
import { SuggestionsProvider } from './ui/contexts/SuggestionsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AccountProvider>
          <ModalProvider>
            <SuggestionsProvider>
              <App />
            </SuggestionsProvider>
          </ModalProvider>
        </AccountProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
