import { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs } from '../firebase/config';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Download, Share2, ChevronLeft, ChevronRight, Trophy, LogOut, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';

const AdminDashboard = ({ user, onLogout, setView }) => {
    const [activitiesViewed, setActivitiesViewed] = useState([]);
    const [riddleAnswers, setRiddleAnswers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const RAMADAN_START = new Date('2026-02-18T00:00:00');
    const now = new Date();
    const diffTime = now - RAMADAN_START;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const defaultDay = diffDays < 1 ? 1 : (diffDays > 30 ? 30 : diffDays);

    const [selectedDay, setSelectedDay] = useState(defaultDay);
    const dashboardRef = useRef(null);

    const COLORS = ['#34495E', '#D9886A', '#C5A059', '#E5C3A6', '#F2E9DE'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersSnap = await getDocs(collection(db, 'users'));
                const activitiesSnap = await getDocs(collection(db, 'activities_viewed'));
                const riddlesSnap = await getDocs(collection(db, 'riddle_answers'));

                setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setActivitiesViewed(activitiesSnap.docs.map(doc => doc.data()));
                setRiddleAnswers(riddlesSnap.docs.map(doc => doc.data()));
            } catch (err) {
                console.error("Error fetching admin data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getDailyStats = (day) => {
        const dailyActivities = activitiesViewed.filter(a => a.day === day);
        const dailyRiddles = riddleAnswers.filter(r => r.day === day);

        const slotTitles = [
            'الفجر - بصمة المصلي',
            'الظهر - قصة آية',
            'العصر - سيرة ولي',
            'المغرب - جواهر الكلم',
            'العشاء - فزورة رمضانية'
        ];

        const stats = [1, 2, 3, 4, 5].map(slot => {
            const views = dailyActivities.filter(a => a.slot === slot);
            return {
                slot,
                title: slotTitles[slot - 1],
                count: views.length,
                people: views.map(v => v.userName)
            };
        });

        return { stats, dailyRiddles };
    };

    const { stats: dailyStats, dailyRiddles } = getDailyStats(selectedDay);

    const exportAsImage = async () => {
        if (dashboardRef.current) {
            const canvas = await html2canvas(dashboardRef.current);
            const link = document.createElement('a');
            link.download = `statistics-day-${selectedDay}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const copyForWhatsApp = () => {
        let text = `📊 *إحصائيات اليوم ${selectedDay} من رمضان* 🌙\n\n`;
        dailyStats.forEach(s => {
            text += `🔹 *${s.title}:* ${s.count} مشاركين\n`;

            if (s.slot === 5 && dailyRiddles.length > 0) {
                // Show individual answers for Activity 5 without validation
                dailyRiddles.forEach(r => {
                    text += `👤 ${r.userName}: ${r.answer}\n`;
                });
                text += `\n💡 *الجواب الصحيح:* ${dailyRiddles[0].correctAnswer}\n`;
            } else if (s.people.length > 0) {
                text += `👥 _${s.people.join('، ')}_\n`;
            }
            text += `\n`;
        });

        navigator.clipboard.writeText(text);
        alert('تم نسخ التقرير للواتساب!');
    };

    const copyLeaderboard = () => {
        const leaderboard = getLeaderboard();
        if (leaderboard.length === 0) {
            alert('لا يوجد بيانات لوحة المتصدرين حالياً');
            return;
        }

        let text = `🏆 *لوحة المتصدرين (بصمة مصلي)* 🌙\n\n`;
        leaderboard.forEach((p, i) => {
            const medal = i === 0 ? '🥇 ' : (i === 1 ? '🥈 ' : (i === 2 ? '🥉 ' : '👤 '));
            text += `${medal}*${p.name}*: ${p.count} يوم\n`;
        });

        navigator.clipboard.writeText(text);
        alert('تم نسخ لوحة المتصدرين للواتساب!');
    };

    const getAggregateData = () => {
        const aggregate = [1, 2, 3, 4, 5].map(slot => ({
            name: `نشاط ${slot}`,
            total: activitiesViewed.filter(a => a.slot === slot).length
        }));
        return aggregate;
    };

    const getLeaderboard = () => {
        const userStats = {};

        activitiesViewed.filter(a => a.slot === 1).forEach(a => {
            const userId = a.userId || a.userName; // Fallback to userName if userId is missing
            const timestamp = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);

            if (!userStats[userId]) {
                userStats[userId] = {
                    name: a.userName,
                    count: 0,
                    lastTimestamp: timestamp
                };
            }

            userStats[userId].count += 1;
            // Update to the latest activity timestamp for this user
            if (timestamp > userStats[userId].lastTimestamp) {
                userStats[userId].lastTimestamp = timestamp;
            }
        });

        return Object.values(userStats)
            .sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count; // Primary sort: days descending
                }
                // Secondary sort (tie-breaker): earliest last activity wins
                return a.lastTimestamp - b.lastTimestamp;
            });
    };

    if (loading) return <div className="loading">جاري تحميل الإحصائيات...</div>;

    return (
        <div className="admin-dashboard" style={{ direction: 'rtl', padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'Cairo' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: 'var(--night-blue)' }}>لوحة التحكم - المسؤول</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        onClick={() => setView('activity')}
                        style={{
                            background: 'var(--night-blue)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            fontFamily: 'Cairo',
                            cursor: 'pointer'
                        }}
                    >
                        العودة للنشاط
                    </button>
                    <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--terracotta)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <LogOut size={20} /> خروج
                    </button>
                </div>
            </header>

            <div className="nav-days" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                <button onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))} className="card" style={{ padding: '10px' }}>
                    <ChevronRight />
                </button>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>إحصائيات اليوم {selectedDay}</div>
                <button onClick={() => setSelectedDay(Math.min(30, selectedDay + 1))} className="card" style={{ padding: '10px' }}>
                    <ChevronLeft />
                </button>
            </div>

            <div ref={dashboardRef} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '15px' }}>
                <div className="daily-overview" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '15px',
                    marginBottom: '40px'
                }}>
                    {dailyStats.map(s => (
                        <div key={s.slot} className="card" style={{ textAlign: 'center', backgroundColor: 'var(--off-white)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--night-blue)' }}>{s.title}</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--terracotta)', margin: '10px 0' }}>{s.count}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '15px' }}>مشاركين</div>

                            {s.people.length > 0 && (
                                <div style={{
                                    borderTop: '1px solid var(--warm-sand)',
                                    paddingTop: '10px',
                                    fontSize: '0.85rem',
                                    textAlign: 'right',
                                    flex: 1
                                }}>
                                    <strong style={{ display: 'block', marginBottom: '5px' }}>المشاركون:</strong>
                                    <div style={{ opacity: 0.8, lineHeight: '1.4' }}>
                                        {s.people.join('، ')}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ marginBottom: '20px' }}>إجابات الفزورة</h2>
                    <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--warm-sand)' }}>
                                    <th style={{ padding: '15px 10px', textAlign: 'right' }}>الاسم</th>
                                    <th style={{ padding: '15px 10px', textAlign: 'right' }}>الإجابة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyRiddles.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px 10px' }}>{r.userName}</td>
                                        <td style={{ padding: '15px 10px' }}>{r.answer}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    <section>
                        <h2 style={{ marginBottom: '20px' }}>إجمالي المشاركات</h2>
                        <div className="card" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getAggregateData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="var(--night-blue)" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>لوحة المتصدرين (بصمة مصلي)</h2>
                            <button
                                onClick={copyLeaderboard}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 12px',
                                    background: 'var(--night-blue)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontFamily: 'Cairo'
                                }}
                            >
                                <Copy size={16} /> نسخ للواتساب
                            </button>
                        </div>
                        <div className="card" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {getLeaderboard().map((p, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < getLeaderboard().length - 1 ? '1px solid #eee' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {i === 0 ? <Trophy size={20} color="var(--muted-gold)" /> :
                                            i === 1 ? <Trophy size={20} color="#C0C0C0" /> :
                                                i === 2 ? <Trophy size={20} color="#CD7F32" /> :
                                                    <span style={{ width: '20px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.5 }}>{i + 1}</span>}
                                        <span>{p.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 'bold' }}>{p.count} يوم</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                <button onClick={exportAsImage} className="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--night-blue)', color: 'white' }}>
                    <Download size={20} /> تصدير كصورة
                </button>
                <button onClick={copyForWhatsApp} className="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#25D366', color: 'white', border: 'none' }}>
                    <Share2 size={20} /> تقرير واتساب
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
