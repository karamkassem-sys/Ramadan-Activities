import { Star, BarChart2 } from 'lucide-react';

const ActivityHeader = ({ title, day, slot, isAdmin, onToggleStats }) => {
    return (
        <div className="ramadan-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                <div style={{ color: 'var(--muted-gold)' }}>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{title}</h1>
                    <div style={{
                        display: 'inline-block',
                        padding: '2px 15px',
                        backgroundColor: 'var(--muted-gold)',
                        color: 'var(--night-blue)',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                    }}>
                        اليوم {day} من رمضان
                    </div>
                </div>

                <div style={{ color: 'var(--muted-gold)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {isAdmin && (
                        <button
                            onClick={onToggleStats}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid var(--muted-gold)',
                                color: 'var(--muted-gold)',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '0.9rem',
                                fontFamily: 'Cairo'
                            }}
                        >
                            <BarChart2 size={18} />
                            الإحصائيات
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityHeader;
