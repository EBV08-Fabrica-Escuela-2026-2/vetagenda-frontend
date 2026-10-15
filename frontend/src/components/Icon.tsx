const paths = {
  heart: 'M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9Z',
  shield: 'M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Zm-1 11-3-3 1.4-1.4L11 11.2l3.6-3.6L16 9l-5 5Z',
  sparkle: 'M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7L12 2Zm7 12 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z',
  plus: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4Z',
  calendar: 'M7 2v3m10-3v3M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  paw: 'M8 11c-1.2 0-2-1.2-2-2.6S6.8 6 8 6s2 1.2 2 2.400S9.200 11 8 11Zm8 0c-1.200 0-2-1.200-2-2.600S14.800 6 16 6s2 1.200 2 2.400S17.200 11 16 11ZM4.500 15c-1 0-1.700-1-1.700-2.200S3.500 10.600 4.500 10.600 6.200 11.600 6.200 12.800 5.500 15 4.500 15Zm15 0c-1 0-1.700-1-1.700-2.200s.7-2.200 1.700-2.200 1.700 1 1.700 2.200S20.500 15 19.500 15ZM12 12c-3 0-6 3.200-6 5.800 0 1.800 1.700 2.500 3.200 1.900.9-.4 1.700-.6 2.800-.6s1.900.2 2.800.6c1.500.6 3.200-.1 3.200-1.900C18 15.200 15 12 12 12Z',
  stethoscope: 'M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  syringe: 'm18 2 4 4m-3-1-3 3m-2 0 6 6-9.500 9.500H3.500v-5L13 9l-2-2 3-3 6 6m-11 7 2 2m-4-4 2 2',
  tooth: 'M7 3c-2 0-4 1.500-4 4.500 0 2.500 1.500 3.500 2 6C5.500 16 6 21 8 21c1.500 0 1.500-4 4-4s2.500 4 4 4c2 0 2.500-5 3-7.500.5-2.500 2-3.500 2-6C21 4.500 19 3 17 3c-2 0-3 1-5 1S9 3 7 3Z',
  check: 'm5 12 5 5 9-10',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  star: 'm12 2 3 6.500 7 .8-5.200 4.800 1.500 7L12 17.500 5.700 21l1.500-7L2 9.300l7-.8L12 2Z',
  video: 'M3 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm15 4 5-3v10l-5-3',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'm6 9 6 6 6-6',
  phone: 'M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
} as const;

export type IconName = keyof typeof paths;

type IconProps = { name: IconName; className?: string; filled?: boolean };

export function Icon({ name, className = 'h-5 w-5', filled = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
