export default function DashaTimeline({ items }: { items: { lord: string; start: string; end: string }[] }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-xl font-semibold">Vimshottari Timeline</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={`${item.lord}-${item.start}`} className="grid gap-1 rounded border border-slate-700 bg-slate-950 p-3">
            <span className="font-semibold text-amber-200">{item.lord}</span>
            <span className="text-sm text-slate-400">{item.start} to {item.end}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

