import { cn } from "@/lib/utils";
import { getWinningLine, FREE_SPACE } from "@/lib/bingoUtils";

export default function BingoCard({ card, marks, onToggle, disabled }) {
  const winLine = marks ? getWinningLine(marks) : null;
  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
      {card.map((arg, i) => {
        const marked = marks?.[i];
        const isFree = arg === FREE_SPACE;
        const isWin = winLine?.includes(i);
        const clickable = !disabled && !isFree && !!onToggle;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onToggle?.(i)}
            disabled={!clickable}
            className={cn(
              "relative min-h-[58px] sm:min-h-[74px] rounded-lg p-1 sm:p-1.5 text-[10px] sm:text-[13px] leading-tight font-semibold text-center flex items-center justify-center transition-all select-none",
              isFree
                ? "bg-amber-300 text-amber-900"
                : marked
                ? "bg-rose-500 text-white shadow-md"
                : "bg-white border-2 border-slate-200 text-slate-700",
              isWin && "ring-2 ring-emerald-500 ring-offset-1 z-10",
              clickable && "hover:scale-[1.04] hover:border-rose-400 cursor-pointer active:scale-95"
            )}
          >
            <span className="relative z-10 px-0.5">
              {isFree ? <span className="text-3xl sm:text-5xl leading-none">⛏️</span> : arg}
            </span>
            {marked && !isFree && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/20 border-2 border-white/80 flex items-center justify-center text-base sm:text-lg font-black">
                  ✓
                </span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}