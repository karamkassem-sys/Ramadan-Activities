import { useState } from 'react'
import { validateUserCode } from '../firebase/users'
import './CodeEntry.css'

const CodeEntry = ({ onCodeValid }) => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!code.trim()) {
      setError('الرجاء إدخال الكود')
      return
    }

    setLoading(true)
    const user = await validateUserCode(code.trim())
    setLoading(false)

    if (user) {
      onCodeValid(user)
    } else {
      setError('الكود غير صحيح')
    }
  }

  return (
    <div className="code-entry-container">
      <div className="code-entry-card">
        <h1 className="code-entry-title">أدخل الكود الخاص بك</h1>
        <form onSubmit={handleSubmit} className="code-entry-form">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="الكود"
            className="code-input"
            disabled={loading}
            autoFocus
          />
          {error && <p className="error-message">{error}</p>}
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CodeEntry

