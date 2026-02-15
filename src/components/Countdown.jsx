import { useState, useEffect } from 'react';
import { Moon, Star, Bell } from 'lucide-react';

const Countdown = ({ user, onLogout, startDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = startDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(timer);
                window.location.reload();
            } else {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [startDate]);

    return (
        <div className="countdown-screen" style={{
            textAlign: 'center',
            padding: '20px',
            direction: 'rtl',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ color: 'var(--muted-gold)' }}>أهلاً {user.name}</h2>
                <p>رمضان يقترب...</p>
            </header>

            <div className="countdown-timer" style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'nowrap',
                marginBottom: '50px',
                padding: '0 5px'
            }}>
                {[
                    { label: 'يوم', value: timeLeft.days },
                    { label: 'ساعة', value: timeLeft.hours },
                    { label: 'دقيقة', value: timeLeft.minutes },
                    { label: 'ثانية', value: timeLeft.seconds }
                ].map((unit, i) => (
                    <div key={i} className="card" style={{
                        flex: '1',
                        minWidth: '0',
                        padding: '10px 5px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderColor: 'var(--muted-gold)'
                    }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{unit.value}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{unit.label}</span>
                    </div>
                ))}
            </div>

            <div style={{ color: 'var(--night-blue)' }}>
                <Bell size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <h3>استعد للنفحات الرمضانية</h3>
                <p style={{ opacity: 0.6 }}>سيبدأ النظام في 18 فبراير 2026 إن شاء الله</p>
            </div>

            <button
                onClick={onLogout}
                style={{
                    marginTop: '50px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--terracotta)',
                    textDecoration: 'underline',
                    fontFamily: 'Cairo'
                }}
            >
                تسجيل الخروج
            </button>
        </div>
    );
};

export default Countdown;
