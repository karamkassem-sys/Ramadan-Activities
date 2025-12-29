import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from './config'

export const getQuestions = async () => {
  try {
    const questionsRef = collection(db, 'questions')
    const q = query(questionsRef, orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

