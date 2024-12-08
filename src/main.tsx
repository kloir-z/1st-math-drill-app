import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LearningHistoryProvider } from './contexts/LearningHistoryContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LearningHistoryProvider>
      <App />
    </LearningHistoryProvider>
  </StrictMode>,
)