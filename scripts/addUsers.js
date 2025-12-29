import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDl4Tt_CJNWh1sf5en8LejTkuBrPP7naZw",
  authDomain: "n8n-karam-eval.firebaseapp.com",
  projectId: "n8n-karam-eval",
  storageBucket: "n8n-karam-eval.firebasestorage.app",
  messagingSenderId: "101600786045",
  appId: "1:101600786045:web:0633d2a6e55e0f8a94e314"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const users = [
  { name: "أحمد ناصر", code: "k8J#2mP9$vLq1zN!", admin: false },
  { name: "حسين حسن", code: "b7G*5tX3@hR9wE4^", admin: false },
  { name: "حسين شحادة", code: "y2F&9oK4#dM7jP8*", admin: false },
  { name: "حيدر إسبر", code: "s1A@8cZ5%kL3uQ0!", admin: false },
  { name: "شادي جاري", code: "n9V!4bR6#xW2mH5$", admin: false },
  { name: "طارق كبار", code: "t3Y*0uI1@pS7fG4^", admin: false },
  { name: "عباس نصرالله", code: "r6D&5kL9#jX2vN0*", admin: false },
  { name: "عبد المجيد الرفاعي", code: "m8H#2pZ1$wQ9zL7!", admin: false },
  { name: "علي الموسوي", code: "g4B*7nV3@uF6eT1^", admin: false },
  { name: "علي عيسى", code: "c1J&9mK4#dS2yP8*", admin: false },
  { name: "علي نصرالله", code: "q5P@8vX0%kL7tH3!", admin: false },
  { name: "علي وهبة", code: "w9G!4zN6#xR2mK5$", admin: false },
  { name: "كرم قاسم", code: "f3T*0uI1@pS7jG4^", admin: false },
  { name: "محمد العوطة", code: "v6M&5kL9#jH2vN0*", admin: false },
  { name: "محمد ضلح", code: "l8S#2pZ1$wA9zL7!", admin: false },
  { name: "مصطفى شبشول", code: "d4N*7nV3@uK6eT1^", admin: false },
  { name: "نديم عبدالجليل", code: "k1W&9mK4#dB2yP8*", admin: false }
]

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function checkUserExists(code) {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('code', '==', code))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    return false
  }
}

async function addUserWithRetry(user, maxRetries = 3) {
  // Check if user already exists
  const exists = await checkUserExists(user.code)
  if (exists) {
    return { success: true, id: 'exists', message: 'موجود بالفعل' }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        name: user.name,
        code: user.code,
        admin: user.admin
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      if (attempt < maxRetries) {
        console.log(`  محاولة ${attempt + 1}/${maxRetries} للمستخدم ${user.name}...`)
        await sleep(1000 * attempt) // Exponential backoff
      } else {
        return { success: false, error: error.message }
      }
    }
  }
}

async function addUsers() {
  try {
    console.log('بدء إضافة المستخدمين إلى قاعدة البيانات...')
    console.log('الرجاء التأكد من أن قواعد Firestore تسمح بالكتابة على collection "users"\n')
    
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      console.log(`[${i + 1}/${users.length}] جاري إضافة: ${user.name}...`)
      
      const result = await addUserWithRetry(user)
      
      if (result.success) {
        if (result.id === 'exists') {
          console.log(`ℹ المستخدم موجود بالفعل: ${user.name}\n`)
          successCount++
        } else {
          console.log(`✓ تم إضافة المستخدم: ${user.name} (ID: ${result.id})\n`)
          successCount++
        }
      } else {
        console.error(`✗ فشل إضافة المستخدم ${user.name}: ${result.error}\n`)
        failCount++
      }
      
      // Small delay between users to avoid rate limiting
      if (i < users.length - 1) {
        await sleep(500)
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`تم الانتهاء!`)
    console.log(`نجح: ${successCount} مستخدم`)
    console.log(`فشل: ${failCount} مستخدم`)
    console.log('='.repeat(50))
    
    if (failCount > 0) {
      console.log('\nملاحظة: إذا فشل بعض المستخدمين، يمكنك تشغيل السكريبت مرة أخرى.')
      console.log('المستخدمون الموجودون بالفعل لن يتم إضافتهم مرة أخرى.')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('حدث خطأ:', error)
    process.exit(1)
  }
}

addUsers()

