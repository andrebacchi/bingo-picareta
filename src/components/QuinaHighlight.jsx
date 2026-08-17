import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function QuinaHighlight({ playerName }) {
  return (
    <AnimatePresence>
      {playerName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none px-4 w-full max-w-sm"
        >
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-3xl px-6 py-5 shadow-2xl text-center ring-4 ring-amber-200">
            <Sparkles className="w-9 h-9 mx-auto mb-2 animate-pulse" />
            <p className="text-xs font-black uppercase tracking-widest opacity-90 mb-1">⚡ QUINA! ⚡</p>
            <p className="font-black text-base sm:text-lg leading-snug">
              {playerName} acaba de completar uma QUINA!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}