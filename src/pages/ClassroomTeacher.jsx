import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Shuffle, BookOpen, Search, RotateCcw, Undo2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import BingoCard from "@/components/BingoCard";
import { EXPLANATIONS } from "@/data/explanations";
import { PSEUDO_ARGUMENTS } from "@/data/arguments";
import { randomCode, drawOrder, cardFor, parseCardCode, checkCard, normCode } from "@/lib/classroom";
import { playDraw } from "@/lib/sounds";

const KEY = "bingoSala.professor";
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && typeof s.code === "string" && Number.isInteger(s.k)) return s;
  } catch { /* ignore */ }
  return { code: randomCode(4), k: 0 };
}

export default function ClassroomTeacher() {
  const navigate = useNavigate();
  const [state, setState] = useState(load);
  const [showWhy, setShowWhy] = useState(true);
  const [confirmNew, setConfirmNew] = useState(false);
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const order = useMemo(() => drawOrder(state.code), [state.code]);
  const drawn = order.slice(0, state.k);
  const current = drawn[drawn.length - 1];
  const total = PSEUDO_ARGUMENTS.length;

  const draw = () => {
    if (state.k >= total) return;
    try { playDraw(); } catch { /* ignore */ }
    setState((s) => ({ ...s, k: s.k + 1 }));
  };
  const undo = () => setState((s) => ({ ...s, k: Math.max(0, s.k - 1) }));
  const newGame = () => { setState({ code: randomCode(4), k: 0 }); setConfirmNew(false); setChecked(null); setQuery(""); };

  const verify = (e) => {
    e?.preventDefault();
    const { game, card } = parseCardCode(query, state.code);
    if (card.length !== 4) { setChecked({ error: "Digite o código da cartela, com 4 letras ou números (por exemplo, " + state.code + "-7KQM)." }); return; }
    if (normCode(game) !== state.code) { setChecked({ error: `Esta cartela é da partida ${game}, não da partida atual (${state.code}).` }); return; }
    const c = cardFor(state.code, card);
    setChecked({ id: `${state.code}-${card}`, card: c, ...checkCard(c, drawn) });
  };
  // reconfere automaticamente quando novos argumentos são sorteados
  useEffect(() => {
    if (checked && checked.card) setChecked((ch) => ({ ...ch, ...checkCard(ch.card, drawn) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.k]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white">
      <header className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <HomeIcon className="w-4 h-4" /> Início
        </button>
        <h1 className="font-display font-black text-lg sm:text-xl text-slate-900">Bingo do Picareta · Sala de aula</h1>
        <button onClick={() => setConfirmNew(true)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <RotateCcw className="w-4 h-4" /> Nova partida
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-12 grid gap-5">
        {confirmNew && (
          <div className="rounded-2xl border-2 border-rose-300 bg-white p-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-slate-700 flex-1 min-w-[220px]">Começar uma nova partida? Ela terá um novo código e a turma precisará entrar de novo.</p>
            <button onClick={newGame} className="px-4 py-2 rounded-full bg-rose-500 text-white font-bold text-sm">Sim, nova partida</button>
            <button onClick={() => setConfirmNew(false)} className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">Cancelar</button>
          </div>
        )}

        <section className="rounded-3xl bg-slate-900 text-white p-5 sm:p-7 flex flex-wrap items-center gap-5 justify-between">
          <div>
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest">Código da partida</p>
            <p className="font-mono font-black text-6xl sm:text-7xl tracking-[0.2em]">{state.code}</p>
          </div>
          <div className="max-w-md text-white/85 text-sm sm:text-base leading-relaxed flex gap-3">
            <Users className="w-6 h-6 shrink-0 mt-0.5 text-amber-300" />
            <p>Alunos: abram o <b>Bingo do Picareta</b> no celular, toquem em <b>Entrar na partida da turma</b> e digitem <b className="font-mono text-amber-300">{state.code}</b>. Acompanhem o sorteio aqui e marquem na própria cartela.</p>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-8 flex flex-col items-center gap-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={draw} disabled={state.k >= total}
                className="group flex items-center gap-2 px-7 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-lg disabled:opacity-40 active:scale-95 transition-all">
                <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" /> {state.k === 0 ? "Sortear o primeiro" : "Sortear o próximo"}
              </button>
              {state.k > 0 && (
                <button onClick={undo} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm">
                  <Undo2 className="w-4 h-4" /> Desfazer último
                </button>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-500">{state.k} de {total} sorteados</p>
            <div className="min-h-[140px] w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                {current ? (
                  <motion.div key={current + state.k}
                    initial={{ scale: 0.5, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="px-6 py-6 sm:px-10 sm:py-8 rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 text-white text-center font-black text-3xl sm:text-5xl leading-tight shadow-xl max-w-3xl">
                    <span className="block text-base sm:text-lg font-bold text-white/80 mb-2">nº {state.k}</span>
                    “{current}”
                  </motion.div>
                ) : (
                  <p className="text-slate-400 text-lg text-center">Quando a turma estiver pronta, sorteie o primeiro argumento.</p>
                )}
              </AnimatePresence>
            </div>
            {current && (
              <div className="w-full max-w-3xl">
                <button onClick={() => setShowWhy((v) => !v)} className="flex items-center gap-2 text-rose-600 font-bold text-base mx-auto">
                  <BookOpen className="w-5 h-5" /> {showWhy ? "Esconder a explicação" : "Por que é equivocado?"}
                </button>
                {showWhy && (
                  <p className="mt-3 text-lg sm:text-xl text-slate-700 leading-relaxed bg-rose-50 border-2 border-rose-100 rounded-2xl p-5">
                    {EXPLANATIONS[current] || "Explicação não disponível para este argumento."}
                  </p>
                )}
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-5">
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
              <h2 className="font-display font-black text-lg text-slate-900">Conferir cartela</h2>
              <p className="text-sm text-slate-500 mt-1">Quando alguém gritar Quina ou Bingo, digite o código da cartela dele.</p>
              <form onSubmit={verify} className="mt-3 flex gap-2">
                <input value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())} placeholder={`${state.code}-XXXX`}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-rose-400 outline-none font-mono font-bold tracking-wider uppercase" />
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-1.5"><Search className="w-4 h-4" />Conferir</button>
              </form>
              {checked?.error && <p className="mt-3 text-sm font-semibold text-rose-600">{checked.error}</p>}
              {checked?.card && (
                <div className="mt-4 grid gap-3">
                  <div className={cn("rounded-2xl px-4 py-3 font-black text-lg text-center",
                    checked.full ? "bg-emerald-500 text-white" : checked.lineCount ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700")}>
                    {checked.full ? "BINGO! Cartela cheia válida 🎉" : checked.lineCount ? `QUINA válida! ${checked.lineCount > 1 ? checked.lineCount + " linhas completas" : "Uma linha completa"}` : `Ainda não: faltam ${checked.missingBest} para completar uma linha`}
                    <span className="block text-xs font-bold opacity-70 mt-0.5">Cartela {checked.id}{!checked.full ? ` · faltam ${checked.missingFull} para a cartela cheia` : ""}</span>
                  </div>
                  <BingoCard card={checked.card} marks={checked.marks} disabled />
                </div>
              )}
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
              <h2 className="font-display font-black text-lg text-slate-900">Já sorteados</h2>
              {drawn.length === 0 ? <p className="text-sm text-slate-400 mt-2">Nenhum ainda.</p> : (
                <ol className="mt-3 grid gap-1.5 max-h-[420px] overflow-y-auto pr-1">
                  {[...drawn].reverse().map((a, i) => (
                    <li key={a} className="flex gap-2 text-sm text-slate-700">
                      <span className="font-mono text-slate-400 w-7 shrink-0 text-right">{drawn.length - i}.</span><span>{a}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
