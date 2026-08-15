import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateCard, initialMarks, checkBingo, shuffle, FREE_SPACE } from "@/lib/bingoUtils";
import { PSEUDO_ARGUMENTS } from "@/data/arguments";
import BingoCard from "@/components/BingoCard";
import CalledPanel from "@/components/CalledPanel";
import OpponentPanel from "@/components/OpponentPanel";
import { Home as HomeIcon, Copy, Check, Loader2, Trophy, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function Shell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-amber-50 via-rose-50 to-white">
      {children}
    </div>
  );
}

export default function PlayOnline() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44
      .auth.me()
      .then(setMe)
      .catch(() => {
        setError("Você precisa estar logado para jogar online.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!me) return;
    const code = searchParams.get("sala");
    (async () => {
      try {
        if (code) {
          const existing = await base44.entities.Game.filter({ room_code: code });
          if (!existing.length) {
            setError("Sala não encontrada.");
            setLoading(false);
            return;
          }
          const g = existing[0];
          if (g.host_id === me.id) {
            setGame(g);
          } else if (g.guest_id && g.guest_id !== me.id) {
            setError("Esta sala já está cheia.");
          } else {
            const updated = await base44.entities.Game.update(g.id, {
              guest_id: me.id,
              guest_card: generateCard(),
              guest_marks: initialMarks(),
              status: "playing"
            });
            setGame(updated);
          }
        } else {
          const newCode = Math.random().toString(36).slice(2, 7).toUpperCase();
          const g = await base44.entities.Game.create({
            room_code: newCode,
            status: "waiting",
            host_id: me.id,
            called_arguments: [],
            host_card: generateCard(),
            host_marks: initialMarks(),
            guest_card: [],
            guest_marks: [],
            winner: ""
          });
          setGame(g);
        }
      } catch (e) {
        console.error(e);
        setError("Não foi possível carregar a sala.");
      }
      setLoading(false);
    })();
  }, [me]);

  useEffect(() => {
    if (!game) return;
    const unsub = base44.entities.Game.subscribe((event) => {
      if (event.data?.id === game.id) setGame(event.data);
    });
    return unsub;
  }, [game?.id]);

  if (loading)
    return (
      <Shell>
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </Shell>
    );
  if (error)
    return (
      <Shell>
        <div className="text-center">
          <p className="text-slate-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm"
          >
            Voltar ao início
          </button>
        </div>
      </Shell>
    );
  if (!game) return null;

  const isHost = game.host_id === me.id;
  const myCard = isHost ? game.host_card : game.guest_card;
  const myMarks = isHost ? game.host_marks : game.guest_marks;
  const oppMarks = isHost ? game.guest_marks : game.host_marks;
  const called = game.called_arguments || [];
  const currentArg = called[called.length - 1] || null;
  const gameOver = !!game.winner;
  const winnerIsMe =
    gameOver && ((game.winner === "host" && isHost) || (game.winner === "guest" && !isHost));
  const waiting = game.status === "waiting";

  const updateGame = async (patch) => {
    const updated = await base44.entities.Game.update(game.id, patch);
    setGame(updated);
  };

  const draw = async () => {
    if (game.status !== "playing" || gameOver) return;
    const calledSet = new Set(called);
    const remaining = PSEUDO_ARGUMENTS.filter((a) => !calledSet.has(a));
    if (!remaining.length) return;
    const next = shuffle(remaining)[0];
    await updateGame({ called_arguments: [...called, next] });
  };

  const toggle = async (i) => {
    if (game.status !== "playing" || gameOver) return;
    if (myCard[i] === FREE_SPACE) return;
    if (!called.includes(myCard[i])) return;
    const updated = [...myMarks];
    updated[i] = !updated[i];
    const patch = isHost ? { host_marks: updated } : { guest_marks: updated };
    if (updated[i] && checkBingo(updated)) {
      patch.winner = isHost ? "host" : "guest";
      patch.status = "finished";
    }
    await updateGame(patch);
  };

  const shareUrl = `${window.location.origin}/jogar/online?sala=${game.room_code}`;
  const copy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (waiting)
    return (
      <Shell>
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Aguardando seu amigo…</h2>
          <p className="text-sm text-slate-500 mb-5">Compartilhe o código ou o link abaixo.</p>
          <div className="font-mono text-3xl font-black tracking-[0.3em] text-slate-900 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl py-4 mb-3">
            {game.room_code}
          </div>
          <button
            onClick={copy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{" "}
            {copied ? "Link copiado!" : "Copiar link de convite"}
          </button>
          <p className="text-xs text-slate-400 mt-4 break-all">{shareUrl}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-5 text-sm text-slate-500 hover:text-slate-800 font-semibold"
          >
            Cancelar
          </button>
        </div>
      </Shell>
    );

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
        <div className="text-xs font-mono font-bold text-slate-400">SALA {game.room_code}</div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <section>
          <h2 className="text-sm font-bold text-slate-500 mb-2">
            Sua cartela {isHost ? "(anfitrião)" : "(convidado)"}
          </h2>
          <BingoCard card={myCard} marks={myMarks} onToggle={toggle} disabled={gameOver} />
        </section>
        <aside className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <CalledPanel
              currentArg={currentArg}
              called={called}
              onDraw={draw}
              canDraw={!gameOver && game.status === "playing" && PSEUDO_ARGUMENTS.length - called.length > 0}
              remaining={PSEUDO_ARGUMENTS.length - called.length}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <OpponentPanel name={isHost ? "Amigo" : "Anfitrião"} marks={oppMarks} />
          </div>
        </aside>
      </main>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <Trophy className="w-14 h-14 mx-auto mb-3 text-amber-500" />
              <h2 className="text-2xl font-black mb-1">
                {winnerIsMe ? "BINGO! 🎉" : "Seu amigo gritou BINGO 😅"}
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                {winnerIsMe
                  ? "Você completou uma linha primeiro!"
                  : "Quem completou primeiro venceu. Quer jogar de novo?"}
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800"
              >
                Voltar ao início
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}