import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from './config'

// Get or create user questions document
const getUserQuestionsDoc = async (userId) => {
  const userQuestionsRef = doc(db, 'userQuestions', userId)
  const userQuestionsSnap = await getDoc(userQuestionsRef)
  
  if (!userQuestionsSnap.exists()) {
    // Create initial structure
    await setDoc(userQuestionsRef, {
      userId,
      section1: {},
      section2: {},
      section3: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }
  
  return userQuestionsRef
}

// Save section 1 answer (user A answers about user B)
export const saveSection1Answer = async (userId, friendId, questionId, answer) => {
  try {
    const friendQuestionsRef = await getUserQuestionsDoc(friendId)
    
    // Update section1 with the answer
    const section1Path = `section1.${questionId}`
    const currentData = await getDoc(friendQuestionsRef)
    const currentSection1 = currentData.data()?.section1 || {}
    const currentAnswers = currentSection1[questionId] || []
    
    // Add new answer
    const updatedAnswers = [...currentAnswers, {
      userId,
      answer,
      timestamp: Timestamp.now()
    }]
    
    await updateDoc(friendQuestionsRef, {
      [`section1.${questionId}`]: updatedAnswers,
      updatedAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Error saving section 1 answer:', error)
    return false
  }
}

// Save section 2 answer (user A selects user B)
export const saveSection2Answer = async (userId, friendId, questionId) => {
  try {
    const friendQuestionsRef = await getUserQuestionsDoc(friendId)
    
    // Update section2 with the selection
    const section2Path = `section2.${questionId}`
    const currentData = await getDoc(friendQuestionsRef)
    const currentSection2 = currentData.data()?.section2 || {}
    const currentSelections = currentSection2[questionId] || []
    
    // Add new selection
    const updatedSelections = [...currentSelections, {
      userId,
      timestamp: Timestamp.now()
    }]
    
    await updateDoc(friendQuestionsRef, {
      [`section2.${questionId}`]: updatedSelections,
      updatedAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Error saving section 2 answer:', error)
    return false
  }
}

// Save section 3 comment (user A writes comment for user B)
export const saveSection3Comment = async (userId, friendId, comment) => {
  try {
    const friendQuestionsRef = await getUserQuestionsDoc(friendId)
    
    // Add comment to section3 array
    await updateDoc(friendQuestionsRef, {
      section3: arrayUnion({
        userId,
        comment,
        timestamp: Timestamp.now()
      }),
      updatedAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Error saving section 3 comment:', error)
    return false
  }
}

// Get user questions data
export const getUserQuestions = async (userId) => {
  try {
    const userQuestionsRef = doc(db, 'userQuestions', userId)
    const userQuestionsSnap = await getDoc(userQuestionsRef)
    
    if (userQuestionsSnap.exists()) {
      return userQuestionsSnap.data()
    }
    return null
  } catch (error) {
    console.error('Error fetching user questions:', error)
    return null
  }
}

