export default function PlanetTooltip({ name, degree, dignity, retrograde }: { name: string; degree: number; dignity: string; retrograde?: boolean }) {
  return (
    <div className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm shadow-xl">
      <div className="font-semibold text-white">{name} {retrograde ? '[R]' : ''}</div>
      <div className="text-slate-300">{degree.toFixed(2)}° · {dignity}</div>
    </div>
  );
}

