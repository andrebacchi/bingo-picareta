import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/image";

export default function TauntOverlay({ opponent, text }) {
  return (
    <AnimatePresence>
      {opponent && text ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-x-0 top-20 z-50 flex justify-center px-4 pointer-events-none"
        >
          <motion.div
            initial={{ y: -30, scale: 0.85 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -30, scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-rose-200 px-4 py-3 max-w-sm"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-rose-300 shadow shrink-0">
              {opponent.image ? (
                <Image src={opponent.image} alt={opponent.name} fittingType="fill" className="w-full h-full" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-3xl bg-rose-50">
                  {opponent.emoji}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-500 mb-0.5">{opponent.name}</p>
              <p className="text-sm font-semibold text-slate-800 leading-snug">{text}</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}