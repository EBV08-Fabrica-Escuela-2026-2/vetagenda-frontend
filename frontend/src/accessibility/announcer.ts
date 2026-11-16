export const SCREEN_READER_ANNOUNCEMENT_EVENT = 'vetagenda-screen-reader-announcement';

export function announceToScreenReader(message: string) {
  window.dispatchEvent(new CustomEvent<string>(SCREEN_READER_ANNOUNCEMENT_EVENT, { detail: message }));
}
