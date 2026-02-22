import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db, doc, updateDoc, arrayUnion } from '../firebase/config';
import { useEffect } from 'react';

export const useNotifications = (user) => {
    const VAPID_KEY = 'BMiefQORiXL0JXVM26A1ck6PGjHgdH6RPJqFzMUjhiKrUhORkdGNPK-su_gf8wxVbdN6vTX2m6KYnrGDQEC85is';

    const requestPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                if (token && user?.id) {
                    await updateDoc(doc(db, 'users', user.id), {
                        fcmTokens: arrayUnion(token)
                    });
                    console.log('Notification token saved');
                }
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    useEffect(() => {
        if (user) {
            requestPermission();
        }

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received in foreground: ', payload);
            // Optionally show a toast or custom UI here
            alert(`${payload.notification.title}: ${payload.notification.body}`);
        });

        return () => unsubscribe();
    }, [user]);

    return { requestPermission };
};
