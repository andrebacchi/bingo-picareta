import SpeechBubble from "@/components/SpeechBubble";
import { Image } from "@/components/ui/image";

export default function OpponentPanel({ name, emoji, image, marks, isMachine, machineThinking, bubble }) {
  const count = marks?.filter(Boolean).length || 0;
  return (
    <div className="relative flex flex-col items-center gap-2">
      <SpeechBubble text={bubble} />
      <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center ring-2 ring-white shadow">
        {image ? (
          <Image src={image} alt={name} fittingType="fill" className="w-full h-full" />
        ) : (
          <span className="text-2xl">{emoji}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-700">{name}</span>
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