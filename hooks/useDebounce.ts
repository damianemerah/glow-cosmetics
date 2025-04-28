import { useEffect, useState } from "react";

/**
 * A hook to debounce any fast changing value
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set debouncedValue to value after the specified delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // If the value changes, cancel the timer and start a new one
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
