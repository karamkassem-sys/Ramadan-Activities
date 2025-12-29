import { useState, useEffect } from 'react'
import { getQuestions } from '../firebase/questions'
import { saveSection1Answer, saveSection2Answer, saveSection3Comment } from '../firebase/userQuestions'
import { getAllUsers } from '../firebase/users'
import './PersonalityTest.css'

const PersonalityTest = ({ currentUser, selectedFriend, mode = 'evaluation', onComplete, onBack }) => {
  const [questions, setQuestions] = useState([])
  const [friends, setFriends] = useState([])
  const [answers, setAnswers] = useState({})
  const [section3Comment, setSection3Comment] = useState('')
  const [currentSection, setCurrentSection] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [questionsData, friendsData] = await Promise.all([
        getQuestions(),
        getAllUsers()
      ])
      
      setQuestions(questionsData)
      // Filter out current user from friends list for section 2
      setFriends(friendsData.filter(f => f.id !== currentUser.id))
      setLoading(false)
    }
    loadData()
  }, [currentUser])

  const section1Questions = questions.filter(q => q.category === 'section1')
  const section2Questions = questions.filter(q => q.category === 'section2')

  const handleSection1Answer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSection2Answer = (questionId, friendId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: friendId
    }))
  }

  const handleNext = () => {
    if (currentSection === 1) {
      // Check if all section 1 questions are answered
      const allAnswered = section1Questions.every(q => answers[q.id])
      if (allAnswered) {
        // If in evaluation mode, skip section 2 and go to section 3
        if (mode === 'evaluation') {
          setCurrentSection(3)
        } else {
          setCurrentSection(2)
        }
      }
    } else if (currentSection === 2) {
      // Check if all section 2 questions are answered
      const allAnswered = section2Questions.every(q => answers[q.id])
      if (allAnswered) {
        setCurrentSection(3)
      }
    }
  }

  const handleBack = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSubmit = async () => {
    if (!section3Comment.trim()) {
      alert('الرجاء كتابة تعليقك النهائي')
      return
    }

    setSubmitting(true)

    try {
      // Save section 1 answers
      const section1Answers = Object.entries(answers).filter(([questionId]) => {
        return section1Questions.some(q => q.id === questionId)
      })
      for (const [questionId, answer] of section1Answers) {
        await saveSection1Answer(currentUser.id, selectedFriend.id, questionId, answer)
      }

      // Save section 2 answers only if not in evaluation mode
      if (mode !== 'evaluation') {
        const section2Answers = Object.entries(answers).filter(([questionId]) => {
          return section2Questions.some(q => q.id === questionId)
        })
        for (const [questionId, friendId] of section2Answers) {
          // friendId is the selected friend's ID
          await saveSection2Answer(currentUser.id, friendId, questionId)
        }
      }

      // Save section 3 comment
      await saveSection3Comment(currentUser.id, selectedFriend.id, section3Comment.trim())

      setSubmitting(false)
      onComplete()
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('حدث خطأ أثناء الحفظ. الرجاء المحاولة مرة أخرى.')
      setSubmitting(false)
    }
  }

  const canProceedSection1 = section1Questions.every(q => answers[q.id])
  const canProceedSection2 = section2Questions.every(q => answers[q.id])

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
        <h2 className="test-title">اختبار الشخصية</h2>
        <p className="test-subtitle">لـ {selectedFriend.name}</p>
        {onBack && (
          <button className="back-to-home-inline-button" onClick={onBack}>
            ← العودة للصفحة الرئيسية
          </button>
        )}
        <div className="section-indicator">
          <span className={`section-dot ${currentSection >= 1 ? 'active' : ''}`}></span>
          {mode !== 'evaluation' && <span className={`section-dot ${currentSection >= 2 ? 'active' : ''}`}></span>}
          <span className={`section-dot ${currentSection >= 3 ? 'active' : ''}`}></span>
        </div>
      </div>

      <div className="test-content">
        {/* Section 1: 4-option questions */}
        {currentSection === 1 && (
          <div className="section">
            <h3 className="section-title">القسم الأول</h3>
            {section1Questions.map((question, index) => {
              // Prepend the friend's name to the question
              const displayQuestion = `${selectedFriend.name} ${question.question}`
              const options = [
                { value: 'strongly_agree', label: 'أوافق بشدة', color: 'green', size: 'large' },
                { value: 'agree', label: 'أوافق', color: 'green', size: 'medium' },
                { value: 'disagree', label: 'لا أوافق', color: 'red', size: 'medium' },
                { value: 'strongly_disagree', label: 'لا أوافق بشدة', color: 'red', size: 'large' }
              ]
              return (
                <div key={question.id} className="question-card">
                  <p className="question-text">{index + 1}. {displayQuestion}</p>
                  <div className="options-circles">
                    {options.map((option) => (
                      <button
                        key={option.value}
                        className={`option-circle ${option.color} ${option.size} ${answers[question.id] === option.value ? 'selected' : ''}`}
                        onClick={() => handleSection1Answer(question.id, option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            <div className="section-actions">
              <button className="next-button" onClick={handleNext} disabled={!canProceedSection1}>
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Friend selection questions */}
        {currentSection === 2 && (
          <div className="section">
            <h3 className="section-title">القسم الثاني</h3>
            {section2Questions.map((question, index) => (
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
              <button className="back-button" onClick={handleBack}>
                السابق
              </button>
              <button className="next-button" onClick={handleNext} disabled={!canProceedSection2}>
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Section 3: Final comment */}
        {currentSection === 3 && (
          <div className="section">
            <h3 className="section-title">القسم الثالث</h3>
            <div className="question-card">
              <p className="question-text">اكتب تعليقك النهائي</p>
              <textarea
                value={section3Comment}
                onChange={(e) => setSection3Comment(e.target.value)}
                className="comment-textarea"
                placeholder="اكتب تعليقك هنا..."
                rows={10}
              />
            </div>
            <div className="section-actions">
              <button className="back-button" onClick={handleBack}>
                السابق
              </button>
              <button 
                className="submit-button" 
                onClick={handleSubmit}
                disabled={submitting || !section3Comment.trim()}
              >
                {submitting ? 'جاري الحفظ...' : 'إرسال'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonalityTest

