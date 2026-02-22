import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Countdown from './components/Countdown';
import ActivityScreen from './components/ActivityScreen';
import AdminDashboard from './components/AdminDashboard';
import BackgroundMusic from './components/BackgroundMusic';
import { db, collection, query, where, getDocs } from './firebase/config';

function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [view, setView] = useState('activity'); // 'activity' or 'stats'
    const [isRamadanStarted, setIsRamadanStarted] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [loading, setLoading] = useState(true);

    const RAMADAN_START_DATE = new Date('2026-02-18T04:49:00');

    useEffect(() => {
        // Check local storage for session
        const storedUser = localStorage.getItem('ramadan_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAdmin(userData.admin === true || userData.role === 'admin');

            // Show welcome message on entry
            setShowWelcome(true);
            setTimeout(() => setShowWelcome(false), 4000);
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

                // Show welcome message on login
                setShowWelcome(true);
                setTimeout(() => setShowWelcome(false), 4000);

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

    const renderScreen = () => {
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
    };

    return (
        <>
            <BackgroundMusic />
            {showWelcome && user && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--night-blue)',
                    color: 'white',
                    padding: '12px 30px',
                    borderRadius: '50px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    zIndex: 9999,
                    animation: 'fadeInOut 4s ease-in-out forwards',
                    fontFamily: 'Cairo',
                    border: '2px solid var(--muted-gold)',
                    textAlign: 'center',
                    minWidth: '200px'
                }}>
                    أهلاً وسهلاً {user.name}
                </div>
            )}
            <style>
                {`
                    @keyframes fadeInOut {
                        0% { opacity: 0; top: -50px; }
                        15% { opacity: 1; top: 20px; }
                        85% { opacity: 1; top: 20px; }
                        100% { opacity: 0; top: -50px; }
                    }
                `}
            </style>
            {renderScreen()}
        </>
    );
}

export default App;
