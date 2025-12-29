import { collection, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './config'

export const saveUserMetrics = async (userId, metrics) => {
  try {
    const metricsRef = doc(db, 'userMetrics', userId)
    await setDoc(metricsRef, {
      ...metrics,
      lastUpdated: new Date()
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Error saving user metrics:', error)
    return false
  }
}

export const getUserMetrics = async (userId) => {
  try {
    const metricsRef = doc(db, 'userMetrics', userId)
    const metricsSnap = await getDoc(metricsRef)
    
    if (metricsSnap.exists()) {
      return metricsSnap.data()
    }
    return null
  } catch (error) {
    console.error('Error fetching user metrics:', error)
    return null
  }
}

