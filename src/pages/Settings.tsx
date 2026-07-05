import React from 'react';
import { useStore } from '../store';
import { Settings as SettingsIcon, Key, Clock, Save, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import type { Period } from '../types';

export default function Settings() {
    const { config, setConfig, setSchedule } = useStore();
    const [localConfig, setLocalConfig] = React.useState({
        ...config,
        totalPeriods: config.totalPeriods || 6
    });
    const [isSaved, setIsSaved] = React.useState(false);

    const handleSave = () => {
        setConfig(localConfig);

        // Auto-generate the schedule sequence based on temporal parameters
        const count = localConfig.totalPeriods || 6;
        const duration = localConfig.defaultPeriodDurationMins || 45;
        let currentMinutes = parseInt(localConfig.schoolStartTime.split(':')[0]) * 60 + parseInt(localConfig.schoolStartTime.split(':')[1]);

        const newSchedule: Period[] = [];
        for (let i = 0; i < count; i++) {
            const startH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
            const startM = (currentMinutes % 60).toString().padStart(2, '0');
            const startTimeStr = `${startH}:${startM}`;

            currentMinutes += duration;

            const endH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
            const endM = (currentMinutes % 60).toString().padStart(2, '0');
            const endTimeStr = `${endH}:${endM}`;

            newSchedule.push({
                id: uuidv4(),
                name: `Period ${i + 1}`,
                startTime: startTimeStr,
                endTime: endTimeStr,
                instructor: ''
            });
        }

        setSchedule(newSchedule);

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <SettingsIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">System Configuration</h1>
                    <p className="text-muted">Manage AI engines, camera sources, and core parameters</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Key className="w-5 h-5 mr-2 text-primary" />
                            Neural Engine API
                        </CardTitle>
                        <CardDescription>
                            Configure the Google Gemini API key required for biometric facial recognition.
                            This key is stored securely in your browser's local storage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">Gemini API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                placeholder="AIzaSy..."
                                className="font-mono bg-surface/80"
                                value={localConfig.geminiApiKey}
                                onChange={e => setLocalConfig({ ...localConfig, geminiApiKey: e.target.value })}
                            />
                        </div>
                        {!localConfig.geminiApiKey && (
                            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-start text-danger text-sm mt-2">
                                <ShieldAlert className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                                <p>Biometric scanner is disabled until a valid API key is provided.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Clock className="w-5 h-5 mr-2 text-emerald-400" />
                            Temporal Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="schoolStart">Global Start Time</Label>
                                <Input
                                    id="schoolStart"
                                    type="time"
                                    value={localConfig.schoolStartTime}
                                    onChange={e => setLocalConfig({ ...localConfig, schoolStartTime: e.target.value })}
                                />
                                <p className="text-xs text-muted">Baseline time for attendance</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="periodDuration">Default Period Duration (mins)</Label>
                                <Input
                                    id="periodDuration"
                                    type="number"
                                    min="1"
                                    value={localConfig.defaultPeriodDurationMins}
                                    onChange={e => setLocalConfig({ ...localConfig, defaultPeriodDurationMins: parseInt(e.target.value) || 45 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="totalPeriods">Total Periods</Label>
                                <Input
                                    id="totalPeriods"
                                    type="number"
                                    min="1"
                                    value={localConfig.totalPeriods}
                                    onChange={e => setLocalConfig({ ...localConfig, totalPeriods: parseInt(e.target.value) || 6 })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} size="lg" className="w-full sm:w-auto relative overflow-hidden group">
                        <span className={cn("flex items-center transition-transform", isSaved ? "-translate-y-12" : "translate-y-0")}>
                            <Save className="w-5 h-5 mr-2" />
                            Save Configuration
                        </span>
                        <span className={cn("absolute inset-0 flex items-center justify-center bg-emerald-500 text-white transition-transform", isSaved ? "translate-y-0" : "translate-y-12")}>
                            Saved Successfully!
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

