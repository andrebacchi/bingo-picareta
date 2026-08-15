import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Bot, Plus, LogIn, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-5 py-12 sm:py-16 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold mb-4">
            🎲 Edição cética
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            Bingo do Picareta
          </h1>
          <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-md mx-auto">
            Complete uma linha com os argumentos pseudocientíficos mais clássicos. Rápido, divertido e sem evidância científica.
          </p>
        </motion.div>

        <div className="grid gap-3">
          <button
            onClick={() => navigate("/jogar/maquina")}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Jogar contra a Máquina</h3>
              <p className="text-sm text-slate-500">Partida rápida, sem login.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-rose-500 transition-all" />
          </button>

          <button
            onClick={() => navigate("/jogar/online")}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-slate-900 text-white shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Criar Sala Online</h3>
              <p className="text-sm text-white/60">Convide amigos ou a sala de aula (até 50).</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-all" />
          </button>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <LogIn className="w-6 h-6" />
            </div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO DA SALA"
              maxLength={6}
              className="flex-1 bg-transparent outline-none font-mono font-bold text-slate-700 placeholder:text-slate-300 tracking-wider text-sm uppercase min-w-0"
            />
            <button
              onClick={() => code && navigate(`/jogar/online?sala=${code}`)}
              disabled={!code}
              className="px-4 py-2 rounded-full bg-amber-500 text-white font-semibold text-sm hover:bg-amber-400 disabled:opacity-40 transition-colors shrink-0"
            >
              Entrar
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 px-4">
          Como jogar: cada sorteio revela um argumento. Marque na sua cartela se você o tiver. Complete uma linha, coluna ou diagonal e grite BINGO!
        </p>
      </main>
    </div>
  );
}