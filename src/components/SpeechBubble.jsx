import { motion, AnimatePresence } from "framer-motion";

export default function SpeechBubble({ text }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full z-20 w-44"
        >
          <div className="relative bg-white border border-slate-200 shadow-lg rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 text-center">
            {text}
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}