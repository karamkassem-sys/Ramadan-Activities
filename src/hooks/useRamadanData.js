import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

export const useRamadanData = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCSV = async () => {
            try {
                const response = await fetch('/ramadan_activities.csv');
                const reader = response.body.getReader();
                const result = await reader.read();
                const decoder = new TextDecoder('utf-8');
                const csv = decoder.decode(result.value);

                Papa.parse(csv, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setActivities(results.data);
                        setLoading(false);
                    },
                    error: (err) => {
                        setError(err);
                        setLoading(false);
                    }
                });
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchCSV();
    }, []);

    const getActivityForDayAndSlot = useCallback((day, slot) => {
        const dayData = activities.find(a => parseInt(a['اليوم']) === day);
        if (!dayData) return null;

        const slots = [
            'الفجر - بصمة المصلي',
            'الظهر - قصة آية',
            'العصر - سيرة ولي',
            'المغرب - جواهر الكلم',
            'العشاء - فزورة رمضانية'
        ];

        const content = dayData[slots[slot - 1]];

        // Special logic for riddle (slot 5)
        if (slot === 5 && content) {
            const parts = content.split('(الجواب:');
            return {
                title: slots[slot - 1],
                question: parts[0].trim(),
                answer: parts[1] ? parts[1].replace(')', '').trim() : ''
            };
        }

        return {
            title: slots[slot - 1],
            content: content
        };
    }, [activities]);

    return { activities, loading, error, getActivityForDayAndSlot };
};
