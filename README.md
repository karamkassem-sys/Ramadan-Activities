# Personality Test App

تطبيق اختبار الشخصية للأصدقاء

## المميزات

- نظام تسجيل دخول بالكود
- واجهة عربية كاملة مع دعم RTL
- تصميم داكن مع صور داكنة تصبح ملونة عند التفاعل
- تصميم متجاوب للموبايل
- ثلاث أقسام للأسئلة:
  - القسم الأول: أسئلة بخيارات متعددة (أوافق بشدة، أوافق، لا أوافق، لا أوافق بشدة)
  - القسم الثاني: أسئلة اختيار صديق
  - القسم الثالث: تعليق نهائي

## التقنيات المستخدمة

- React + JavaScript
- Vite
- Firebase Firestore
- Vercel (للنشر)

## الإعداد

1. تثبيت المتطلبات:
```bash
npm install
```

2. إعداد Firebase:
   - أنشئ مشروع Firebase جديد
   - احصل على بيانات الإعداد
   - ضعها في `src/firebase/config.js`

3. إعداد قاعدة البيانات:
   - أنشئ collection باسم `users` مع الحقول: `name`, `code`, `admin`
   - أنشئ collection باسم `questions` مع الحقول: `question`, `category` (section1 أو section2), `order`
   - أنشئ collection باسم `answers` (سيتم إنشاء السجلات تلقائياً)

4. تشغيل التطبيق:
```bash
npm run dev
```

5. البناء للنشر:
```bash
npm run build
```

## هيكل قاعدة البيانات

### users collection
```
{
  name: string,
  code: string,
  admin: boolean
}
```

### questions collection
```
{
  question: string,
  category: "section1" | "section2",
  order: number
}
```

### answers collection
```
{
  userId: string,
  friendId: string,
  questionId?: string,
  answer?: string,
  section?: 3,
  comment?: string,
  timestamp: Date
}
```

## الصور

ضع صور الأصدقاء في مجلد `public/images/` بأسماء مطابقة لأسماء المستخدمين في قاعدة البيانات.

