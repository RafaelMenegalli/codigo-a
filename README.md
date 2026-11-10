# Código de Atracción — Página VSL

Página de ventas VSL en **Next.js (App Router) + TypeScript + Tailwind CSS**, con **exportación estática** (`output: 'export'`): el build genera la carpeta `out/`, lista para cualquier hosting, incluso compartido y sin Node.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000 (pruébalo en 375 px de ancho; el tráfico es ~90% móvil).

```bash
npm run build   # genera out/
npm run lint
```

## Qué editar (todo en `config/site.ts`)

| Qué | Constante |
| --- | --- |
| Vídeo | `VIDEO_SRC` (`"/vsl.mp4"` o URL externa) |
| Póster | `POSTER_SRC` (`"/poster.jpg"`) |
| Link de checkout | `CHECKOUT_URL` |
| Segundo del vídeo en que aparece el botón | `CTA_SECONDS` (600) |
| Headline (opciones B y C comentadas) | `HEADLINE` |
| Texto del botón | `CTA_TEXT`, `CTA_TRUST` |
| ID del Pixel de Meta (vacío = no se carga) | `META_PIXEL_ID` |
| Dominio para `og:image` | `SITE_URL` |

Archivos que debes poner en `public/`: `vsl.mp4`, `poster.jpg` y `og.jpg` (1200×630). El bloque para pegar el script de UTMify está comentado en `app/layout.tsx`.

> **Límite de GitHub:** si `vsl.mp4` pesa **más de 100 MB**, GitHub rechaza el archivo. En ese caso lo recomendado es alojar el vídeo fuera (Bunny CDN o similar) y poner la URL completa en `VIDEO_SRC`. El player funciona igual con ruta local o URL externa (si usas otro dominio, el servidor del vídeo debe permitir *range requests*).

### Comprimir la VSL para web

```bash
ffmpeg -i entrada.mp4 -c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p -vf "scale=-2:720" -c:a aac -b:a 128k -movflags +faststart public/vsl.mp4
```

`-movflags +faststart` mueve los metadatos al inicio para que el vídeo arranque rápido en 4G. Baja `-crf` (21–22) para más calidad o súbelo (25–26) para menos peso.

## Subir a GitHub

1. Crea un repositorio vacío en https://github.com/new (sin README).
2. En la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

## Deploy en Hostinger

### (a) Hosting compartido (sin Node)

**Manual:** ejecuta `npm run build` y sube **el contenido** de `out/` a `public_html` (Administrador de archivos o FTP).

**Automático con GitHub Actions:** el workflow `.github/workflows/deploy.yml` hace build y sube `out/` por FTP en cada push a `main`. Crea estos secrets en GitHub: *Settings → Secrets and variables → Actions → New repository secret*:

| Secret | Valor (hPanel → Archivos → Cuentas FTP) |
| --- | --- |
| `FTP_SERVER` | Host FTP (ej. `ftp.tudominio.com` o la IP) |
| `FTP_USERNAME` | Usuario FTP |
| `FTP_PASSWORD` | Contraseña FTP |

Si tu cuenta FTP ya apunta directamente a `public_html`, cambia `server-dir` en el workflow a `./`.

### (b) Plan con soporte de apps Node.js

1. hPanel → **Sitios web → Agregar sitio web → Aplicación web Node.js** → importar desde GitHub y autorizar el repositorio.
2. Framework: Next.js (o personalizado). Comandos:
   - Instalar: `npm install`
   - Build: `npm run build`
   - **Directorio de salida: `out`**
3. Deploy. Cada push a `main` redeploya.

## Notas técnicas

- Sin API routes, server actions ni middleware: todo es estático.
- El progreso del vídeo se guarda en `localStorage` cada 5 s para ofrecer retomar.
- La barra de progreso es falsa (curva `1 - (1 - x)^3.2`) y no es clicable.
- La página tiene `noindex`.
