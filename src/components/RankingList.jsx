import { cn } from "@/lib/utils";

export default function RankingList({ players, currentUserId }) {
  const sorted = [...players]
    .sort((a, b) => b.score - a.score || b.lines_completed - a.lines_completed)
    .slice(0, 5);
  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((p, idx) => {
        const isMe = p.user_id === currentUserId;
        const marked = p.marks?.filter(Boolean).length || 0;
        return (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-xl",
              isMe ? "bg-rose-50 border border-rose-200" : "bg-slate-50"
            )}
          >
            <span className="w-5 text-center font-black text-sm text-slate-400">{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">
                {p.display_name}
                {isMe && <span className="text-rose-500 font-normal"> (você)</span>}
              </p>
              <p className="text-[11px] text-slate-400">
                {p.lines_completed} linhas · {marked}/25
              </p>
            </div>
            <span className="text-sm font-black text-rose-600 tabular-nums">{p.score}</span>
          </div>
        );
      })}
    </div>
  );
}