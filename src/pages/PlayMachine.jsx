import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCard, initialMarks, checkBingo, shuffle } from "@/lib/bingoUtils";
import { PSEUDO_ARGUMENTS } from "@/data/arguments";
import BingoCard from "@/components/BingoCard";
import CalledPanel from "@/components/CalledPanel";
import OpponentPanel from "@/components/OpponentPanel";
import { Home as HomeIcon, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PlayMachine() {
  const navigate = useNavigate();
  const [myCard, setMyCard] = useState(() => generateCard());
  const [myMarks, setMyMarks] = useState(() => initialMarks());
  const [machineCard, setMachineCard] = useState(() => generateCard());
  const [machineMarks, setMachineMarks] = useState(() => initialMarks());
  const [called, setCalled] = useState([]);
  const [currentArg, setCurrentArg] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [machineThinking, setMachineThinking] = useState(false);

  const calledSet = new Set(called);

  const draw = () => {
    if (gameOver || machineThinking) return;
    const remaining = PSEUDO_ARGUMENTS.filter((a) => !calledSet.has(a));
    if (!remaining.length) return;
    const next = shuffle(remaining)[0];
    const newCalled = [...called, next];
    setCalled(newCalled);
    setCurrentArg(next);
    setMachineThinking(true);
    setTimeout(() => {
      setMachineMarks((prev) => {
        const updated = [...prev];
        machineCard.forEach((a, i) => {
          if (a === next) updated[i] = true;
        });
        if (checkBingo(updated)) {
          setWinner("machine");
          setGameOver(true);
        }
        return updated;
      });
      setMachineThinking(false);
    }, 1400);
  };

  const toggle = (i) => {
    if (gameOver || myCard[i] === "GRÁTIS") return;
    if (!calledSet.has(myCard[i])) return;
    setMyMarks((prev) => {
      const updated = [...prev];
      updated[i] = !updated[i];
      if (updated[i] && checkBingo(updated)) {
        setWinner("you");
        setGameOver(true);
      }
      return updated;
    });
  };

  const reset = () => {
    setMyCard(generateCard());
    setMyMarks(initialMarks());
    setMachineCard(generateCard());
    setMachineMarks(initialMarks());
    setCalled([]);
    setCurrentArg(null);
    setGameOver(false);
    setWinner(null);
    setMachineThinking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white">
      <header className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <HomeIcon className="w-4 h-4" /> Início
        </button>
        <h1 className="font-display font-black text-lg sm:text-xl text-slate-900">Bingo do Picareta</h1>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <RotateCcw className="w-4 h-4" /> Reiniciar
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <section>
          <h2 className="text-sm font-bold text-slate-500 mb-2">Sua cartela</h2>
          <BingoCard card={myCard} marks={myMarks} onToggle={toggle} disabled={gameOver} />
        </section>
        <aside className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <CalledPanel
              currentArg={currentArg}
              called={called}
              onDraw={draw}
              canDraw={!gameOver && !machineThinking && PSEUDO_ARGUMENTS.length - called.length > 0}
              remaining={PSEUDO_ARGUMENTS.length - called.length}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <OpponentPanel name="Máquina" marks={machineMarks} isMachine machineThinking={machineThinking} />
          </div>
        </aside>
      </main>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <Trophy className="w-14 h-14 mx-auto mb-3 text-amber-500" />
              <h2 className="text-2xl font-black mb-1">
                {winner === "you" ? "BINGO! 🎉" : "A máquina gritou BINGO 😈"}
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                {winner === "you"
                  ? "Você completou uma linha antes da máquina!"
                  : "A máquina completou primeiro. Tente de novo!"}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800"
                >
                  Jogar de novo
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200"
                >
                  Início
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}