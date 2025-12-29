import './DisclaimerPopup.css'

const DisclaimerPopup = ({ onClose }) => {
  return (
    <div className="disclaimer-overlay" onClick={onClose}>
      <div className="disclaimer-popup" onClick={(e) => e.stopPropagation()}>
        <div className="disclaimer-header">
          <div className="caution-icon">⚠️</div>
          <h2>تنبيه مهم!</h2>
        </div>
        <div className="disclaimer-content">
          <p>
            جميع معلوماتك ستكون مجهولة تماماً ولن يتمكن أي شخص من معرفة أي شيء عنك.
            نحن نضمن خصوصيتك الكاملة.
          </p>
        </div>
        <button className="disclaimer-button" onClick={onClose}>
          فهمت
        </button>
      </div>
    </div>
  )
}

export default DisclaimerPopup

