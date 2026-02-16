import { useState, useEffect } from 'react';

export const usePrayerTimes = (city = 'Beirut', country = 'Lebanon') => {
    const [timings, setTimings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlot, setCurrentSlot] = useState(null);
    const [timezone, setTimezone] = useState('Asia/Beirut');

    useEffect(() => {
        const fetchTimings = async () => {
            setLoading(true);
            try {
                // Using Aladhan API with Method 8 (Shia Ithna-Ashari)
                const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=8`);
                const data = await response.json();

                if (data.code === 200) {
                    setTimings(data.data.timings);
                    setTimezone(data.data.meta.timezone);
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
    }, [city, country]);

    const determineSlot = (times) => {
        // Use Intl.DateTimeFormat to get the current time in the target timezone
        const options = { hour: '2-digit', minute: '2-digit', hour12: false };
        const formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone: timezone });
        const currentTime = formatter.format(new Date());

        // Aladhan returns times in "HH:mm" format
        const { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha } = times;

        if (currentTime >= Fajr && currentTime < Sunrise) {
            setCurrentSlot(1); // Fajr to Sunrise
        } else if (currentTime >= Sunrise && currentTime < Dhuhr) {
            setCurrentSlot(null); // Gap between Sunrise and Dhuhr
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

    return { timings, loading, error, currentSlot, timezone };
};
