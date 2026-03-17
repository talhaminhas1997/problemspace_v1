import { Routes, Route } from 'react-router-dom'
import App from './App'
import { AuthPage } from './pages/AuthPage'
import { ChatPage } from './pages/ChatPage'
import { SettingsPage } from './pages/SettingsPage'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}
