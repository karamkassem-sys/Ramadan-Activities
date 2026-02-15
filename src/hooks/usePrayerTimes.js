import { useState, useEffect } from 'react';

export const usePrayerTimes = () => {
    const [timings, setTimings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlot, setCurrentSlot] = useState(null);

    useEffect(() => {
        const fetchTimings = async () => {
            try {
                // Using Aladhan API for Beirut, Lebanon with Method 8 (Shia Ithna-Ashari)
                const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Beirut&country=Lebanon&method=8');
                const data = await response.json();

                if (data.code === 200) {
                    setTimings(data.data.timings);
                    determineSlot(data.data.timings);
                } else {
                    setError('Failed to fetch prayer times');
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTimings();
    }, []);

    const determineSlot = (times) => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Aladhan returns times in "HH:mm" format
        const { Fajr, Dhuhr, Asr, Maghrib, Isha } = times;

        if (currentTime >= Fajr && currentTime < Dhuhr) {
            setCurrentSlot(1); // Fajr to Dhuhr
        } else if (currentTime >= Dhuhr && currentTime < Asr) {
            setCurrentSlot(2); // Dhuhr to Asr
        } else if (currentTime >= Asr && currentTime < Maghrib) {
            setCurrentSlot(3); // Asr to Maghrib
        } else if (currentTime >= Maghrib && currentTime < Isha) {
            setCurrentSlot(4); // Maghrib to Isha
        } else {
            setCurrentSlot(5); // Isha to Fajr (next day)
        }
    };

    return { timings, loading, error, currentSlot };
};
