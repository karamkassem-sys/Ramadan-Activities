import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDl4Tt_CJNWh1sf5en8LejTkuBrPP7naZw",
    authDomain: "n8n-karam-eval.firebaseapp.com",
    projectId: "n8n-karam-eval",
    storageBucket: "n8n-karam-eval.firebasestorage.app",
    messagingSenderId: "101600786045",
    appId: "1:101600786045:web:0633d2a6e55e0f8a94e314"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    console.log("Starting migration...");
    try {
        const activitiesSnap = await getDocs(collection(db, 'activities_viewed'));
        const usersSnap = await getDocs(collection(db, 'users'));

        const users = {};
        usersSnap.forEach(u => {
            users[u.id] = u.data().name;
        });

        const pointsMap = {};

        activitiesSnap.forEach(docSnap => {
            const data = docSnap.data();
            const { userId, userName, slot } = data;

            // Points are for slots 2, 3, 4, 5
            if (slot >= 2 && slot <= 5) {
                const id = userId || userName; // Fallback
                if (!pointsMap[id]) {
                    pointsMap[id] = {
                        userId: id,
                        userName: users[id] || userName || 'مستخدم',
                        activityCompletions: 0,
                        manualAdjustment: 0,
                        totalPoints: 0
                    };
                }
                pointsMap[id].activityCompletions += 1;
                pointsMap[id].totalPoints += 1;
            }
        });

        console.log(`Calculating points for ${Object.keys(pointsMap).length} users...`);

        for (const id in pointsMap) {
            console.log(`Updating points for: ${pointsMap[id].userName}`);
            await setDoc(doc(db, 'points', id), pointsMap[id], { merge: true });
        }

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    }
}

migrate();
