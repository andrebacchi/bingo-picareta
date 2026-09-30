import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home as HomeIcon, LogOut, Megaphone } from "lucide-react";
import BingoCard from "@/components/BingoCard";
import { initialMarks, checkBingo, isFullCard } from "@/lib/bingoUtils";
import { randomCode, cardFor, normCode } from "@/lib/classroom";
import { playMark, playWin } from "@/lib/sounds";

const KEY = "bingoSala.aluno";
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && s.game && s.card && Array.isArray(s.marks) && s.marks.length === 25) return s;
  } catch { /* ignore */ }
  return null;
}

export default function ClassroomStudent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const urlCode = normCode(params.get("codigo") || "").slice(0, 4);
  const [me, setMe] = useState(() => {
    const s = load();
    return s && (!urlCode || s.game === urlCode) ? s : null;
  });
  const [game, setGame] = useState(urlCode);
  const [name, setName] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    try { if (me) localStorage.setItem(KEY, JSON.stringify(me)); else localStorage.removeItem(KEY); } catch { /* ignore */ }
  }, [me]);

  const done = !!me && (checkBingo(me.marks) || isFullCard(me.marks));
  useEffect(() => { if (done) { try { playWin(); } catch { /* ignore */ } } }, [done]);

  const join = (e) => {
    e.preventDefault();
    const g = normCode(game);
    if (g.length !== 4) return;
    setMe({ game: g, card: randomCode(4), name: name.trim(), marks: initialMarks() });
  };

  if (!me) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white">
        <header className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"><HomeIcon className="w-4 h-4" /> Início</button>
          <h1 className="font-display font-black text-lg text-slate-900">Partida da turma</h1><span className="w-14" />
        </header>
        <main className="max-w-md mx-auto px-4 pb-10">
          <form onSubmit={join} className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 grid gap-4">
            <p className="text-slate-600 text-sm">Digite o código que aparece no telão. Você vai receber uma cartela só sua.</p>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">Código da partida</span>
              <input value={game} onChange={(e) => setGame(normCode(e.target.value).slice(0, 4))} placeholder="EX.: PX42" autoFocus={!urlCode}
                className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 outline-none font-mono font-black text-3xl tracking-[0.3em] text-center uppercase" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">Seu nome <span className="font-normal text-slate-400">(opcional)</span></span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Como quer ser chamado"
                className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 outline-none font-semibold" />
            </label>
            <button type="submit" disabled={normCode(game).length !== 4}
              className="py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-black text-lg disabled:opacity-40">Receber minha cartela</button>
          </form>
        </main>
      </div>
    );
  }

  const card = cardFor(me.game, me.card);
  const cardCode = `${me.game}-${me.card}`;
  const full = isFullCard(me.marks);
  const line = checkBingo(me.marks);
  const toggle = (i) => {
    try { playMark(); } catch { /* ignore */ }
    setMe((s) => { const m = [...s.marks]; m[i] = !m[i]; return { ...s, marks: m }; });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white">
      <header className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"><HomeIcon className="w-4 h-4" /> Início</button>
        <h1 className="font-display font-black text-lg text-slate-900">Partida {me.game}</h1>
        <button onClick={() => setConfirmLeave(true)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"><LogOut className="w-4 h-4" /> Sair</button>
      </header>
      <main className="max-w-2xl mx-auto px-4 pb-10 grid gap-4">
        {confirmLeave && (
          <div className="rounded-2xl border-2 border-rose-300 bg-white p-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-slate-700 flex-1 min-w-[200px]">Sair da partida? Você perde esta cartela.</p>
            <button onClick={() => setMe(null)} className="px-4 py-2 rounded-full bg-rose-500 text-white font-bold text-sm">Sair</button>
            <button onClick={() => setConfirmLeave(false)} className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">Continuar jogando</button>
          </div>
        )}
        <div className="rounded-2xl bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Código da sua cartela{me.name ? ` · ${me.name}` : ""}</p>
            <p className="font-mono font-black text-3xl tracking-widest">{cardCode}</p>
          </div>
          <p className="text-white/70 text-xs max-w-[220px]">Diga este código ao professor quando gritar Quina ou Bingo.</p>
        </div>
        {(line || full) && (
          <div className="rounded-2xl bg-emerald-500 text-white px-5 py-4 flex items-center gap-3 animate-pulse">
            <Megaphone className="w-7 h-7 shrink-0" />
            <p className="font-black text-lg leading-tight">{full ? "BINGO! Grite bem alto" : "Você fez uma linha! Grite QUINA!"} <span className="block text-sm font-bold opacity-90">e diga o código {cardCode}</span></p>
          </div>
        )}
        <BingoCard card={card} marks={me.marks} onToggle={toggle} />
        <p className="text-center text-xs text-slate-500">Acompanhe o sorteio no telão e toque nos argumentos sorteados para marcá-los. Toque de novo para desmarcar.</p>
      </main>
    </div>
  );
}
