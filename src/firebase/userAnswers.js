import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from './config'

// Check if user completed section 2 (من القلب للقلب)
// Section 2 is completed when user selects friends for all section2 questions
export const checkSection2Completed = async (userId) => {
  try {
    // Get all section2 questions
    const { getQuestions } = await import('./questions')
    const questions = await getQuestions()
    const section2Questions = questions.filter(q => q.category === 'section2')
    
    if (section2Questions.length === 0) {
      return false
    }
    
    // Check all userQuestions documents to see if this user answered all section2 questions
    const allUserQuestionsRef = collection(db, 'userQuestions')
    const allUserQuestionsSnap = await getDocs(allUserQuestionsRef)
    
    const answeredQuestions = new Set()
    
    for (const docSnap of allUserQuestionsSnap.docs) {
      const userData = docSnap.data()
      const section2 = userData.section2 || {}
      
      // Check if this user answered any section2 question
      for (const questionId in section2) {
        const selections = section2[questionId] || []
        if (selections.some(s => s.userId === userId)) {
          answeredQuestions.add(questionId)
        }
      }
    }
    
    // User completed section2 if they answered all questions
    return answeredQuestions.size === section2Questions.length
  } catch (error) {
    console.error('Error checking section 2 completion:', error)
    return false
  }
}

// Check which friends user has already evaluated
export const getEvaluatedFriends = async (userId) => {
  try {
    const evaluatedFriends = new Set()
    
    // Get all userQuestions documents
    const allUserQuestionsRef = collection(db, 'userQuestions')
    const allUserQuestionsSnap = await getDocs(allUserQuestionsRef)
    
    for (const docSnap of allUserQuestionsSnap.docs) {
      const friendId = docSnap.id
      const userData = docSnap.data()
      
      // Check section1 - if user answered about this friend
      const section1 = userData.section1 || {}
      for (const questionId in section1) {
        const answers = section1[questionId] || []
        if (answers.some(a => a.userId === userId)) {
          evaluatedFriends.add(friendId)
          break
        }
      }
      
      // Check section3 - if user commented on this friend
      const section3 = userData.section3 || []
      if (section3.some(c => c.userId === userId)) {
        evaluatedFriends.add(friendId)
      }
    }
    
    return Array.from(evaluatedFriends)
  } catch (error) {
    console.error('Error getting evaluated friends:', error)
    return []
  }
}

