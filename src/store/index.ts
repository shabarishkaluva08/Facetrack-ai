import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Student, AttendanceRecord, Period, SystemConfig } from '../types';

export function useStore() {
    const [students, setStudents] = useLocalStorage<Student[]>('facetrack_students', []);
    const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('facetrack_attendance', []);
    const [schedule, setSchedule] = useLocalStorage<Period[]>('facetrack_schedule', [
        { id: 'p1', name: 'Period 1', startTime: '09:00', endTime: '09:50', instructor: '' },
        { id: 'p2', name: 'Period 2', startTime: '10:00', endTime: '10:50', instructor: '' },
        { id: 'p3', name: 'Period 3', startTime: '11:00', endTime: '11:50', instructor: '' },
        { id: 'p4', name: 'Period 4', startTime: '13:00', endTime: '13:50', instructor: '' }
    ]);
    const [config, setConfig] = useLocalStorage<SystemConfig>('facetrack_config', {
        geminiApiKey: '',
        schoolStartTime: '08:00',
        defaultPeriodDurationMins: 45,
        totalPeriods: 6,
    });

    return {
        students,
        setStudents,
        attendance,
        setAttendance,
        schedule,
        setSchedule,
        config,
        setConfig,
    };
}
