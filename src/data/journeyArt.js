// Emblemas ilustrados da Jornada, por id de conquista (src/utils/journey.js,
// BADGES) e de nível (LEVELS). O Metro só empacota o que está escrito num
// require() literal, por isso o mapa é estático. Quem não tem emblema cai no
// ícone Ionicons da própria conquista (BadgeEmblem).
export const JOURNEY_ART = {};

export const LEVEL_ART = {};

export const hasArt = (id) => Boolean(JOURNEY_ART[id] || LEVEL_ART[id]);
