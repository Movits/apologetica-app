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
  return merged;
};
