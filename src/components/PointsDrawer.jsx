import { useState, useEffect } from 'react';
import { db, doc, getDoc } from '../firebase/config';
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react';

const PointsDrawer = ({ user, isDarkMode }) => {
    const [points, setPoints] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchPoints = async () => {
            if (!user?.id) return;
            try {
                const docRef = doc(db, 'points', user.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPoints(docSnap.data().totalPoints || 0);
                }
            } catch (err) {
                console.error("Error fetching points:", err);
            }
        };

        fetchPoints();
        // Set up a small interval to refresh points or use onSnapshot if real-time is critical
        const interval = setInterval(fetchPoints, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const bgColor = isDarkMode ? 'var(--off-white)' : 'var(--night-blue)';
    const textColor = isDarkMode ? 'var(--night-blue)' : 'var(--off-white)';

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '500px',
            backgroundColor: bgColor,
            color: textColor,
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '10px 20px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            height: isExpanded ? '120px' : '45px',
            cursor: 'pointer',
            direction: 'rtl',
            fontFamily: 'Cairo'
        }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={20} color="var(--muted-gold)" />
                    <span style={{ fontWeight: 'bold' }}>نقاطي: {points}</span>
                </div>
                {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {isExpanded && (
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        استمر في إنجاز الأنشطة لزيادة نقاطك! 🌟
                    </p>
                    <div style={{
                        marginTop: '10px',
                        fontSize: '0.8rem',
                        padding: '5px',
                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '10px'
                    }}>
                        تحصل على نقطة واحدة لكل نشاط (عدا الفجر)
                    </div>
                </div>
            )}

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
};

export default PointsDrawer;
