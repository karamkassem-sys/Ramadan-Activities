import { useState, useEffect } from 'react'
import { getResultsMode, setResultsMode } from '../firebase/admin'
import './AdminToggle.css'

const AdminToggle = ({ user, onModeChange }) => {
  const [isResultsMode, setIsResultsMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showWarning, setShowWarning] = useState(false)
  const [pendingMode, setPendingMode] = useState(null)

  useEffect(() => {
    const loadMode = async () => {
      const mode = await getResultsMode()
      setIsResultsMode(mode)
      setLoading(false)
    }
    loadMode()
  }, [])

  const handleToggle = (newMode) => {
    setPendingMode(newMode)
    setShowWarning(true)
  }

  const confirmToggle = async () => {
    setLoading(true)
    const success = await setResultsMode(pendingMode)
    if (success) {
      setIsResultsMode(pendingMode)
      setShowWarning(false)
      setPendingMode(null)
      if (onModeChange) {
        onModeChange(pendingMode)
      }
    }
    setLoading(false)
  }

  const cancelToggle = () => {
    setShowWarning(false)
    setPendingMode(null)
  }

  if (!user?.admin) {
    return null
  }

  if (loading) {
    return <div className="admin-toggle-loading">جاري التحميل...</div>
  }

  return (
    <>
      <div className="admin-toggle-container">
        <span className="toggle-label">وضع النتائج</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isResultsMode}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={loading}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {showWarning && (
        <div className="warning-overlay" onClick={cancelToggle}>
          <div className="warning-popup" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ تنبيه</h3>
            <p>
              {pendingMode
                ? 'سيتم تفعيل وضع النتائج. المستخدمون لن يتمكنوا من رؤية الوضع العادي بعد الآن.'
                : 'سيتم إلغاء تفعيل وضع النتائج والعودة إلى الوضع العادي.'}
            </p>
            <div className="warning-actions">
              <button className="warning-button cancel" onClick={cancelToggle}>
                إلغاء
              </button>
              <button className="warning-button confirm" onClick={confirmToggle}>
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminToggle

