import { useEffect, useState } from 'react';
import { SCREEN_READER_ANNOUNCEMENT_EVENT } from '../accessibility/announcer';

export function AccessibilityAnnouncer() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAnnouncement = (event: Event) => {
      const nextMessage = (event as CustomEvent<string>).detail;
      setMessage('');
      window.requestAnimationFrame(() => setMessage(nextMessage));
    };
    window.addEventListener(SCREEN_READER_ANNOUNCEMENT_EVENT, handleAnnouncement);
    return () => window.removeEventListener(SCREEN_READER_ANNOUNCEMENT_EVENT, handleAnnouncement);
  }, []);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
      {message}
    </div>
  );
}
