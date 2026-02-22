// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you're not using Firebase Hosting, import them from the CDN:
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDl4Tt_CJNWh1sf5en8LejTkuBrPP7naZw",
    authDomain: "n8n-karam-eval.firebaseapp.com",
    projectId: "n8n-karam-eval",
    storageBucket: "n8n-karam-eval.firebasestorage.app",
    messagingSenderId: "101600786045",
    appId: "1:101600786045:web:0633d2a6e55e0f8a94e314"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png' // Replace with your app icon if available
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
