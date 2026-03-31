import { useEffect } from 'react';

const BASE = 'Flourish';

/**
 * Sets document.title for the current view (helps Lighthouse / browser tabs).
 * Restores previous title on unmount.
 */
export function useDocumentTitle(title) {
    useEffect(() => {
        const prev = document.title;
        document.title = title ? `${title} · ${BASE}` : BASE;
        return () => {
            document.title = prev;
        };
    }, [title]);
}
