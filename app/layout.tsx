import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/config/site";
import { NEXOFY_UTM_SCRIPT } from "@/config/nexofy-utm";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "es_LA",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#110a0d",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NEXOFY_UTM_SCRIPT }} />

        {/* Meta Pixel · NexoFy (el PageView lo dispara nexofy.js con data-auto-page-view) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','3486809008159107');`,
          }}
        />
        <script
          src="https://appnexofy.com.br/nexofy.js"
          data-public-key="cmu4ga7xz002njx048er5hwrc"
          data-auto-page-view="true"
        />
      </head>
      <body>
        {children}

        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src="https://www.facebook.com/tr?id=3486809008159107&ev=PageView&noscript=1"
          />
        </noscript>

        {/*
          ---- UTMify (descomenta y pega tu script) ----
          <Script
            src="https://cdn.utmify.com.br/scripts/utms/latest.js"
            data-utmify-prevent-xcod-sck
            data-utmify-prevent-subids
            strategy="afterInteractive"
          />
          <Script id="utmify-pixel" strategy="afterInteractive">
            {`window.pixelId = "PEGA-TU-ID-DE-UTMIFY"; ...pega aquí el resto del script de UTMify...`}
          </Script>
        */}
      </body>
    </html>
  );
}
