import { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs } from '../firebase/config';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Download, Share2, ChevronLeft, ChevronRight, Trophy, LogOut } from 'lucide-react';
import html2canvas from 'html2canvas';

const AdminDashboard = ({ user, onLogout, setView }) => {
    const [activitiesViewed, setActivitiesViewed] = useState([]);
    const [riddleAnswers, setRiddleAnswers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(1);
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

    const runMigration = async () => {
        const updates = [
            { id: '1FlOqqpbBwrkvJDVdGLA', name: 'محمد صلح', city: 'Paris', country: 'France' },
            { id: 'VsUN4VpyWEUGoQeSIoBQ', name: 'مصطفى شبشول', city: 'Paris', country: 'France' },
            { id: 'nd0LWQkJBbnMdLmSRheQ', name: 'حيدر إسبر', city: 'Paris', country: 'France' },
            { id: 'nlKkV5m0HTtUlhtluYlJ', name: 'نديم عبدالجليل', city: 'Paris', country: 'France' },
            { id: 'puDaE9XhsPL9ElIFotce', name: 'عبد المجيد الرفاعي', city: 'Calgary', country: 'Canada' },
            { id: 'RDEDI2u1JIYWA4I1lBRb', name: 'أحمد ناصر', city: 'Abuja', country: 'Nigeria' }
        ];

        try {
            const { updateDoc, doc } = await import('../firebase/config');
            for (const item of updates) {
                const userRef = doc(db, 'users', item.id);
                await updateDoc(userRef, {
                    city: item.city,
                    country: item.country
                });
            }
            alert('تم تحديث بيانات المواقع بنجاح!');
            window.location.reload();
        } catch (err) {
            console.error("Migration error:", err);
            alert('حدث خطأ أثناء التحديث');
        }
    };

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

    const getAggregateData = () => {
        const aggregate = [1, 2, 3, 4, 5].map(slot => ({
            name: `نشاط ${slot}`,
            total: activitiesViewed.filter(a => a.slot === slot).length
        }));
        return aggregate;
    };

    const getLeaderboard = () => {
        const slot1Counts = {};
        activitiesViewed.filter(a => a.slot === 1).forEach(a => {
            slot1Counts[a.userName] = (slot1Counts[a.userName] || 0) + 1;
        });

        return Object.entries(slot1Counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    };

    if (loading) return <div className="loading">جاري تحميل الإحصائيات...</div>;

    return (
        <div className="admin-dashboard" style={{ direction: 'rtl', padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'Cairo' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: 'var(--night-blue)' }}>لوحة التحكم - المسؤول</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        onClick={runMigration}
                        style={{
                            background: 'var(--terracotta)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            fontFamily: 'Cairo',
                            cursor: 'pointer'
                        }}
                    >
                        تحديث المواقع (مرة واحدة)
                    </button>
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
                        <h2 style={{ marginBottom: '20px' }}>لوحة المتصدرين (بصمة مصلي)</h2>
                        <div className="card">
                            {getLeaderboard().map((p, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid #eee' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {i === 0 && <Trophy size={20} color="var(--muted-gold)" />}
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
