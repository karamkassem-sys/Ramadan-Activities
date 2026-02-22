const admin = require('firebase-admin');

// 1. Initialize Firebase Admin
// You'll need to add FIREBASE_SERVICE_ACCOUNT to your GitHub Secrets
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const messaging = admin.messaging();

async function sendNotifications() {
    try {
        // 2. Determine if it's "Notification Time"
        // Fetch prayer times for Beirut (or similar logic used in app)
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Beirut&country=Lebanon&method=8');
        const data = await response.json();
        const timings = data.data.timings;
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Beirut' });

        // Identify current Slot
        let slot = null;
        let title = "";
        let body = "";

        if (currentTime === timings.Fajr) {
            slot = 1; title = "بصمة المصلي"; body = "حان الآن وقت نشاط الفجر!";
        } else if (currentTime === timings.Dhuhr) {
            slot = 2; title = "قصة آية"; body = "حان الآن وقت نشاط الظهر!";
        } else if (currentTime === timings.Asr) {
            slot = 3; title = "سيرة ولي"; body = "حان الآن وقت نشاط العصر!";
        } else if (currentTime === timings.Maghrib) {
            slot = 4; title = "جواهر الكلم"; body = "حان الآن وقت نشاط المغرب!";
        } else if (currentTime === timings.Isha) {
            slot = 5; title = "فزورة رمضانية"; body = "حان الآن وقت نشاط العشاء والفزورة!";
        }

        if (!slot) {
            console.log(`Not time for notification (Current: ${currentTime})`);
            return;
        }

        // 3. Get all user tokens
        const usersSnap = await db.collection('users').get();
        let allTokens = [];
        usersSnap.forEach(doc => {
            const data = doc.data();
            if (data.fcmTokens) {
                allTokens = allTokens.concat(data.fcmTokens);
            }
        });

        // Remove duplicates
        allTokens = [...new Set(allTokens)];

        if (allTokens.length === 0) {
            console.log("No tokens found.");
            return;
        }

        // 4. Send Message
        const message = {
            notification: {
                title: title,
                body: body,
            },
            tokens: allTokens,
        };

        const responseFCM = await messaging.sendMulticast(message);
        console.log(`Successfully sent to ${responseFCM.successCount} users.`);

        if (responseFCM.failureCount > 0) {
            const failedTokens = [];
            responseFCM.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(allTokens[idx]);
                }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
        }

    } catch (error) {
        console.error("Error sending notifications:", error);
    }
}

sendNotifications();
