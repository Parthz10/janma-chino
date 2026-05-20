export default function GunaMeter({ value, max }: { value: number; max: number }) {
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, value / max));
  return (
    <div className="relative h-52 w-52">
      <svg viewBox="0 0 220 220" className="h-full w-full">
        <circle cx="110" cy="110" r={radius} stroke="#334155" strokeWidth="18" fill="none" />
        <circle cx="110" cy="110" r={radius} stroke="#f59e0b" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ratio)} transform="rotate(-90 110 110)" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="text-4xl font-bold text-white">{value}</div><div className="text-sm text-slate-400">/ {max} Gunas</div></div>
      </div>
    </div>
  );
}

