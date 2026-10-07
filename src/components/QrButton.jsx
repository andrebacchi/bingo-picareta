import { useState } from "react";
import { QrCode, Copy, Check, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// QR code do app (padrão do BACCHI LAB): abre o código do endereço do próprio app, grande e sobre branco,
// para compartilhar entre celulares ou projetar. O desenho é fixo, porque o endereço não muda: foi gerado
// com o qrcode.js do repositório bacchilab (nível M). Se o endereço mudar, gere de novo.
const ENDERECO = "https://andrebacchi.github.io/bingo-picareta/";
const LADO = 37;
const DESENHO = "M2 2h7v1h-7zM11 2h1v1h-1zM13 2h2v1h-2zM20 2h3v1h-3zM25 2h1v1h-1zM28 2h7v1h-7zM2 3h1v1h-1zM8 3h1v1h-1zM11 3h4v1h-4zM17 3h2v1h-2zM20 3h1v1h-1zM22 3h1v1h-1zM24 3h1v1h-1zM28 3h1v1h-1zM34 3h1v1h-1zM2 4h1v1h-1zM4 4h3v1h-3zM8 4h1v1h-1zM10 4h1v1h-1zM13 4h1v1h-1zM16 4h1v1h-1zM18 4h1v1h-1zM21 4h4v1h-4zM28 4h1v1h-1zM30 4h3v1h-3zM34 4h1v1h-1zM2 5h1v1h-1zM4 5h3v1h-3zM8 5h1v1h-1zM10 5h5v1h-5zM20 5h1v1h-1zM23 5h1v1h-1zM26 5h1v1h-1zM28 5h1v1h-1zM30 5h3v1h-3zM34 5h1v1h-1zM2 6h1v1h-1zM4 6h3v1h-3zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM15 6h5v1h-5zM22 6h2v1h-2zM25 6h2v1h-2zM28 6h1v1h-1zM30 6h3v1h-3zM34 6h1v1h-1zM2 7h1v1h-1zM8 7h1v1h-1zM10 7h1v1h-1zM15 7h2v1h-2zM20 7h2v1h-2zM28 7h1v1h-1zM34 7h1v1h-1zM2 8h7v1h-7zM10 8h1v1h-1zM12 8h1v1h-1zM14 8h1v1h-1zM16 8h1v1h-1zM18 8h1v1h-1zM20 8h1v1h-1zM22 8h1v1h-1zM24 8h1v1h-1zM26 8h1v1h-1zM28 8h7v1h-7zM10 9h2v1h-2zM14 9h1v1h-1zM16 9h1v1h-1zM18 9h1v1h-1zM21 9h3v1h-3zM26 9h1v1h-1zM2 10h1v1h-1zM4 10h5v1h-5zM15 10h2v1h-2zM19 10h1v1h-1zM21 10h1v1h-1zM24 10h1v1h-1zM26 10h1v1h-1zM28 10h5v1h-5zM2 11h3v1h-3zM7 11h1v1h-1zM9 11h3v1h-3zM13 11h3v1h-3zM18 11h2v1h-2zM21 11h2v1h-2zM25 11h1v1h-1zM28 11h2v1h-2zM31 11h2v1h-2zM34 11h1v1h-1zM3 12h1v1h-1zM8 12h1v1h-1zM11 12h1v1h-1zM14 12h6v1h-6zM24 12h1v1h-1zM26 12h1v1h-1zM30 12h1v1h-1zM32 12h2v1h-2zM3 13h2v1h-2zM6 13h2v1h-2zM14 13h2v1h-2zM17 13h1v1h-1zM19 13h4v1h-4zM25 13h4v1h-4zM30 13h3v1h-3zM34 13h1v1h-1zM3 14h1v1h-1zM6 14h1v1h-1zM8 14h1v1h-1zM10 14h4v1h-4zM16 14h1v1h-1zM18 14h1v1h-1zM21 14h4v1h-4zM26 14h2v1h-2zM29 14h3v1h-3zM33 14h2v1h-2zM2 15h2v1h-2zM6 15h2v1h-2zM9 15h1v1h-1zM12 15h1v1h-1zM15 15h1v1h-1zM17 15h1v1h-1zM20 15h1v1h-1zM23 15h1v1h-1zM25 15h1v1h-1zM28 15h1v1h-1zM31 15h4v1h-4zM5 16h1v1h-1zM7 16h2v1h-2zM10 16h4v1h-4zM17 16h2v1h-2zM22 16h2v1h-2zM26 16h3v1h-3zM31 16h1v1h-1zM33 16h1v1h-1zM3 17h1v1h-1zM7 17h1v1h-1zM9 17h4v1h-4zM15 17h3v1h-3zM20 17h1v1h-1zM23 17h2v1h-2zM27 17h6v1h-6zM5 18h2v1h-2zM8 18h4v1h-4zM13 18h3v1h-3zM17 18h1v1h-1zM19 18h1v1h-1zM24 18h1v1h-1zM27 18h1v1h-1zM29 18h2v1h-2zM34 18h1v1h-1zM5 19h2v1h-2zM9 19h1v1h-1zM11 19h1v1h-1zM13 19h2v1h-2zM18 19h1v1h-1zM20 19h2v1h-2zM23 19h1v1h-1zM25 19h1v1h-1zM28 19h2v1h-2zM31 19h2v1h-2zM34 19h1v1h-1zM2 20h2v1h-2zM5 20h2v1h-2zM8 20h2v1h-2zM11 20h1v1h-1zM13 20h1v1h-1zM15 20h1v1h-1zM17 20h1v1h-1zM20 20h1v1h-1zM22 20h2v1h-2zM26 20h1v1h-1zM29 20h2v1h-2zM32 20h2v1h-2zM2 21h1v1h-1zM4 21h3v1h-3zM10 21h1v1h-1zM18 21h1v1h-1zM23 21h2v1h-2zM27 21h1v1h-1zM29 21h5v1h-5zM2 22h4v1h-4zM7 22h4v1h-4zM13 22h1v1h-1zM20 22h2v1h-2zM23 22h1v1h-1zM27 22h1v1h-1zM29 22h3v1h-3zM34 22h1v1h-1zM2 23h2v1h-2zM9 23h2v1h-2zM12 23h2v1h-2zM17 23h3v1h-3zM22 23h4v1h-4zM27 23h2v1h-2zM31 23h1v1h-1zM34 23h1v1h-1zM2 24h1v1h-1zM4 24h1v1h-1zM6 24h1v1h-1zM8 24h2v1h-2zM11 24h2v1h-2zM14 24h1v1h-1zM20 24h2v1h-2zM29 24h1v1h-1zM31 24h1v1h-1zM33 24h1v1h-1zM2 25h1v1h-1zM5 25h3v1h-3zM9 25h2v1h-2zM12 25h2v1h-2zM15 25h2v1h-2zM18 25h1v1h-1zM20 25h5v1h-5zM27 25h1v1h-1zM29 25h1v1h-1zM32 25h2v1h-2zM2 26h1v1h-1zM7 26h3v1h-3zM11 26h3v1h-3zM19 26h1v1h-1zM21 26h1v1h-1zM24 26h1v1h-1zM26 26h5v1h-5zM33 26h2v1h-2zM10 27h5v1h-5zM19 27h1v1h-1zM21 27h2v1h-2zM26 27h1v1h-1zM30 27h1v1h-1zM32 27h1v1h-1zM34 27h1v1h-1zM2 28h7v1h-7zM12 28h3v1h-3zM17 28h1v1h-1zM19 28h1v1h-1zM24 28h3v1h-3zM28 28h1v1h-1zM30 28h1v1h-1zM32 28h2v1h-2zM2 29h1v1h-1zM8 29h1v1h-1zM10 29h2v1h-2zM14 29h1v1h-1zM16 29h1v1h-1zM19 29h2v1h-2zM25 29h2v1h-2zM30 29h3v1h-3zM34 29h1v1h-1zM2 30h1v1h-1zM4 30h3v1h-3zM8 30h1v1h-1zM10 30h4v1h-4zM15 30h4v1h-4zM21 30h4v1h-4zM26 30h6v1h-6zM2 31h1v1h-1zM4 31h3v1h-3zM8 31h1v1h-1zM10 31h1v1h-1zM12 31h4v1h-4zM17 31h1v1h-1zM20 31h1v1h-1zM23 31h1v1h-1zM27 31h1v1h-1zM30 31h2v1h-2zM34 31h1v1h-1zM2 32h1v1h-1zM4 32h3v1h-3zM8 32h1v1h-1zM10 32h1v1h-1zM16 32h3v1h-3zM22 32h1v1h-1zM25 32h1v1h-1zM28 32h2v1h-2zM31 32h2v1h-2zM2 33h1v1h-1zM8 33h1v1h-1zM13 33h1v1h-1zM16 33h2v1h-2zM23 33h2v1h-2zM30 33h3v1h-3zM2 34h7v1h-7zM10 34h2v1h-2zM13 34h1v1h-1zM15 34h3v1h-3zM19 34h1v1h-1zM24 34h3v1h-3zM28 34h2v1h-2zM31 34h1v1h-1zM33 34h1v1h-1z";

export default function QrButton({ className }) {
  const [open, setOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const podeCompartilhar = typeof navigator !== "undefined" && !!navigator.share;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(ENDERECO);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch { /* sem acesso à área de transferência: o endereço fica selecionável logo acima */ }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Mostrar o QR code deste app" className={cn("flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-4 rounded-full bg-white/90 shadow-md border border-slate-200 text-sm font-bold text-slate-700 hover:bg-white hover:text-rose-600 transition-colors", className)}>
        <QrCode className="w-4 h-4" /> <span className="hidden sm:inline">QR code</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-rose-600">QR code do Bingo do Picareta</DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-slate-600">Aponte a câmera do celular para o código.</p>
          <div className="mx-auto w-full max-w-[min(100%,56vh)] rounded-xl border border-slate-200 bg-white p-2.5">
            <svg viewBox={`0 0 ${LADO} ${LADO}`} shapeRendering="crispEdges" role="img" aria-label="QR code para andrebacchi.github.io/bingo-picareta" className="block w-full h-auto">
              <rect width={LADO} height={LADO} fill="#fff" />
              <path d={DESENHO} fill="#161a22" />
            </svg>
          </div>
          <p className="text-center font-mono font-semibold text-[clamp(15px,4vw,20px)] break-all select-all text-slate-900">andrebacchi.github.io/bingo-picareta</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={copiar} className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-colors bg-rose-600 text-white hover:bg-rose-700">
              {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiado ? "Link copiado" : "Copiar link"}
            </button>
            {podeCompartilhar && (
              <button onClick={() => navigator.share({ title: "Bingo do Picareta", url: ENDERECO }).catch(() => {})} className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-colors border border-slate-300 text-slate-700 hover:bg-slate-100">
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
            )}
          </div>
          <p className="text-center text-xs text-slate-600 opacity-80">QR Code é marca registrada da DENSO WAVE INCORPORATED.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
