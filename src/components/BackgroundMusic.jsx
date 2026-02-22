import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const BackgroundMusic = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Music only plays when explicitly toggled by the user
    }, []);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
            <button
                onClick={toggleMusic}
                style={{
                    background: 'rgba(52, 73, 94, 0.9)',
                    border: '2px solid var(--muted-gold)',
                    color: 'var(--muted-gold)',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isPlaying ? 'scale(1)' : 'scale(1)',
                    outline: 'none'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = 'var(--night-blue)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(52, 73, 94, 0.9)';
                }}
                title={isPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
            >
                {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            <audio
                ref={audioRef}
                src="/music.mp3"
                loop
                preload="auto"
            />
        </div>
    );
};

export default BackgroundMusic;
