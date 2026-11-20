// Testa cada app da página Meus apps (links com data-app) e grava apps/status.json.
// Só muda o arquivo quando algum app muda de situação, para não encher o histórico.
const fs = require('fs');
const path = require('path');

const PAGINA = path.join(__dirname, '..', 'apps', 'index.html');
const SAIDA = path.join(__dirname, '..', 'apps', 'status.json');

// Páginas de erro do Google (app apagado, publicação quebrada).
const ERROS = [
  /unable to open the file/i,
  /não foi possível abrir o arquivo/i,
  /script function not found/i,
  /a função de script não foi encontrada/i,
];

function lerApps() {
  const html = fs.readFileSync(PAGINA, 'utf8');
  const re = /<li data-app="([a-z0-9-]+)"><a href="([^"]+)"/g;
  const apps = {};
  let m;
  while ((m = re.exec(html))) apps[m[1]] = m[2];
  return apps;
}

async function testar(url) {
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    try {
      const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
      const corpo = await r.text();
      if (r.status >= 400) throw new Error('HTTP ' + r.status);
      const erro = ERROS.find((e) => e.test(corpo));
      if (erro) throw new Error('página de erro: ' + erro);
      return { ok: true };
    } catch (e) {
      if (tentativa === 2) return { ok: false, motivo: String(e.message || e) };
      await new Promise((ok) => setTimeout(ok, 20000));
    }
  }
}

(async () => {
  const apps = lerApps();
  let antes = { apps: {} };
  try { antes = JSON.parse(fs.readFileSync(SAIDA, 'utf8')); } catch (e) { /* primeira vez */ }

  const agora = new Date().toISOString();
  const depois = { apps: {} };
  let mudou = false;
  for (const [id, url] of Object.entries(apps)) {
    const r = await testar(url);
    const velho = antes.apps[id];
    const igual = velho && velho.ok === r.ok;
    depois.apps[id] = { ok: r.ok, desde: igual ? velho.desde : agora };
    if (!r.ok) depois.apps[id].motivo = r.motivo;
    if (!igual) mudou = true;
    console.log(`${r.ok ? 'OK  ' : 'FORA'} ${id}${r.ok ? '' : ' — ' + r.motivo}`);
  }
  if (Object.keys(antes.apps).some((id) => !(id in depois.apps))) mudou = true;

  if (mudou) {
    fs.writeFileSync(SAIDA, JSON.stringify(depois, null, 2) + '\n');
    console.log('status.json atualizado');
  } else {
    console.log('nada mudou');
  }
})();
