// Janela em que o app está rodando: "navegador" (aba comum), "propria" (instalado, na janela dele) ou "outra"
// (aberto dentro de outro app instalado, como o BACCHI LAB). Neste último caso o Android também responde
// display-mode: standalone, e o botão Instalar sumia para quem ainda não tinha o app: a diferença é de onde a página veio.
export function janelaApp(k) {
  if (!(window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true)) return "navegador";
  let fora = false, marca = false;
  try {
    const r = document.referrer && new URL(document.referrer);
    fora = !!r && r.origin === window.location.origin && !r.pathname.startsWith(new URL("./", window.location.href).pathname);
  } catch { /* referência ilegível: trata como janela própria */ }
  try {
    if (!document.referrer) localStorage.setItem(k, "1");
    if (!fora) sessionStorage.setItem(k, "1");
    marca = localStorage.getItem(k) === "1" || sessionStorage.getItem(k) === "1";
  } catch { /* sem armazenamento */ }
  return !fora || marca ? "propria" : "outra";
}

export function marcarInstalado(k) {
  try { localStorage.setItem(k, "1"); } catch { /* sem armazenamento */ }
}

// Confirmação do próprio navegador, quando ele sabe responder (Chrome no Android, pelo related_applications do manifest).
export function appInstalado(k) {
  if (!navigator.getInstalledRelatedApps) return Promise.resolve(false);
  return navigator.getInstalledRelatedApps().then((l) => { if (l.length) marcarInstalado(k); return l.length > 0; }).catch(() => false);
}
