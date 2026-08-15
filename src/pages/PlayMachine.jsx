import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { generateCard, initialMarks, checkBingo, shuffle, FREE_SPACE } from "@/lib/bingoUtils";
import { PSEUDO_ARGUMENTS } from "@/data/arguments";
import { OPPONENTS } from "@/data/opponents";
import { TAUNTS, COMPLAINTS } from "@/data/phrases";
import BingoCard from "@/components/BingoCard";
import CalledPanel from "@/components/CalledPanel";
import OpponentPanel from "@/components/OpponentPanel";
import { Image } from "@/components/ui/image";
import { Home as HomeIcon, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Avatar({ opponent, size = "text-3xl", box = "w-16 h-16" }) {
  if (opponent.image) {
    return (
      <div className={`${box} rounded-full overflow-hidden mx-auto ring-2 ring-white shadow`}>
        <Image src={opponent.image} alt={opponent.name} fittingType="fill" className="w-full h-full" />
      </div>
    );
  }
  return <span className={size}>{opponent.emoji}</span>;
}

export default function PlayMachine() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("setup");
  const [selectedOpps, setSelectedOpps] = useState([OPPONENTS[0]]);
  const [myCard, setMyCard] = useState(() => generateCard());
  const [myMarks, setMyMarks] = useState(() => initialMarks());
  const [opponents, setOpponents] = useState([]);
  const [called, setCalled] = useState([]);
  const [currentArg, setCurrentArg] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [bubble, setBubble] = useState(null);
  const bubbleTimer = useRef(null);

  useEffect(() => () => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
  }, []);

  const calledSet = new Set(called);

  const toggleSelect = (o) => {
    setSelectedOpps((prev) => {
      if (prev.some((s) => s.name === o.name)) return prev.filter((s) => s.name !== o.name);
      if (prev.length >= 3) return prev;
      return [...prev, o];
    });
  };

  const start = (selected) => {
    setOpponents(
      selected.map((o) => ({ name: o.name, emoji: o.emoji, image: o.image, card: generateCard(), marks: initialMarks() }))
    );
    setMyCard(generateCard());
    setMyMarks(initialMarks());
    setCalled([]);
    setCurrentArg(null);
    setGameOver(false);
    setWinner(null);
    setThinking(false);
    setBubble(null);
    setPhase("playing");
  };

  const draw = () => {
    if (gameOver || thinking) return;
    const remaining = PSEUDO_ARGUMENTS.filter((a) => !calledSet.has(a));
    if (!remaining.length) return;
    const next = shuffle(remaining)[0];
    setCalled((prev) => [...prev, next]);
    setCurrentArg(next);
    setThinking(true);
    setTimeout(() => {
      let newWinner = null;
      const newOpps = opponents.map((o) => {
        const updated = [...o.marks];
        o.card.forEach((a, i) => {
          if (a === next) updated[i] = true;
        });
        if (!newWinner && checkBingo(updated)) newWinner = o.name;
        return { ...o, marks: updated };
      });
      setOpponents(newOpps);
      if (newWinner) {
        setWinner(newWinner);
        setGameOver(true);
      } else if (Math.random() < 0.5) {
        const myCount = myMarks.filter(Boolean).length;
        let bestDiff = 0;
        let bestName = null;
        let ahead = false;
        newOpps.forEach((o) => {
          const diff = o.marks.filter(Boolean).length - myCount;
          if (Math.abs(diff) > Math.abs(bestDiff)) {
            bestDiff = diff;
            bestName = o.name;
            ahead = diff > 0;
          }
        });
        if (bestName && Math.abs(bestDiff) >= 1) {
          const pool = ahead ? TAUNTS : COMPLAINTS;
          const text = pool[Math.floor(Math.random() * pool.length)];
          setBubble({ name: bestName, text });
          if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
          bubbleTimer.current = setTimeout(() => setBubble(null), 3500);
        }
      }
      setThinking(false);
    }, 1400);
  };

  const toggle = (i) => {
    if (gameOver || myCard[i] === FREE_SPACE) return;
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
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(null);
    setPhase("setup");
    setSelectedOpps([OPPONENTS[0]]);
    setCalled([]);
    setCurrentArg(null);
    setGameOver(false);
    setWinner(null);
    setThinking(false);
  };

  if (phase === "setup") {
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
          <div className="w-16" />
        </header>
        <main className="max-w-xl mx-auto px-5 py-8">
          <h2 className="text-xl font-black text-slate-900 text-center mb-1">Escolha seus adversários</h2>
          <p className="text-sm text-slate-500 text-center mb-6">Selecione de 1 a 3 picaretas para enfrentar.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {OPPONENTS.map((o) => {
              const selected = selectedOpps.some((s) => s.name === o.name);
              return (
                <button
                  key={o.name}
                  onClick={() => toggleSelect(o)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    selected ? "border-rose-500 bg-rose-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <Avatar opponent={o} />
                  <span className="text-sm font-bold text-slate-700 text-center">{o.name}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => start(selectedOpps)}
            disabled={selectedOpps.length < 1}
            className="mt-6 w-full py-3 rounded-full bg-slate-900 text-white font-bold disabled:opacity-40 hover:bg-slate-800 transition-colors"
          >
            Começar ({selectedOpps.length})
          </button>
        </main>
      </div>
    );
  }

  const winnerEmoji = opponents.find((o) => o.name === winner)?.emoji;

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
              canDraw={!gameOver && !thinking && PSEUDO_ARGUMENTS.length - called.length > 0}
              remaining={PSEUDO_ARGUMENTS.length - called.length}
            />
          </div>
          <div className="flex flex-col gap-3">
            {opponents.map((o) => (
              <div key={o.name} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <OpponentPanel
                  name={o.name}
                  emoji={o.emoji}
                  image={o.image}
                  marks={o.marks}
                  isMachine
                  machineThinking={thinking}
                  bubble={bubble?.name === o.name ? bubble.text : null}
                />
              </div>
            ))}
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
              <div className="text-5xl mb-2">{winner === "you" ? "🎉" : winnerEmoji}</div>
              <h2 className="text-2xl font-black mb-1">
                {winner === "you" ? "BINGO! 🎉" : `${winner} gritou BINGO 😈`}
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                {winner === "you"
                  ? "Você completou uma linha antes dos picaretas!"
                  : "Um adversário completou primeiro. Tente de novo!"}
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