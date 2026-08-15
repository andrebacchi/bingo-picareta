export default function OpponentPanel({ name, marks, isMachine, machineThinking }) {
  const count = marks?.filter(Boolean).length || 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-700">{name}</span>
        {isMachine && <span className="text-base">🤖</span>}
        {machineThinking && <span className="text-xs text-rose-500 animate-pulse">marcando…</span>}
      </div>
      <div className="grid grid-cols-5 gap-0.5">
        {marks?.map((m, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-sm transition-colors ${m ? "bg-rose-500" : "bg-slate-200"}`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-400">{count} marcados</p>
    </div>
  );
}