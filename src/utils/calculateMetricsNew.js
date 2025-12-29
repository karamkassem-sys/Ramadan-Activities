import { getUserQuestions } from '../firebase/userQuestions'
import { getQuestions } from '../firebase/questions'

export const calculateUserMetrics = async (userId) => {
  try {
    // Get user questions data
    const userData = await getUserQuestions(userId)
    
    if (!userData) {
      return null
    }

    // Get all questions for reference
    const questions = await getQuestions()
    const section1Questions = questions.filter(q => q.category === 'section1')
    const section2Questions = questions.filter(q => q.category === 'section2')

    // Calculate section 1 metrics (pie charts for each question)
    const section1Metrics = {}
    section1Questions.forEach(question => {
      const questionAnswers = userData.section1?.[question.id] || []
      
      const counts = {
        strongly_agree: 0,
        agree: 0,
        disagree: 0,
        strongly_disagree: 0
      }
      
      questionAnswers.forEach(answerData => {
        if (counts.hasOwnProperty(answerData.answer)) {
          counts[answerData.answer]++
        }
      })
      
      section1Metrics[question.id] = {
        question: question.question,
        counts,
        total: questionAnswers.length
      }
    })

    // Calculate section 2 metrics (how many people chose this user for each question)
    const section2Metrics = {}
    section2Questions.forEach(question => {
      const questionSelections = userData.section2?.[question.id] || []
      
      section2Metrics[question.id] = {
        question: question.question,
        count: questionSelections.length
      }
    })

    // Get section 3 comments (anonymous - no userId)
    const section3Comments = (userData.section3 || []).map(commentData => ({
      comment: commentData.comment,
      timestamp: commentData.timestamp
    }))

    return {
      section1: section1Metrics,
      section2: section2Metrics,
      section3: section3Comments
    }
  } catch (error) {
    console.error('Error calculating metrics:', error)
    return null
  }
}

