import { useState, useEffect } from 'react';
import { useRamadanData } from '../hooks/useRamadanData';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import ActivityHeader from './ActivityHeader';
import { db, collection, addDoc, query, where, getDocs } from '../firebase/config';
import { CheckCircle, Send, LogOut } from 'lucide-react';

const ActivityScreen = ({ user, onLogout, isAdmin, setView }) => {
    const { getActivityForDayAndSlot, loading: dataLoading } = useRamadanData();
    const { currentSlot, timings, loading: timesLoading, timezone } = usePrayerTimes(user.city || 'Beirut', user.country || 'Lebanon');

    const [currentDay, setCurrentDay] = useState(1);
    const [activity, setActivity] = useState(null);
    const [markedAsDone, setMarkedAsDone] = useState(false);
    const [riddleAnswer, setRiddleAnswer] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    useEffect(() => {
        // Calculate current day of Ramadan based on start date 2026-02-18
        // Using the timezone returned by the API for accuracy
        const RAMADAN_START = new Date('2026-02-18T00:00:00');

        // Get current date in target timezone
        const nowInTimezone = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));

        const diffTime = nowInTimezone - RAMADAN_START;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCurrentDay(diffDays < 1 ? 1 : (diffDays > 30 ? 30 : diffDays));
    }, [timezone]);

    useEffect(() => {
        if (!dataLoading) {
            if (currentSlot) {
                const act = getActivityForDayAndSlot(currentDay, currentSlot);
                setActivity(act);
            } else {
                setActivity(null);
            }
        }
    }, [currentDay, currentSlot, dataLoading, getActivityForDayAndSlot]);

    // Check if user has already completed this activity
    useEffect(() => {
        const checkStatus = async () => {
            if (user && currentDay && currentSlot) {
                try {
                    const q = query(
                        collection(db, 'activities_viewed'),
                        where('userId', '==', user.id),
                        where('day', '==', currentDay),
                        where('slot', '==', currentSlot)
                    );
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        setMarkedAsDone(true);

                        // If it's a riddle, try to fetch the answer
                        if (currentSlot === 5) {
                            const riddleQ = query(
                                collection(db, 'riddle_answers'),
                                where('userId', '==', user.id),
                                where('day', '==', currentDay)
                            );
                            const riddleSnapshot = await getDocs(riddleQ);
                            if (!riddleSnapshot.empty) {
                                setRiddleAnswer(riddleSnapshot.docs[0].data().answer || '');
                            }
                        }
                    } else {
                        setMarkedAsDone(false);
                        setRiddleAnswer('');
                    }
                } catch (err) {
                    console.error("Error checking activity status:", err);
                }
            }
        };

        checkStatus();
    }, [user, currentDay, currentSlot]);

    const handleAction = async () => {
        if (!activity || markedAsDone) return;

        try {
            // Final check to prevent race conditions or UI bypass
            const q = query(
                collection(db, 'activities_viewed'),
                where('userId', '==', user.id),
                where('day', '==', currentDay),
                where('slot', '==', currentSlot)
            );
            const querySnapshot = await getDocs(q);

            // Also check riddle_answers if it's the riddle slot
            let alreadyAnswered = false;
            if (currentSlot === 5) {
                const riddleQ = query(
                    collection(db, 'riddle_answers'),
                    where('userId', '==', user.id),
                    where('day', '==', currentDay)
                );
                const riddleSnapshot = await getDocs(riddleQ);
                alreadyAnswered = !riddleSnapshot.empty;
            }

            if (!querySnapshot.empty || alreadyAnswered) {
                setMarkedAsDone(true);
                setDialogMessage('لقد قمت بهذا النشاط مسبقاً');
                setShowDialog(true);
                return;
            }
            // Save primary activity view to 'activities_viewed'
            await addDoc(collection(db, 'activities_viewed'), {
                userId: user.id,
                userName: user.name,
                day: currentDay,
                slot: currentSlot,
                activityTitle: activity.title,
                timestamp: new Date()
            });

            // Special handling for Activity 5 (Riddle)
            if (currentSlot === 5) {
                await addDoc(collection(db, 'riddle_answers'), {
                    userId: user.id,
                    userName: user.name,
                    day: currentDay,
                    answer: riddleAnswer,
                    correctAnswer: activity.answer,
                    timestamp: new Date()
                });
                setDialogMessage('تم حفظ إجابتك!');
            } else if (currentSlot === 1) {
                setDialogMessage('منا ومنكم !');
            } else {
                setDialogMessage('أحسنت');
            }

            setMarkedAsDone(true);
            setShowDialog(true);
        } catch (err) {
            console.error("Error saving activity:", err);
            alert("حدث خطأ أثناء الحفظ");
        }
    };

    if (dataLoading || timesLoading) return <div className="loading">جاري تحميل النشاط...</div>;

    const isDarkMode = currentSlot === 1 || currentSlot === 4 || currentSlot === 5;

    return (
        <div className="activity-container" style={{
            minHeight: '100vh',
            direction: 'rtl',
            backgroundColor: isDarkMode ? 'var(--night-blue)' : 'var(--off-white)',
            color: isDarkMode ? '#fff' : 'var(--night-blue)',
            transition: 'all 0.5s ease'
        }}>
            <ActivityHeader
                title={activity?.title || 'استراحة'}
                day={currentDay}
                slot={currentSlot}
                isAdmin={isAdmin}
                onToggleStats={() => setView('stats')}
            />

            <main style={{
                maxWidth: '800px',
                margin: '20px auto',
                padding: '0 15px'
            }}>
                <div className="card" id="activity-card" style={{
                    position: 'relative',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'var(--warm-sand)',
                    color: isDarkMode ? '#fff' : 'inherit',
                    padding: '1.5rem',
                    textAlign: !activity ? 'center' : 'right'
                }}>
                    {!activity ? (
                        <div id="gap-message" style={{ padding: '40px 0' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>تقبل الله طاعاتكم</h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>لا يوجد نشاط متاح حالياً. يرجى الانتظار لموعد النشاط القادم.</p>
                        </div>
                    ) : (
                        <>
                            {markedAsDone && (
                                <div id="done-indicator" style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    color: 'var(--terracotta)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <CheckCircle size={20} />
                                    <span>تم الإنجاز</span>
                                </div>
                            )}

                            <div className="activity-content" style={{ marginTop: '20px' }}>
                                {currentSlot === 5 ? (
                                    <div className="riddle-section">
                                        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '30px' }}>{activity?.question}</p>
                                        <input
                                            id="riddle-input"
                                            type="text"
                                            placeholder="اكتب إجابتك هنا..."
                                            value={riddleAnswer}
                                            onChange={(e) => setRiddleAnswer(e.target.value)}
                                            disabled={markedAsDone}
                                            style={{
                                                width: '100%',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: isDarkMode ? '2px solid rgba(255,255,255,0.2)' : '2px solid var(--warm-sand)',
                                                background: isDarkMode ? 'rgba(0,0,0,0.2)' : '#fff',
                                                color: isDarkMode ? '#fff' : 'inherit',
                                                fontSize: '1.1rem',
                                                fontFamily: 'Cairo',
                                                marginBottom: '20px'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="lesson-section">
                                        <p style={{
                                            whiteSpace: 'pre-wrap',
                                            fontSize: '1.1rem',
                                            lineHeight: '1.8'
                                        }}>
                                            {activity?.content}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                                <button
                                    id="action-button"
                                    onClick={handleAction}
                                    disabled={markedAsDone || (currentSlot === 5 && !riddleAnswer)}
                                    style={{
                                        backgroundColor: markedAsDone ? '#ccc' : 'var(--terracotta)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '15px 40px',
                                        borderRadius: '30px',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        fontFamily: 'Cairo',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {currentSlot === 1 ? 'تقبل الله' : 'تم'}
                                    <Send size={20} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <button id="logout-button" onClick={onLogout} style={{
                        color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'var(--night-blue)',
                        opacity: 0.6,
                        background: 'none',
                        border: 'none',
                        fontFamily: 'Cairo',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer'
                    }}>
                        <LogOut size={18} /> تسجيل الخروج
                    </button>
                </div>
            </main>

            {showDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '300px', width: '90%', textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--night-blue)', marginBottom: '20px' }}>{dialogMessage}</h2>
                        <button
                            onClick={() => setShowDialog(false)}
                            style={{
                                backgroundColor: 'var(--night-blue)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 30px',
                                borderRadius: '10px',
                                fontFamily: 'Cairo'
                            }}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityScreen;
