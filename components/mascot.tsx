export function Mascot({ className = "" }: { className?: string }) {
  return (
    <div className={`float-mascot ${className}`}>
      <svg
        viewBox="0 0 280 260"
        role="img"
        aria-label="A smiling ghost holding a small pumpkin"
        className="h-auto w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
      >
        <ellipse cx="128" cy="232" rx="78" ry="12" fill="#000" opacity="0.25" />
        <path
          d="M70 118c0-48 28-86 66-86s66 38 66 86v62c0 8-8 14-16 12-8 8-18 8-26 0-8 8-18 8-26 0-8 8-18 8-26 0-8 8-18 8-26 0-8 2-12-4-12-12V118z"
          fill="#f7fff9"
        />
        <ellipse cx="112" cy="124" rx="8" ry="12" fill="#241232" />
        <ellipse cx="150" cy="124" rx="8" ry="12" fill="#241232" />
        <path d="M116 148c8 10 20 10 30 0" fill="none" stroke="#241232" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="96" cy="142" rx="8" ry="5" fill="#ffb4c8" opacity="0.85" />
        <ellipse cx="168" cy="142" rx="8" ry="5" fill="#ffb4c8" opacity="0.85" />
        <path d="M188 96c8-28 28-36 36-18 6 14-4 24-14 26" fill="none" stroke="#241232" strokeWidth="4" strokeLinecap="round" />
        <g transform="translate(168 132)">
          <path d="M46 18c8-16 4-28-6-28-8 2-10 14-8 24" fill="#7dce7a" />
          <circle cx="36" cy="58" r="34" fill="#ff7a18" />
          <path d="M36 26c-6 14-6 48 0 64M22 40c10 6 22 6 32 0M20 62c12 6 24 6 36 0M24 80c8 4 16 4 24 0" fill="none" stroke="#e85d04" strokeWidth="3" strokeLinecap="round" />
          <path d="M28 50l6 8-8 4zM44 48l8 6-2 8z" fill="#2a1206" />
          <path d="M30 70h16" stroke="#2a1206" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
