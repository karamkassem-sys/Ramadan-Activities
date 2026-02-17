import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './config'

export const setResultsMode = async (enabled) => {
  try {
    const adminRef = doc(db, 'adminSettings', 'resultsMode')
    await setDoc(adminRef, {
      enabled,
      updatedAt: new Date()
    })
    return true
  } catch (error) {
    console.error('Error setting results mode:', error)
    return false
  }
}

export const getResultsMode = async () => {
  try {
    const adminRef = doc(db, 'adminSettings', 'resultsMode')
    const adminSnap = await getDoc(adminRef)

    if (adminSnap.exists()) {
      return adminSnap.data().enabled || false
    }
    return false
  } catch (error) {
    console.error('Error fetching results mode:', error)
    return false
  }
}

