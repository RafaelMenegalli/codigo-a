/**
 * ============================================================
 *  CONFIGURACIÓN DE LA PÁGINA — todo lo editable está aquí
 * ============================================================
 */

// --- Vídeo -------------------------------------------------
// Ruta local (archivo en /public) o URL externa (Bunny CDN, etc.)
export const VIDEO_SRC = "/vsl.mp4";
export const POSTER_SRC = "/poster.jpg";
// Proporción usada ANTES de cargar los metadatos del vídeo (evita saltos de layout).
// Vertical 9:16 = 9 / 16 · Horizontal 16:9 = 16 / 9. Después se ajusta sola a la real.
export const VIDEO_ASPECT_FALLBACK = 9 / 16;

// --- Botón de compra ---------------------------------------
// Segundo del VÍDEO (no del tiempo en la página) en que aparece el botón.
export const CTA_SECONDS = 785; // 13:05
export const CHECKOUT_URL = "https://pay.hotmart.com/M108420706N?off=7dn2t71q";
export const CTA_TEXT = "Sí, quiero empezar a ligarme mujeres!";
export const CTA_TRUST = [
  { icon: "lock", text: "Pago 100% seguro" },
  { icon: "bolt", text: "Acceso inmediato" },
  { icon: "shield", text: "Garantía de 30 días" },
] as const;

// --- Textos de la página -----------------------------------

// Headline: lista de trozos. Los que llevan `hl: true` salen en color de acento (cursiva).
// Opción activa
export const HEADLINE: { text: string; hl?: boolean }[] = [
  { text: "Cómo él pasó de ser " },
  { text: "ignorado por las mujeres", hl: true },
  { text: " y empezó a " },
  { text: "cogerse a las más buenas", hl: true },
  { text: " en menos de 2 semanas" },
];
// Opción A (anterior)
// export const HEADLINE = [
//   { text: "El código de 3 pasos que hace que " },
//   { text: "ella sea la que te busque", hl: true },
//   { text: ", aunque no seas guapo ni tengas dinero" },
// ];
// Opción B (para probar)
// export const HEADLINE = [
//   { text: "Deja de ser 'el chico bueno': el método que convierte tu conversación en " },
//   { text: "deseo real", hl: true },
// ];
// Opción C (para probar)
// export const HEADLINE = [
//   { text: "Por qué ella responde a otros en segundos y a ti te deja en visto (y cómo " },
//   { text: "darlo vuelta en 7 días", hl: true },
//   { text: ")" },
// ];

// --- Meta / SEO --------------------------------------------
export const SITE_URL = "https://SEU-DOMINIO.com"; // usado para la imagen og:image
export const SITE_TITLE = "Código de Atracción";
export const SITE_DESCRIPTION =
  "Descubre el método de 3 pasos del Código de Atracción, el ebook premium con 12 módulos.";
export const OG_IMAGE = "/og.jpg";

// --- Pixel de Meta -----------------------------------------
// Vacío = el Pixel NO se carga. Pega aquí solo el ID numérico.
export const META_PIXEL_ID = "";
