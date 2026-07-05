export type StudentStatus = 'Elite' | 'Stable' | 'Monitoring' | 'At-Risk' | 'Unknown';

export interface Student {
    id: string; // Internal UUID
    institutionalId: string; // Max 10 chars, alphanumeric
    firstName: string;
    lastName: string;
    enrolledAt: string; // ISO String
    samples: string[]; // Array of base64 image strings (Max 8)
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    timestamp: string; // ISO String
    periodId: string;
    confidenceScore: number; // 0-100
    method: 'Biometric' | 'Manual';
}

export interface Period {
    id: string;
    name: string; // e.g., "Period 1 - Mathematics"
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    instructor: string;
}

export interface SystemConfig {
    geminiApiKey: string;
    schoolStartTime: string; // "HH:MM"
    defaultPeriodDurationMins: number;
    totalPeriods: number;
}
