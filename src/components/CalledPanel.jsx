import { Sparkles, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CalledPanel({ currentArg, called, onDraw, canDraw, remaining }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onDraw}
        disabled={!canDraw}
        className="group flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-bold text-sm shadow-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        Sortear argumento
      </button>
      <div className="min-h-[92px] w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentArg ? (
            <motion.div
              key={currentArg + called.length}
              initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-center font-bold text-base sm:text-lg shadow-xl max-w-xs"
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" />
              {currentArg}
            </motion.div>
          ) : (
            <p className="text-slate-400 text-sm text-center">Sorteeie o primeiro argumento…</p>
          )}
        </AnimatePresence>
      </div>
      {called.length > 0 && (
        <p className="text-xs text-slate-400">{called.length} sorteados · {remaining} restantes</p>
      )}
    </div>
  );
}