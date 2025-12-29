import './ThankYouMessage.css'

const ThankYouMessage = ({ friendName, onBack }) => {
  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <div className="thank-you-icon">✓</div>
        <h2 className="thank-you-title">شكراً لك!</h2>
        <p className="thank-you-message">
          {friendName === 'من القلب للقلب' ? (
            'تم حفظ إجاباتك بنجاح'
          ) : (
            <>
              تم حفظ إجاباتك لـ <span className="friend-name-highlight">{friendName}</span> بنجاح
            </>
          )}
        </p>
        <button className="back-to-friends-button" onClick={onBack}>
          {friendName === 'من القلب للقلب' 
            ? 'العودة للصفحة الرئيسية'
            : 'العودة إلى قائمة الأصدقاء'}
        </button>
      </div>
    </div>
  )
}

export default ThankYouMessage

