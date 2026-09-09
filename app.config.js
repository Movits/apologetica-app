// Estende app.json para injetar o baseUrl do GitHub Pages só no build web de
// produção (via env PAGES_BASE_URL, definido no workflow). Em dev local, sem a
// env, o app serve na raiz normalmente.
const appJson = require('./app.json');

module.exports = ({ config }) => {
  const merged = { ...appJson.expo, ...config };
  const baseUrl = process.env.PAGES_BASE_URL;
  if (baseUrl) {
    merged.experiments = { ...(merged.experiments || {}), baseUrl };
  }
  // Identidade do build, gravada dentro do bundle. O app web compara com o
  // version.json servido ao lado (ver src/utils/webUpdate.web.js) para saber
  // que o Safari lhe entregou uma versão velha do cache, o que acontece
  // principalmente no atalho da tela de início do iPhone.
  merged.extra = {
    ...(merged.extra || {}),
    buildId: process.env.GITHUB_SHA || 'dev',
  };
  return merged;
};
