import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const readValue = (): T => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(readValue);

    useEffect(() => {
        setStoredValue(readValue());

        const handleStorageChange = (e: StorageEvent | CustomEvent) => {
            if (e instanceof StorageEvent) {
                if (e.key === key) {
                    setStoredValue(readValue());
                }
            } else if (e instanceof CustomEvent) {
                setStoredValue(readValue());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(`local-storage-${key}`, handleStorageChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(`local-storage-${key}`, handleStorageChange as EventListener);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const newValue = value instanceof Function ? value(storedValue) : value;
            setStoredValue(newValue);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(newValue));
                window.dispatchEvent(new CustomEvent(`local-storage-${key}`));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
}

