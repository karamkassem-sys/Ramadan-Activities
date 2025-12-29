import { useState, useEffect } from 'react'
import DisclaimerPopup from './DisclaimerPopup'
import HomeScreen from './HomeScreen'
import FriendsList from './FriendsList'
import PersonalityTest from './PersonalityTest'
import Section2Test from './Section2Test'
import ThankYouMessage from './ThankYouMessage'
import ResultsDashboard from './ResultsDashboard'
import AdminToggle from './AdminToggle'
import { getResultsMode } from '../firebase/admin'
import { calculateUserMetrics } from '../utils/calculateMetricsNew'
import { saveUserMetrics } from '../firebase/metrics'
import { getAllUsers } from '../firebase/users'
import { checkSection2Completed, getEvaluatedFriends } from '../firebase/userAnswers'
import './WelcomeScreen.css'

const WelcomeScreen = ({ user }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [currentView, setCurrentView] = useState('home') // 'home', 'friends', 'evaluation', 'section2', 'thankyou', 'section2thankyou'
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [completedFriend, setCompletedFriend] = useState(null)
  const [resultsMode, setResultsMode] = useState(false)
  const [checkingMode, setCheckingMode] = useState(true)
  const [section2Completed, setSection2Completed] = useState(false)
  const [evaluatedFriends, setEvaluatedFriends] = useState([])

  useEffect(() => {
    const checkMode = async () => {
      const mode = await getResultsMode()
      setResultsMode(mode)
      setCheckingMode(false)
      
      // Check if user completed section 2
      const completed = await checkSection2Completed(user.id)
      setSection2Completed(completed)
      
      // Get evaluated friends
      const evaluated = await getEvaluatedFriends(user.id)
      setEvaluatedFriends(evaluated)
      
      // If results mode is enabled, calculate metrics for all users
      if (mode) {
        await calculateAllMetrics()
      }
    }
    checkMode()
  }, [user])

  const calculateAllMetrics = async () => {
    try {
      const allUsers = await getAllUsers()
      for (const u of allUsers) {
        const metrics = await calculateUserMetrics(u.id)
        if (metrics) {
          await saveUserMetrics(u.id, metrics)
        }
      }
    } catch (error) {
      console.error('Error calculating all metrics:', error)
    }
  }

  const handleModeChange = async (newMode) => {
    setResultsMode(newMode)
    if (newMode) {
      await calculateAllMetrics()
    }
  }

  const handleDisclaimerClose = () => {
    setShowDisclaimer(false)
  }

  const handleSelectSection = (section) => {
    if (section === 'evaluation') {
      setCurrentView('friends')
    } else if (section === 'heart') {
      setCurrentView('section2')
    }
  }

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend)
    setCurrentView('evaluation')
  }

  const handleEvaluationComplete = () => {
    setCompletedFriend(selectedFriend)
    setCurrentView('thankyou')
    setSelectedFriend(null)
  }

  const handleSection2Complete = () => {
    setSection2Completed(true)
    setCurrentView('section2thankyou')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedFriend(null)
    setCompletedFriend(null)
    // Refresh evaluated friends list
    getEvaluatedFriends(user.id).then(setEvaluatedFriends)
  }

  const handleBackToFriends = () => {
    setCurrentView('friends')
    setCompletedFriend(null)
    // Refresh evaluated friends list
    getEvaluatedFriends(user.id).then(setEvaluatedFriends)
  }

  if (checkingMode) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: 'var(--text-primary)'
      }}>
        جاري التحميل...
      </div>
    )
  }

  // If results mode is enabled, show dashboard instead of normal flow
  if (resultsMode) {
    return (
      <>
        <div className="welcome-header">
          <div className="welcome-header-content">
            <h1 className="welcome-title">مرحباً {user.name}</h1>
            {user.admin && (
              <AdminToggle user={user} onModeChange={handleModeChange} />
            )}
          </div>
        </div>
        <ResultsDashboard user={user} />
      </>
    )
  }

  if (showDisclaimer) {
    return <DisclaimerPopup onClose={handleDisclaimerClose} />
  }

  if (currentView === 'section2thankyou') {
    return (
      <>
        <div className="welcome-header">
          <div className="welcome-header-content">
            <h1 className="welcome-title">مرحباً {user.name}</h1>
          </div>
        </div>
        <ThankYouMessage 
          friendName="من القلب للقلب" 
          onBack={handleBackToHome}
        />
      </>
    )
  }

  if (currentView === 'thankyou' && completedFriend) {
    return (
      <>
        <div className="welcome-header">
          <div className="welcome-header-content">
            <h1 className="welcome-title">مرحباً {user.name}</h1>
          </div>
          <button className="back-to-home-button" onClick={handleBackToFriends}>
            ← العودة للصفحة الرئيسية
          </button>
        </div>
        <ThankYouMessage 
          friendName={completedFriend.name} 
          onBack={handleBackToFriends}
        />
      </>
    )
  }

  if (currentView === 'evaluation' && selectedFriend) {
    return (
      <>
        <div className="welcome-header">
          <div className="welcome-header-content">
            <h1 className="welcome-title">مرحباً {user.name}</h1>
          </div>
          <button className="back-to-home-button" onClick={handleBackToFriends}>
            ← العودة للصفحة الرئيسية
          </button>
        </div>
        <PersonalityTest
          currentUser={user}
          selectedFriend={selectedFriend}
          mode="evaluation"
          onComplete={handleEvaluationComplete}
        />
      </>
    )
  }

  if (currentView === 'section2') {
    return (
      <>
        <div className="welcome-header">
          <h1 className="welcome-title">مرحباً {user.name}</h1>
        </div>
        <Section2Test
          currentUser={user}
          onComplete={handleSection2Complete}
          onBack={handleBackToHome}
        />
      </>
    )
  }

  if (currentView === 'friends') {
    return (
      <>
        <div className="welcome-header">
          <div className="welcome-header-content">
            <h1 className="welcome-title">مرحباً {user.name}</h1>
          </div>
          <button className="back-to-home-button" onClick={handleBackToHome}>
            ← العودة للصفحة الرئيسية
          </button>
        </div>
        <FriendsList 
          currentUser={user} 
          onSelectFriend={handleFriendSelect}
          evaluatedFriends={evaluatedFriends}
        />
      </>
    )
  }

  return (
    <>
      <div className="welcome-header">
        <div className="welcome-header-content">
          <h1 className="welcome-title">مرحباً {user.name}</h1>
          {user.admin && (
            <AdminToggle user={user} onModeChange={handleModeChange} />
          )}
        </div>
      </div>
      <HomeScreen 
        onSelectSection={handleSelectSection} 
        section2Completed={section2Completed}
      />
    </>
  )
}

export default WelcomeScreen

