import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { getQuestions } from '../firebase/questions'

export const calculateUserMetrics = async (userId) => {
  try {
    // Get all answers for this user
    const answersRef = collection(db, 'answers')
    const q = query(answersRef, where('friendId', '==', userId))
    const answersSnapshot = await getDocs(q)
    
    const allAnswers = answersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Get all questions
    const questions = await getQuestions()
    const section1Questions = questions.filter(q => q.category === 'section1')
    const section2Questions = questions.filter(q => q.category === 'section2')

    // Calculate section 1 metrics (pie charts for each question)
    const section1Metrics = {}
    section1Questions.forEach(question => {
      const questionAnswers = allAnswers.filter(a => a.questionId === question.id)
      const counts = {
        strongly_agree: 0,
        agree: 0,
        disagree: 0,
        strongly_disagree: 0
      }
      
      questionAnswers.forEach(answer => {
        if (counts.hasOwnProperty(answer.answer)) {
          counts[answer.answer]++
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
      // In section 2, the answer field contains the friendId that was chosen
      const questionAnswers = allAnswers.filter(a => 
        a.questionId === question.id && a.answer === userId
      )
      
      section2Metrics[question.id] = {
        question: question.question,
        count: questionAnswers.length
      }
    })

    // Get section 3 comments
    const section3Comments = allAnswers
      .filter(a => a.section === 3 && a.comment)
      .map(a => ({
        comment: a.comment,
        userId: a.userId,
        timestamp: a.timestamp?.toDate() || new Date()
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

