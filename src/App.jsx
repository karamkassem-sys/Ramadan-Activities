import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Countdown from './components/Countdown';
import ActivityScreen from './components/ActivityScreen';
import AdminDashboard from './components/AdminDashboard';
import { db, collection, query, where, getDocs } from './firebase/config';

function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [view, setView] = useState('activity'); // 'activity' or 'stats'
    const [isRamadanStarted, setIsRamadanStarted] = useState(false);
    const [loading, setLoading] = useState(true);

    const RAMADAN_START_DATE = new Date('2026-02-18T00:00:00');

    useEffect(() => {
        // Check local storage for session
        const storedUser = localStorage.getItem('ramadan_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAdmin(userData.admin === true || userData.role === 'admin');
        }

        // Check if Ramadan has started
        const now = new Date();
        setIsRamadanStarted(now >= RAMADAN_START_DATE);

        setLoading(false);
    }, []);

    const handleLogin = async (code) => {
        try {
            const q = query(collection(db, 'users'), where('code', '==', code));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].data();
                const userData = { ...userDoc, id: querySnapshot.docs[0].id };
                setUser(userData);
                setIsAdmin(userData.admin === true || userData.role === 'admin');
                localStorage.setItem('ramadan_user', JSON.stringify(userData));
                return { success: true };
            }
            return { success: false, message: 'كود غير صحيح' };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: 'خطأ في الاتصال' };
        }
    };

    const handleLogout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('ramadan_user');
    };

    if (loading) return <div className="loading">جاري التحميل...</div>;

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (isAdmin && view === 'stats') {
        return <AdminDashboard user={user} onLogout={handleLogout} setView={setView} />;
    }

    if (!isRamadanStarted) {
        return <Countdown user={user} onLogout={handleLogout} startDate={RAMADAN_START_DATE} />;
    }

    return <ActivityScreen user={user} onLogout={handleLogout} isAdmin={isAdmin} setView={setView} />;
}

export default App;
