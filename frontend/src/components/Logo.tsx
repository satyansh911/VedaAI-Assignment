interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 36, withWordmark = true, className = '' }: Props) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="veda-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2A2A2A" />
            <stop offset="1" stopColor="#0F0F0F" />
          </linearGradient>
          <linearGradient id="veda-v" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFB07A" />
            <stop offset="0.6" stopColor="#FB7C30" />
            <stop offset="1" stopColor="#C5571A" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#veda-bg)" />
        <path
          d="M9 11.5 L20 30 L31 11.5 L26 11.5 L20 22 L14 11.5 Z"
          fill="url(#veda-v)"
        />
      </svg>
      {withWordmark && (
        <span className="text-[20px] font-extrabold tracking-tight text-ink-900 dark:text-white">
          VedaAI
        </span>
      )}
    </div>
  );
}
