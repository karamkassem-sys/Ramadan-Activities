import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from './config'

export const saveAnswer = async (userId, friendId, questionId, answer) => {
  try {
    const answersRef = collection(db, 'answers')
    await addDoc(answersRef, {
      userId,
      friendId,
      questionId,
      answer,
      timestamp: new Date()
    })
    return true
  } catch (error) {
    console.error('Error saving answer:', error)
    return false
  }
}

export const saveSection3Comment = async (userId, friendId, comment) => {
  try {
    const answersRef = collection(db, 'answers')
    await addDoc(answersRef, {
      userId,
      friendId,
      section: 3,
      comment,
      timestamp: new Date()
    })
    return true
  } catch (error) {
    console.error('Error saving section 3 comment:', error)
    return false
  }
}

export const checkIfAlreadyAnswered = async (userId, friendId) => {
  try {
    const answersRef = collection(db, 'answers')
    const q = query(
      answersRef,
      where('userId', '==', userId),
      where('friendId', '==', friendId)
    )
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking if already answered:', error)
    return false
  }
}

