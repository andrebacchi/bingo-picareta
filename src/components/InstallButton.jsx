import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

let deferredPrompt = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; });
}

function platform() {
  const u = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(u)) return "android";
  return "desktop";
}

const STEPS = {
  ios: ["Abra esta página no Safari.", "Toque em Compartilhar (o quadrado com a seta para cima).", "Toque em “Adicionar à Tela de Início”.", "Confirme em “Adicionar”. O ícone do Dr. Charles Latão aparece junto dos seus apps."],
  android: ["Abra esta página no Chrome.", "Toque no menu ⋮, no canto superior direito.", "Toque em “Instalar app” ou “Adicionar à tela inicial”.", "Confirme. O ícone aparece junto dos seus apps."],
  desktop: ["Chrome ou Edge: clique no ícone de instalar na barra de endereço, ou no menu ⋮ → “Transmitir, salvar e compartilhar” → “Instalar página como app”.", "Safari (Mac): menu Arquivo → “Adicionar ao Dock”.", "Em qualquer navegador, dá para salvar nos favoritos com Ctrl + D."],
};
const TABS = [["ios", "iPhone"], ["android", "Android"], ["desktop", "Computador"]];

export default function InstallButton({ className }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("android");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone;
    setInstalled(!!standalone);
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  if (installed) return null;

  const click = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const r = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (r?.outcome === "accepted") return;
      } catch { /* mostra as instruções */ }
    }
    setTab(platform());
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={click}
        className={cn("flex items-center gap-2 px-4 h-10 rounded-full bg-white/90 shadow-md border border-slate-200 text-sm font-bold text-slate-700 hover:bg-white hover:text-rose-600 transition-colors", className)}
      >
        <Download className="w-4 h-4" /> Instalar app
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Instalar o Bingo do Picareta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">O jogo fica na tela inicial como um aplicativo, abre em tela cheia e funciona sem internet depois da primeira visita.</p>
          <div className="flex gap-1 p-1 rounded-full bg-slate-100 w-fit">
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={cn("px-3 py-1.5 rounded-full text-sm font-semibold", tab === k ? "bg-slate-900 text-white" : "text-slate-600")}>{l}</button>
            ))}
          </div>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-700">
            {STEPS[tab].map((s) => <li key={s}>{s}</li>)}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
