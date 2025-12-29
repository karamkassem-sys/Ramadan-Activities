import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

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

const questions = [
  // Section 1 questions
  { question: "أظهر نموًا شخصيًا ملحوظًا خلال هذا العام.", category: "section1", order: 1 },
  { question: "حافظ على موقف إيجابي حتى في اللحظات الصعبة.", category: "section1", order: 2 },
  { question: "أخذ مسؤولية أخطائه بدلًا من إلقاء اللوم على الآخرين.", category: "section1", order: 3 },
  { question: "سعى لتطوير نفسه أو تعلّم أشياء جديدة هذا العام.", category: "section1", order: 4 },
  { question: "كان متاحًا عاطفيًا عندما احتاجه الأصدقاء.", category: "section1", order: 5 },
  { question: "بذل جهدًا للبقاء على تواصل مع المجموعة (الاطمئنان، الدعوة، السؤال).", category: "section1", order: 6 },
  { question: "يبذل جهدًا للحفاظ على الصداقة (تنظيم اللقاءات، المراسلة، إلخ).", category: "section1", order: 7 },
  { question: "هو شخص يساهم في جعل أجواء المجموعة أفضل.", category: "section1", order: 8 },
  { question: "يدفع الآخرين ليكونوا أفضل (يشجع، يذكر، يدعم).", category: "section1", order: 9 },
  { question: "كان منضبطًا في عاداته الشخصية (النوم، العمل، الصحة، العبادات، إلخ).", category: "section1", order: 10 },
  { question: "يعتذر عندما يخطئ ويغفر عندما يخطئ الآخرون", category: "section1", order: 11 },
  // Section 2 questions
  { question: "من هو الشخص الذي كنت تتمنى أن تشكره هذا العام، ولكن لم تُتَح لك الفرصة؟", category: "section2", order: 1 },
  { question: "من هو الشخص الذي تعلّمت منه أكثر هذا العام؟", category: "section2", order: 2 },
  { question: "مع من كنت تتمنى أن تقضي وقتًا أطول هذا العام؟", category: "section2", order: 3 },
  { question: "وجود مَن في المجموعة جعل هذا العام أفضل بالنسبة لك دون أن يدرك هو ذلك؟", category: "section2", order: 4 },
  { question: "رأي أو نصيحة مَن تحترمها أكثر — حتى وإن كانت مخالفة لرأيك؟", category: "section2", order: 5 },
  { question: "مَن قدّم لك دعمًا — معنويًا، عمليًا، أو بصمت — في الوقت الذي كنت فيه بأمسّ الحاجة؟", category: "section2", order: 6 }
]

async function addQuestions() {
  try {
    console.log('بدء إضافة الأسئلة إلى قاعدة البيانات...')
    
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      console.log(`[${i + 1}/${questions.length}] جاري إضافة السؤال...`)
      
      try {
        const docRef = await addDoc(collection(db, 'questions'), {
          question: question.question,
          category: question.category,
          order: question.order
        })
        console.log(`✓ تم إضافة السؤال (ID: ${docRef.id})\n`)
        successCount++
      } catch (error) {
        console.error(`✗ فشل إضافة السؤال: ${error.message}\n`)
        failCount++
      }
      
      // Small delay between questions
      if (i < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`تم الانتهاء!`)
    console.log(`نجح: ${successCount} سؤال`)
    console.log(`فشل: ${failCount} سؤال`)
    console.log('='.repeat(50))
    
    process.exit(0)
  } catch (error) {
    console.error('حدث خطأ:', error)
    process.exit(1)
  }
}

addQuestions()

