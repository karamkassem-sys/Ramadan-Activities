import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './config'

export const validateUserCode = async (code) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('code', '==', code))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const userDoc = querySnapshot.docs[0]
    return {
      id: userDoc.id,
      ...userDoc.data()
    }
  } catch (error) {
    console.error('Error validating user code:', error)
    return null
  }
}

export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

