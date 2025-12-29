import './HomeScreen.css'

const HomeScreen = ({ onSelectSection, section2Completed }) => {
  return (
    <div className="home-screen-container">
      <div className="home-sections">
        <button 
          className="home-section-button section-1"
          onClick={() => onSelectSection('evaluation')}
        >
          <div className="section-icon">📊</div>
          <h2 className="section-title">التقييم السنوي</h2>
          <p className="section-description">قم بتقييم أصدقائك</p>
        </button>
        
        <button 
          className={`home-section-button section-2 ${section2Completed ? 'completed' : ''}`}
          onClick={() => !section2Completed && onSelectSection('heart')}
          disabled={section2Completed}
        >
          <div className="section-icon">❤️</div>
          <h2 className="section-title">من القلب للقلب</h2>
          <p className="section-description">
            {section2Completed ? 'تم الإكمال ✓' : 'شارك مشاعرك مع المجموعة'}
          </p>
        </button>
      </div>
    </div>
  )
}

export default HomeScreen

