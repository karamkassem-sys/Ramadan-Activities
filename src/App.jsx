import { useState, useEffect } from 'react'
import CodeEntry from './components/CodeEntry'
import WelcomeScreen from './components/WelcomeScreen'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('personalityTestUser')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('personalityTestUser')
      }
    }
    setLoading(false)
  }, [])

  const handleCodeValid = (validatedUser) => {
    setUser(validatedUser)
    // Store user in localStorage
    localStorage.setItem('personalityTestUser', JSON.stringify(validatedUser))
  }

  if (loading) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: 'var(--text-primary)'
        }}>
          جاري التحميل...
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {!user ? (
        <CodeEntry onCodeValid={handleCodeValid} />
      ) : (
        <WelcomeScreen user={user} />
      )}
    </div>
  )
}

export default App

