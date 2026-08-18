import { useState } from "react";
import { Shuffle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ExplanationDialog from "@/components/ExplanationDialog";

export default function CalledPanel({ currentArg, called, onDraw, canDraw, remaining, pendingBingo }) {
  const [showExplanation, setShowExplanation] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onDraw}
        disabled={!canDraw}
        className={cn(
          "group flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95",
          pendingBingo ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-900 hover:bg-slate-800"
        )}
      >
        <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        {pendingBingo ? "Confirmar resultado" : "Sortear argumento"}
      </button>
      {pendingBingo && (
        <p className="text-xs font-bold text-emerald-500">BINGO detectado! Clique para confirmar.</p>
      )}
      <div className="min-h-[92px] w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentArg ? (
            <motion.button
              key={currentArg + called.length}
              onClick={() => setShowExplanation(true)}
              initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-center font-bold text-base sm:text-lg shadow-xl max-w-xs cursor-pointer hover:scale-105 transition-transform"
            >
              {currentArg}
            </motion.button>
          ) : (
            <p className="text-slate-400 text-sm text-center">Sorteeie o primeiro argumento…</p>
          )}
        </AnimatePresence>
      </div>
      {called.length > 0 && (
        <p className="text-xs text-slate-400">{called.length} sorteados · {remaining} restantes</p>
      )}
      {currentArg && (
        <p className="text-xs font-semibold text-rose-400 flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Toque no argumento para entender o erro
        </p>
      )}
      <ExplanationDialog argument={currentArg} open={showExplanation} onOpenChange={setShowExplanation} />
    </div>
  );
}