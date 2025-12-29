import { useState, useEffect } from 'react'
import { getQuestions } from '../firebase/questions'
import { saveSection2Answer } from '../firebase/userQuestions'
import { getAllUsers } from '../firebase/users'
import './PersonalityTest.css'

const Section2Test = ({ currentUser, onComplete, onBack }) => {
  const [questions, setQuestions] = useState([])
  const [friends, setFriends] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [questionsData, friendsData] = await Promise.all([
        getQuestions(),
        getAllUsers()
      ])
      
      // Only get section 2 questions
      const section2Questions = questionsData.filter(q => q.category === 'section2')
      setQuestions(section2Questions)
      // Filter out current user from friends list
      setFriends(friendsData.filter(f => f.id !== currentUser.id))
      setLoading(false)
    }
    loadData()
  }, [currentUser])

  const handleSection2Answer = (questionId, friendId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: friendId
    }))
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    const allAnswered = questions.every(q => answers[q.id])
    if (!allAnswered) {
      alert('الرجاء الإجابة على جميع الأسئلة')
      return
    }

    setSubmitting(true)

    try {
      // Save section 2 answers (user selects a friend for each question)
      for (const [questionId, friendId] of Object.entries(answers)) {
        await saveSection2Answer(currentUser.id, friendId, questionId)
      }

      setSubmitting(false)
      onComplete()
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('حدث خطأ أثناء الحفظ. الرجاء المحاولة مرة أخرى.')
      setSubmitting(false)
    }
  }

  const canSubmit = questions.every(q => answers[q.id])

  if (loading) {
    return (
      <div className="personality-test-container">
        <div className="loading">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="personality-test-container">
      <div className="test-header">
        <h2 className="test-title">من القلب للقلب</h2>
        <div className="section-indicator">
          {questions.map((_, index) => (
            <span key={index} className={`section-dot ${Object.keys(answers).length > index ? 'active' : ''}`}></span>
          ))}
        </div>
        {onBack && (
          <button className="back-to-home-inline-button" onClick={onBack}>
            ← العودة للصفحة الرئيسية
          </button>
        )}
      </div>

      <div className="test-content">
        <div className="section">
          <h3 className="section-title">شارك مشاعرك</h3>
          {questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <p className="question-text">{index + 1}. {question.question}</p>
              <div className="friends-selection">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    className={`friend-option-button ${answers[question.id] === friend.id ? 'selected' : ''}`}
                    onClick={() => handleSection2Answer(question.id, friend.id)}
                  >
                    {friend.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="section-actions">
            <button 
              className="submit-button" 
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
            >
              {submitting ? 'جاري الحفظ...' : 'إرسال'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Section2Test

