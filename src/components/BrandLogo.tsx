/**
 * Inline brand mark: the ledger tile. Corner brackets, ledger ruling, and the
 * orange crash-and-recovery spark. Inline SVG so the wordmark renders in
 * Fraunces from the loaded webfont and the mark can sit on any background.
 */

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 36, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1" y="1" width="62" height="62" rx="12" fill="#F7F1E3" />
      <line x1="12" y1="24" x2="52" y2="24" stroke="#181410" strokeOpacity="0.14" strokeWidth="1.5" />
      <line x1="12" y1="34" x2="52" y2="34" stroke="#181410" strokeOpacity="0.14" strokeWidth="1.5" />
      <line x1="12" y1="44" x2="52" y2="44" stroke="#181410" strokeOpacity="0.14" strokeWidth="1.5" />
      <path d="M8 18 V8 H18" fill="none" stroke="#181410" strokeWidth="4" strokeLinecap="square" />
      <path d="M46 8 H56 V18" fill="none" stroke="#181410" strokeWidth="4" strokeLinecap="square" />
      <path d="M56 46 V56 H46" fill="none" stroke="#181410" strokeWidth="4" strokeLinecap="square" />
      <path d="M18 56 H8 V46" fill="none" stroke="#181410" strokeWidth="4" strokeLinecap="square" />
      <path
        d="M13 39 L22 29 L31 45 L51 17"
        fill="none"
        stroke="#E8540A"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="48.5" y="14.5" width="5" height="5" fill="#181410" />
    </svg>
  );
}

interface BrandLockupProps {
  markSize?: number;
  textClassName?: string;
}

export function BrandLockup({ markSize = 34, textClassName = 'text-ink' }: BrandLockupProps) {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark size={markSize} className="rounded-[7px] border border-ink/15" />
      <span className={`font-display text-xl font-black leading-none tracking-tight ${textClassName}`}>
        LocalLedger
      </span>
    </span>
  );
}
