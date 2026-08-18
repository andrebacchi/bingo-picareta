import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { generateCard, initialMarks, checkBingo, shuffle, FREE_SPACE } from "@/lib/bingoUtils";
import { PSEUDO_ARGUMENTS } from "@/data/arguments";
import { OPPONENTS } from "@/data/opponents";
import { TAUNTS, COMPLAINTS, VICTORY_TAUNTS } from "@/data/phrases";
import BingoCard from "@/components/BingoCard";
import CalledPanel from "@/components/CalledPanel";
import OpponentPanel from "@/components/OpponentPanel";
import TauntOverlay from "@/components/TauntOverlay";
import { Image } from "@/components/ui/image";
import { Home as HomeIcon, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { playMark, playDraw, playWin, playLose } from "@/lib/sounds";

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
  const [playerName, setPlayerName] = useState("");
  const [playerNameInput, setPlayerNameInput] = useState(() => localStorage.getItem("bp_machine_nick") || "");
  const [victoryPhrase, setVictoryPhrase] = useState("");
  const [tieNames, setTieNames] = useState([]);
  const [tiePlayerPhrase, setTiePlayerPhrase] = useState("");
  const [tieMachinePhrases, setTieMachinePhrases] = useState([]);

  useEffect(() => () => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
  }, []);

  const calledSet = new Set(called);

  const toggleSelect = (o) => {
    setSelectedOpps((prev) => {
      if (prev.some((s) => s.name === o.name)) return prev.filter((s) => s.name !== o.name);
      if (prev.length >= 6) return prev;
      return [...prev, o];
    });
  };

  const start = (selected) => {
    const name = playerNameInput.trim();
    setPlayerName(name);
    localStorage.setItem("bp_machine_nick", name);
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

    // Consolidar resultado no sorteio: checar jogador e máquinas antes de sortear
    const playerWon = checkBingo(myMarks);
    const machineWinners = opponents.filter((o) => checkBingo(o.marks));
    if (playerWon || machineWinners.length > 0) {
      const allWinners = [];
      if (playerWon) allWinners.push("you");
      machineWinners.forEach((o) => allWinners.push(o.name));
      if (allWinners.length > 1) {
        setWinner("tie");
        setTieNames(allWinners);
        setTieMachinePhrases(machineWinners.map(() => VICTORY_TAUNTS[Math.floor(Math.random() * VICTORY_TAUNTS.length)]));
        setTiePlayerPhrase("");
      } else {
        setWinner(allWinners[0]);
      }
      setGameOver(true);
      if (playerWon && machineWinners.length === 0) {
        playWin();
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 } }), 250);
      } else if (!playerWon) {
        setVictoryPhrase(VICTORY_TAUNTS[Math.floor(Math.random() * VICTORY_TAUNTS.length)]);
        playLose();
      } else {
        playWin();
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
      }
      return;
    }

    const remaining = PSEUDO_ARGUMENTS.filter((a) => !calledSet.has(a));
    if (!remaining.length) return;
    const next = shuffle(remaining)[0];
    setCalled((prev) => [...prev, next]);
    setCurrentArg(next);
    playDraw();
    setThinking(true);
    setTimeout(() => {
      const newOpps = opponents.map((o) => {
        const updated = [...o.marks];
        o.card.forEach((a, i) => {
          if (a === next) updated[i] = true;
        });
        return { ...o, marks: updated };
      });
      setOpponents(newOpps);
      if (Math.random() < 0.5) {
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
    }, 3000);
  };

  const toggle = (i) => {
    if (gameOver || myCard[i] === FREE_SPACE) return;
    if (!calledSet.has(myCard[i])) return;
    setMyMarks((prev) => {
      const updated = [...prev];
      updated[i] = !updated[i];
      if (updated[i]) playMark();
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
    setTieNames([]);
    setTiePlayerPhrase("");
    setTieMachinePhrases([]);
    setVictoryPhrase("");
  };

  const rematch = () => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(null);
    setOpponents((prev) =>
      prev.map((o) => ({ ...o, card: generateCard(), marks: initialMarks() }))
    );
    setMyCard(generateCard());
    setMyMarks(initialMarks());
    setCalled([]);
    setCurrentArg(null);
    setGameOver(false);
    setWinner(null);
    setThinking(false);
    setTieNames([]);
    setTiePlayerPhrase("");
    setTieMachinePhrases([]);
    setVictoryPhrase("");
    setPhase("playing");
  };

  const shareResult = async () => {
    const text =
      winner === "you"
        ? `Eu gritei BINGO no Bingo do Picareta e venci os picaretas! 🎉⛏️`
        : `${winner} gritou BINGO no Bingo do Picareta 😈 — vou me preparar pra revanche!`;
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Bingo do Picareta", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setBubble({ name: "share", text: "Resultado copiado!" });
        setTimeout(() => setBubble(null), 2000);
      }
    } catch (e) {
      // usuário cancelou o compartilhamento — ignorar
    }
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
          <p className="text-sm text-slate-500 text-center mb-6">Selecione de 1 a 6 picaretas para enfrentar.</p>
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Seu nome</label>
            <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 focus-within:border-rose-400 px-4 py-3 bg-white">
              <span className="font-bold text-rose-500">Dr.</span>
              <input
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                placeholder="seu nome"
                maxLength={20}
                className="flex-1 bg-transparent outline-none font-bold text-slate-800"
                autoFocus
              />
            </div>
          </div>
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
            disabled={selectedOpps.length < 1 || !playerNameInput.trim()}
            className="mt-6 w-full py-3 rounded-full bg-slate-900 text-white font-bold disabled:opacity-40 hover:bg-slate-800 transition-colors"
          >
            Começar ({selectedOpps.length})
          </button>
        </main>
      </div>
    );
  }

  const bubbleOpponent = bubble ? opponents.find((o) => o.name === bubble.name) : null;
  const winnerOpponent = opponents.find((o) => o.name === winner);
  const pendingBingo = !gameOver && (checkBingo(myMarks) || opponents.some((o) => checkBingo(o.marks)));

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
          <h2 className="text-sm font-bold text-slate-500 mb-2">Sua cartela · <span className="text-slate-900 font-black">Dr. {playerName}</span></h2>
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
              pendingBingo={pendingBingo}
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

      <TauntOverlay opponent={bubbleOpponent} text={bubble?.text} />

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
              className="bg-white rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl"
            >
              {winner === "tie" ? (
                <>
                  <div className="text-5xl mb-2">🤝</div>
                  <h2 className="text-2xl font-black mb-1">EMPATE! 🤝</h2>
                  <p className="text-slate-500 text-sm mb-3">
                    Dr. {playerName} e {tieNames.filter((n) => n !== "you").join(", ")} completaram o bingo ao mesmo tempo!
                  </p>
                  {tieMachinePhrases.map((phrase, i) => (
                    <div key={i} className="relative bg-rose-50 border-2 border-rose-200 rounded-2xl px-4 py-3 mb-2 text-center">
                      <p className="text-xs font-bold text-slate-500 mb-1">{tieNames.filter((n) => n !== "you")[i]}</p>
                      <p className="font-bold text-slate-800 text-sm leading-snug">"{phrase}"</p>
                    </div>
                  ))}
                  {!tiePlayerPhrase ? (
                    <div className="mb-4">
                      <p className="text-sm font-bold text-slate-700 mb-2 text-center">Escolha sua frase de vitória:</p>
                      <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                        {VICTORY_TAUNTS.map((phrase, i) => (
                          <button
                            key={i}
                            onClick={() => setTiePlayerPhrase(phrase)}
                            className="w-full text-left px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-rose-400 hover:bg-rose-50 transition-all"
                          >
                            "{phrase}"
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-300 rounded-2xl px-4 py-3 mb-4 text-center">
                      <p className="text-xs font-bold text-slate-500 mb-1">Dr. {playerName}</p>
                      <p className="font-black text-slate-800 text-sm leading-snug">"{tiePlayerPhrase}"</p>
                    </div>
                  )}
                </>
              ) : winner === "you" ? (
                <>
                  <div className="text-5xl mb-2">🎉</div>
                  <h2 className="text-2xl font-black mb-1">BINGO! 🎉</h2>
                  <p className="text-slate-500 text-sm mb-5">
                    Dr. {playerName} completou uma linha antes dos picaretas!
                  </p>
                </>
              ) : (
                <>
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-3 ring-4 ring-rose-300 shadow-lg">
                    {winnerOpponent?.image ? (
                      <Image src={winnerOpponent.image} alt={winner} fittingType="fill" className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-rose-100">
                        {winnerOpponent?.emoji}
                      </div>
                    )}
                  </div>
                  <div className="relative bg-rose-50 border-2 border-rose-200 rounded-2xl px-4 py-3 mb-4 max-w-xs mx-auto">
                    <p className="font-bold text-slate-800 text-sm">"{victoryPhrase}"</p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-50 border-r-2 border-b-2 border-rose-200 rotate-45"></div>
                  </div>
                  <h2 className="text-xl font-black mb-1">{winner} gritou BINGO 😈</h2>
                  <p className="text-slate-500 text-sm mb-5">Tente de novo!</p>
                </>
              )}
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={rematch}
                  className="px-5 py-2.5 rounded-full bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600"
                >
                  Revanche
                </button>
                <button
                  onClick={shareResult}
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800"
                >
                  Compartilhar
                </button>
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200"
                >
                  Trocar adversários
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