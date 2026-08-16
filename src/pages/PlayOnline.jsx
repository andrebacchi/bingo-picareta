import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  generateCard,
  initialMarks,
  countCompletedLines,
  isFullCard,
  checkBingo,
  shuffle,
  FREE_SPACE
} from "@/lib/bingoUtils";
import { PSEUDO_ARGUMENTS } from "@/data/arguments";
import { POINTS_PER_MARK, LINE_BONUS, FIRST_LINE_BONUS, FULL_CARD_BONUS, MAX_PLAYERS } from "@/data/scoring";
import BingoCard from "@/components/BingoCard";
import CalledPanel from "@/components/CalledPanel";
import RankingList from "@/components/RankingList";
import { Home as HomeIcon, Copy, Check, Loader2, Trophy, Users, Play } from "lucide-react";
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
  const [uid, setUid] = useState(() => localStorage.getItem("bp_uid") || "");
  const [nickname, setNickname] = useState(() => localStorage.getItem("bp_nick") || "");
  const [nickInput, setNickInput] = useState("");
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [myCard, setMyCard] = useState([]);
  const [myMarks, setMyMarks] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [myLines, setMyLines] = useState(0);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [winMode, setWinMode] = useState("full");

  const ready = Boolean(uid && nickname);

  const submitNick = () => {
    const n = nickInput.trim();
    if (!n) return;
    const id =
      (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
    localStorage.setItem("bp_uid", id);
    localStorage.setItem("bp_nick", n);
    setUid(id);
    setNickname(n);
  };

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const code = searchParams.get("sala");
    (async () => {
      try {
        let g;
        if (code) {
          const found = await base44.entities.Game.filter({ room_code: code });
          if (!found.length) {
            setError("Sala não encontrada.");
            setLoading(false);
            return;
          }
          g = found[0];
          const existing = await base44.entities.Player.filter({ game_id: g.id, user_id: uid });
          let p;
          if (existing.length) {
            p = existing[0];
          } else {
            const all = await base44.entities.Player.filter({ game_id: g.id });
            if (all.length >= MAX_PLAYERS) {
              setError("Esta sala está cheia.");
              setLoading(false);
              return;
            }
            p = await base44.entities.Player.create({
              game_id: g.id,
              room_code: code,
              user_id: uid,
              display_name: `Dr. ${nickname}`,
              card: generateCard(),
              marks: initialMarks(),
              lines_completed: 0,
              score: 0
            });
          }
          setGame(g);
          setMyCard(p.card || []);
          setMyMarks(p.marks || initialMarks());
          setMyScore(p.score || 0);
          setMyLines(p.lines_completed || 0);
          setMyPlayerId(p.id);
          const ps = await base44.entities.Player.filter({ game_id: g.id });
          const map = {};
          ps.forEach((x) => (map[x.id] = x));
          setPlayers(map);
        } else {
          const newCode = Math.random().toString(36).slice(2, 7).toUpperCase();
          g = await base44.entities.Game.create({
            room_code: newCode,
            status: "waiting",
            host_id: uid,
            called_arguments: [],
            first_line_player_id: "",
            first_line_player_name: "",
            winner_id: "",
            winner_name: "",
            win_mode: winMode
          });
          const p = await base44.entities.Player.create({
            game_id: g.id,
            room_code: newCode,
            user_id: uid,
            display_name: nickname,
            card: generateCard(),
            marks: initialMarks(),
            lines_completed: 0,
            score: 0
          });
          setGame(g);
          setMyCard(p.card);
          setMyMarks(p.marks);
          setMyScore(0);
          setMyLines(0);
          setMyPlayerId(p.id);
          setPlayers({ [p.id]: p });
        }
      } catch (e) {
        console.error(e);
        setError("Não foi possível carregar a sala.");
      }
      setLoading(false);
    })();
  }, [ready]);

  useEffect(() => {
    if (!game) return;
    const unsub = base44.entities.Game.subscribe((event) => {
      if (event.data?.id === game.id) setGame(event.data);
    });
    return unsub;
  }, [game?.id]);

  useEffect(() => {
    if (!game) return;
    const unsub = base44.entities.Player.subscribe((event) => {
      if (!event.data || event.data.game_id !== game.id) return;
      setPlayers((prev) => {
        const next = { ...prev };
        if (event.type === "delete") delete next[event.data.id];
        else next[event.data.id] = event.data;
        return next;
      });
    });
    return unsub;
  }, [game?.id]);

  if (!ready)
    return (
      <Shell>
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Entrar na partida</h2>
          <p className="text-sm text-slate-500 mb-4">Digite só um apelido — sem cadastro, sem login.</p>
          {!searchParams.get("sala") && (
            <div className="mb-4 text-left">
              <p className="text-sm font-bold text-slate-700 mb-2">Modo de vitória</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWinMode("line")}
                  className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${winMode === "line" ? "border-rose-500 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-600"}`}
                >
                  Quina
                </button>
                <button
                  type="button"
                  onClick={() => setWinMode("full")}
                  className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${winMode === "full" ? "border-rose-500 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-600"}`}
                >
                  Cartela cheia
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {winMode === "line" ? "Quem completar uma fileira primeiro vence" : "Quem preencher a cartela inteira vence"}
              </p>
            </div>
          )}
          <input
            value={nickInput}
            onChange={(e) => setNickInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitNick()}
            placeholder="Seu apelido"
            maxLength={20}
            autoFocus
            className="w-full text-center font-bold text-lg px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 outline-none mb-3"
          />
          <button
            onClick={submitNick}
            disabled={!nickInput.trim()}
            className="w-full py-3 rounded-full bg-rose-500 text-white font-bold disabled:opacity-40 hover:bg-rose-600 transition-colors"
          >
            Jogar
          </button>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-slate-500 hover:text-slate-800 font-semibold"
          >
            Voltar
          </button>
        </div>
      </Shell>
    );

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

  const isHost = game.host_id === uid;
  const called = game.called_arguments || [];
  const currentArg = called[called.length - 1] || null;
  const playerList = Object.values(players).map((p) =>
    p.id === myPlayerId ? { ...p, marks: myMarks, score: myScore, lines_completed: myLines } : p
  );
  const waiting = game.status === "waiting";
  const gameOver = game.status === "finished";

  const start = async () => {
    await base44.entities.Game.update(game.id, { status: "playing" });
  };

  const draw = async () => {
    if (game.status !== "playing" || gameOver) return;
    const calledSet = new Set(called);
    const remaining = PSEUDO_ARGUMENTS.filter((a) => !calledSet.has(a));
    if (!remaining.length) return;
    const next = shuffle(remaining)[0];
    await base44.entities.Game.update(game.id, { called_arguments: [...called, next] });
  };

  const mark = async (i) => {
    if (game.status !== "playing" || gameOver) return;
    if (myMarks[i]) return;
    if (myCard[i] === FREE_SPACE) return;
    if (!called.includes(myCard[i])) return;
    const newMarks = [...myMarks];
    newMarks[i] = true;
    const oldLines = myLines;
    const newLines = countCompletedLines(newMarks);
    let gain = POINTS_PER_MARK;
    if (newLines > oldLines) gain += (newLines - oldLines) * LINE_BONUS;
    if (newLines > oldLines && !game.first_line_player_id) {
      gain += FIRST_LINE_BONUS;
      base44.entities.Game.update(game.id, {
        first_line_player_id: uid,
        first_line_player_name: `Dr. ${nickname}`
      });
      toast.success(`Primeira quina! +${FIRST_LINE_BONUS} bônus`);
    }
    const newScore = myScore + gain;
    setMyMarks(newMarks);
    setMyLines(newLines);
    setMyScore(newScore);
    await base44.entities.Player.update(myPlayerId, {
      marks: newMarks,
      lines_completed: newLines,
      score: newScore
    });
    const hasWon = (game.win_mode || "full") === "line" ? checkBingo(newMarks) : isFullCard(newMarks);
    if (hasWon) {
      await base44.entities.Game.update(game.id, {
        winner_id: uid,
        winner_name: `Dr. ${nickname}`,
        status: "finished"
      });
    }
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
        <div className="max-w-md w-full">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Sala {game.room_code}</h2>
            <p className="text-sm text-slate-500">
              {playerList.length} jogador{playerList.length === 1 ? "" : "es"} na sala ·{" "}
              <span className="font-bold text-rose-500">
                {game.win_mode === "line" ? "Quina" : "Cartela cheia"}
              </span>
            </p>
          </div>
          <div className="font-mono text-2xl font-black tracking-[0.3em] text-slate-900 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl py-3 mb-3 text-center">
            {game.room_code}
          </div>
          <button
            onClick={copy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 mb-4"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{" "}
            {copied ? "Link copiado!" : "Copiar link de convite"}
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 mb-4 max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {playerList.map((p) => (
                <span
                  key={p.id}
                  className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full"
                >
                  {p.display_name}
                  {p.user_id === game.host_id && " 👑"}
                </span>
              ))}
            </div>
          </div>
          {isHost ? (
            <button
              onClick={start}
              disabled={playerList.length < 1}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-rose-500 text-white font-bold disabled:opacity-40 hover:bg-rose-600 transition-colors"
            >
              <Play className="w-4 h-4" /> Iniciar jogo
            </button>
          ) : (
            <p className="text-center text-sm text-slate-500">
              Aguardando o anfitrião iniciar o jogo…
            </p>
          )}
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full text-sm text-slate-500 hover:text-slate-800 font-semibold"
          >
            Sair da sala
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
            Sua cartela · <span className="text-rose-600 font-black">{myScore} pts</span>
          </h2>
          <BingoCard card={myCard} marks={myMarks} onToggle={mark} disabled={gameOver} />
        </section>
        <aside className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            {isHost ? (
              <CalledPanel
                currentArg={currentArg}
                called={called}
                onDraw={draw}
                canDraw={!gameOver && game.status === "playing" && PSEUDO_ARGUMENTS.length - called.length > 0}
                remaining={PSEUDO_ARGUMENTS.length - called.length}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 min-h-[92px] justify-center">
                {currentArg ? (
                  <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-center font-bold text-base shadow-xl max-w-xs">
                    {currentArg}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center">Aguardando o anfitrião sortear…</p>
                )}
                <p className="text-xs text-slate-400">{called.length} sorteados</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3">
            <h3 className="text-xs font-bold text-slate-500 mb-2 px-1">RANKING · TOP 5</h3>
            <RankingList players={playerList} currentUserId={uid} />
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
              className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-4">
                <Trophy className="w-14 h-14 mx-auto mb-2 text-amber-500" />
                <h2 className="text-2xl font-black text-slate-900">
                  {game.win_mode === "line" ? "Quina! 🎉" : "Cartela cheia! 🎉"}
                </h2>
                <p className="text-slate-500 text-sm">
                  <span className="font-bold text-slate-700">{game.winner_name}</span> fechou o jogo
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto mb-4">
                <RankingList players={playerList} currentUserId={uid} />
              </div>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800"
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