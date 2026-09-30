# Versão independente (GitHub Pages)

Este app nasceu no Base44. A branch `main` guarda o código-fonte; a branch `gh-pages` guarda a versão publicada em
**https://andrebacchi.github.io/bingo-picareta/**, que roda sem Base44 (sem login, com caminhos relativos e HashRouter quando há rotas).

## Como atualizar o site

1. Edite o código em `main` normalmente (`src/`, `public/`...).
2. Aumente a versão do cache em `standalone/overlay/public/sw.js (VERSION)`, para os celulares receberem a atualização.
3. Gere a versão independente: `sh standalone/build.sh` (sai em `dist/`).
4. Publique `dist/` na branch `gh-pages`:
   ```sh
   git fetch origin gh-pages
   git worktree add /tmp/ghp gh-pages
   find /tmp/ghp -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
   cp -r dist/. /tmp/ghp/ && touch /tmp/ghp/.nojekyll
   git -C /tmp/ghp add -A && git -C /tmp/ghp commit -m "Atualiza o site" && git -C /tmp/ghp push origin gh-pages
   git worktree remove /tmp/ghp
   ```

## O que fica em `standalone/`

- `overlay/`: arquivos que substituem os do Base44 na versão independente (`src/App.jsx` sem login, `vite.config.js` sem o plugin do Base44 e com `base: './'`, e, quando existe, `public/` com ícones, manifest e service worker).
- `patch.py`: ajustes no `index.html` e em caminhos (idioma, ícones, manifest, registro do service worker).
- `build.sh`: copia o projeto para uma pasta temporária, aplica os dois itens acima e roda o `vite build`.

Novas rotas ou páginas: acrescente-as também em `standalone/overlay/src/App.jsx`.
Mídia: use `${import.meta.env.BASE_URL}img/...` (arquivos em `public/img/`), nunca links do Base44.
