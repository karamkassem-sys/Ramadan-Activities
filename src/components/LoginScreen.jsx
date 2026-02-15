import { useState } from 'react';
import { Moon, Star } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code) return;

        setIsLoading(true);
        setError('');

        const result = await onLogin(code);
        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="login-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            direction: 'rtl'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                margin: '0 auto'
            }}>
                <div style={{ marginBottom: '20px', color: 'var(--muted-gold)' }}>
                    <Moon size={64} style={{ fill: 'var(--muted-gold)' }} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '10px' }}>
                        <Star size={16} /><Star size={24} /><Star size={16} />
                    </div>
                </div>

                <h1 style={{ color: 'var(--night-blue)', marginBottom: '10px' }}>نظام رمضان للأصدقاء</h1>
                <p style={{ color: 'var(--night-blue)', opacity: 0.8, marginBottom: '30px' }}>أهلاً بك! يرجى إدخال الكود الخاص بك للدخول</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="أدخل الكود هنا"
                        style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '2px solid var(--warm-sand)',
                            marginBottom: '20px',
                            textAlign: 'center',
                            fontSize: '1.2rem',
                            fontFamily: 'Cairo'
                        }}
                    />

                    {error && <p style={{ color: 'var(--terracotta)', marginBottom: '20px' }}>{error}</p>}

                    <button
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--night-blue)',
                            color: 'white',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            fontFamily: 'Cairo'
                        }}
                    >
                        {isLoading ? 'جاري الدخول...' : 'دخول'}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '20px', color: 'var(--muted-gold)', opacity: 0.6 }}>
                رمضان كريم 🌙
            </div>
        </div>
    );
};

export default LoginScreen;
