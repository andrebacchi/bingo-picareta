p='index.html';s=open(p).read()
s=s.replace('<html lang="en">','<html lang="pt-BR">')
s=s.replace('<link rel="icon" type="image/svg+xml" href="https://base44.com/logo_v2.svg" />','<link rel="icon" type="image/png" href="./icons/icon-192.png" />\n    <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png" />\n    <meta name="theme-color" content="#e11d48" />\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-title" content="Bingo Picareta" />')
s=s.replace('href="/manifest.json"','href="./manifest.json"')
import re
s=re.sub(r'https://media\.base44\.com/images/public/[^"]+','https://andrebacchi.github.io/bingo-picareta/img/bingo-picareta-logo.jpg',s)
s=s.replace('</body>','  <script>if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}</script>\n  </body>')
open(p,'w').write(s)
