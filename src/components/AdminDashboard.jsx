import { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs, doc, setDoc, increment } from '../firebase/config';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Download, Share2, ChevronLeft, ChevronRight, Trophy, LogOut, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';

const AdminDashboard = ({ user, onLogout, setView }) => {
    const [activitiesViewed, setActivitiesViewed] = useState([]);
    const [riddleAnswers, setRiddleAnswers] = useState([]);
    const [users, setUsers] = useState([]);
    const [pointsData, setPointsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'points'

    const RAMADAN_START = new Date('2026-02-18T00:00:00');
    const now = new Date();
    const diffTime = now - RAMADAN_START;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const defaultDay = diffDays < 1 ? 1 : (diffDays > 30 ? 30 : diffDays);

    const [selectedDay, setSelectedDay] = useState(defaultDay);
    const dashboardRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersSnap = await getDocs(collection(db, 'users'));
                const activitiesSnap = await getDocs(collection(db, 'activities_viewed'));
                const riddlesSnap = await getDocs(collection(db, 'riddle_answers'));
                const pointsSnap = await getDocs(collection(db, 'points'));

                setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setActivitiesViewed(activitiesSnap.docs.map(doc => doc.data()));
                setRiddleAnswers(riddlesSnap.docs.map(doc => doc.data()));
                setPointsData(pointsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
                dailyRiddles.filter(r => r.day === selectedDay).forEach(r => {
                    text += `👤 ${r.userName}: ${r.answer}\n`;
                });
                text += `\n💡 *الجواب الصحيح:* ${dailyRiddles[0]?.correctAnswer || '---'}\n`;
            } else if (s.people.length > 0) {
                text += `👥 _${s.people.join('، ')}_\n`;
            }
            text += `\n`;
        });

        navigator.clipboard.writeText(text);
        alert('تم نسخ التقرير للواتساب!');
    };

    const copyTotalLeaderboard = () => {
        const sortedPoints = [...pointsData].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        let text = `🏆 *لوحة النقاط العامة* 🌙\n\n`;
        sortedPoints.forEach((p, i) => {
            const medal = i === 0 ? '🥇 ' : (i === 1 ? '🥈 ' : (i === 2 ? '🥉 ' : '👤 '));
            text += `${medal}*${p.userName || 'مستخدم'}*: ${p.totalPoints || 0} نقطة\n`;
        });
        navigator.clipboard.writeText(text);
        alert('تم نسخ لوحة النقاط للواتساب!');
    };

    const handleAdjustPoints = async (userId, amount) => {
        try {
            const userRef = doc(db, 'points', userId);
            const foundUser = users.find(u => u.id === userId);

            await setDoc(userRef, {
                manualAdjustment: increment(amount),
                totalPoints: increment(amount),
                userId: userId,
                userName: foundUser?.name || 'مستخدم',
                activityCompletions: increment(0)
            }, { merge: true });

            setPointsData(prev => {
                const existing = prev.find(p => p.id === userId);
                if (existing) {
                    return prev.map(p => p.id === userId ? { ...p, totalPoints: (p.totalPoints || 0) + amount, manualAdjustment: (p.manualAdjustment || 0) + amount } : p);
                } else {
                    return [...prev, { id: userId, userName: foundUser?.name || 'مستخدم', totalPoints: amount, manualAdjustment: amount, activityCompletions: 0 }];
                }
            });
        } catch (err) {
            console.error("Error adjusting points:", err);
        }
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
        return [1, 2, 3, 4, 5].map(slot => ({
            name: `نشاط ${slot}`,
            total: activitiesViewed.filter(a => a.slot === slot).length
        }));
    };

    const getLeaderboard = () => {
        const userStats = {};
        activitiesViewed.filter(a => a.slot === 1).forEach(a => {
            const userId = a.userId || a.userName;
            const timestamp = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            if (!userStats[userId]) {
                userStats[userId] = { name: a.userName, count: 0, lastTimestamp: timestamp };
            }
            userStats[userId].count += 1;
            if (timestamp > userStats[userId].lastTimestamp) {
                userStats[userId].lastTimestamp = timestamp;
            }
        });
        return Object.values(userStats).sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.lastTimestamp - b.lastTimestamp;
        });
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Cairo', fontSize: '1.2rem', color: 'var(--night-blue)' }}>
            جاري تحميل الإحصائيات...
        </div>
    );

    return (
        <div className="admin-dashboard" style={{ direction: 'rtl', padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'Cairo' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: 'var(--night-blue)' }}>إدارة المنصة</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '5px', borderRadius: '10px', display: 'flex', gap: '5px', border: '1px solid var(--warm-sand)' }}>
                        <button
                            onClick={() => setActiveTab('stats')}
                            style={{
                                backgroundColor: activeTab === 'stats' ? 'var(--night-blue)' : 'transparent',
                                color: activeTab === 'stats' ? 'white' : 'var(--night-blue)',
                                border: 'none', padding: '8px 20px', borderRadius: '8px', fontFamily: 'Cairo', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                        >النتائج والإحصائيات</button>
                        <button
                            onClick={() => setActiveTab('points')}
                            style={{
                                backgroundColor: activeTab === 'points' ? 'var(--night-blue)' : 'transparent',
                                color: activeTab === 'points' ? 'white' : 'var(--night-blue)',
                                border: 'none', padding: '8px 20px', borderRadius: '8px', fontFamily: 'Cairo', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                        >إدارة النقاط</button>
                    </div>
                    <button
                        onClick={() => setView('activity')}
                        style={{ background: 'var(--night-blue)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', fontFamily: 'Cairo', cursor: 'pointer' }}
                    >العودة للنشاط</button>
                    <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--terracotta)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <LogOut size={20} /> خروج
                    </button>
                </div>
            </header>

            {activeTab === 'stats' ? (
                <>
                    <div className="nav-days" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                        <button onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))} className="card" style={{ padding: '10px' }}><ChevronRight /></button>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>إحصائيات اليوم {selectedDay}</div>
                        <button onClick={() => setSelectedDay(Math.min(30, selectedDay + 1))} className="card" style={{ padding: '10px' }}><ChevronLeft /></button>
                    </div>

                    <div ref={dashboardRef} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                            {dailyStats.map(s => (
                                <div key={s.slot} className="card" style={{ textAlign: 'center', backgroundColor: 'var(--off-white)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--night-blue)' }}>{s.title}</h3>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--terracotta)', margin: '10px 0' }}>{s.count}</div>
                                    {s.people.length > 0 && (
                                        <div style={{ borderTop: '1px solid var(--warm-sand)', paddingTop: '10px', fontSize: '0.85rem', textAlign: 'right', flex: 1 }}>
                                            <strong style={{ display: 'block', marginBottom: '5px' }}>المشاركون:</strong>
                                            <div style={{ opacity: 0.8, lineHeight: '1.4' }}>{s.people.join('، ')}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ marginBottom: '20px' }}>إجابات الفزورة</h2>
                            <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                                    <thead><tr style={{ borderBottom: '2px solid var(--warm-sand)' }}><th style={{ padding: '15px', textAlign: 'right' }}>الاسم</th><th style={{ padding: '15px', textAlign: 'right' }}>الإجابة</th></tr></thead>
                                    <tbody>
                                        {dailyRiddles.map((r, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '15px' }}>{r.userName}</td><td style={{ padding: '15px' }}>{r.answer}</td></tr>
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
                                            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
                                            <Bar dataKey="total" fill="var(--night-blue)" radius={[5, 5, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>

                            <section>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ margin: 0 }}>بصمة مصلي (الفجر)</h2>
                                    <button onClick={copyLeaderboard} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: 'var(--night-blue)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Cairo' }}>
                                        <Copy size={16} /> نسخ
                                    </button>
                                </div>
                                <div className="card" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {getLeaderboard().map((p, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < getLeaderboard().length - 1 ? '1px solid #eee' : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {i === 0 ? <Trophy size={18} color="var(--muted-gold)" /> : i === 1 ? <Trophy size={18} color="#C0C0C0" /> : i === 2 ? <Trophy size={18} color="#CD7F32" /> : <span style={{ width: '18px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.5 }}>{i + 1}</span>}
                                                <span>{p.name}</span>
                                            </div>
                                            <span style={{ fontWeight: 'bold' }}>{p.count} يوم</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ margin: 0 }}>لوحة النقاط العامة</h2>
                                    <button onClick={copyTotalLeaderboard} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: 'var(--terracotta)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Cairo' }}>
                                        <Copy size={16} /> نسخ
                                    </button>
                                </div>
                                <div className="card" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {pointsData.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).map((p, i) => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < pointsData.length - 1 ? '1px solid #eee' : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {i === 0 ? <Trophy size={18} color="var(--muted-gold)" /> : i === 1 ? <Trophy size={18} color="#C0C0C0" /> : i === 2 ? <Trophy size={18} color="#CD7F32" /> : <span style={{ width: '18px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.5 }}>{i + 1}</span>}
                                                <span>{p.userName || 'مستخدم'}</span>
                                            </div>
                                            <span style={{ fontWeight: 'bold' }}>{p.totalPoints || 0} نقطة</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                        <button onClick={exportAsImage} className="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--night-blue)', color: 'white' }}><Download size={20} /> تصدير كصورة</button>
                        <button onClick={copyForWhatsApp} className="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#25D366', color: 'white', border: 'none' }}><Share2 size={20} /> تقرير واتساب</button>
                    </div>
                </>
            ) : (
                <div className="points-management" style={{ marginTop: '10px' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--night-blue)' }}>إدارة نقاط المستخدمين</h2>
                    <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--warm-sand)', backgroundColor: '#f8f8f8' }}>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>الاسم</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>أنشطة</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>يدوي</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>الإجمالي</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.sort((a, b) => a.name.localeCompare(b.name)).map(u => {
                                    const p = pointsData.find(item => item.id === u.id) || { activityCompletions: 0, manualAdjustment: 0, totalPoints: 0 };
                                    return (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{u.name}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{p.activityCompletions}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: p.manualAdjustment >= 0 ? 'green' : 'red' }}>{p.manualAdjustment >= 0 ? `+${p.manualAdjustment}` : p.manualAdjustment}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{p.totalPoints}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                    <button onClick={() => handleAdjustPoints(u.id, 1)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '5px', cursor: 'pointer' }}>+</button>
                                                    <button onClick={() => handleAdjustPoints(u.id, -1)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '5px', cursor: 'pointer' }}>-</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
