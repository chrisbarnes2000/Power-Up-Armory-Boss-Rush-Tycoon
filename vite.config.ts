import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { generateShareCardSvg } from './src/utils/dynamicShareSvg';

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vemetric.com https://www.googletagmanager.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://cdn.vemetric.com https://*.vemetric.com https://api.vemetric.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
  "frame-src 'self' https://*.firebaseapp.com",
  "frame-ancestors 'self' https://aistudio.google.com https://*.google.com https://*.run.app https://*.googleusercontent.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests"
].join('; ');

const BASE_SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP_DIRECTIVES,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

function securityHeadersPlugin(): Plugin {
  const applyHeaders = (req: any, res: any) => {
    Object.entries(BASE_SECURITY_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    const isIframeEmbed = Boolean(
      req.headers?.referer?.includes('aistudio.google.com') ||
      req.headers?.referer?.includes('google.com') ||
      req.headers?.referer?.includes('run.app') ||
      req.headers?.['sec-fetch-dest'] === 'iframe'
    );

    // Provide X-Frame-Options for standalone security scanners while keeping AI Studio preview operational via frame-ancestors
    if (!isIframeEmbed) {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    }
  };

  return {
    name: 'vite-plugin-security-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        applyHeaders(req, res);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        applyHeaders(req, res);
        next();
      });
    },
  };
}

function dynamicShareCardPlugin(): Plugin {
  const handleSvgRequest = (req: any, res: any, next: any) => {
    if (!req.url) return next();
    try {
      const url = new URL(req.url, 'http://localhost:3000');
      if (url.pathname === '/share-card.svg' || url.pathname === '/api/share-card.svg') {
        const params = {
          view: (url.searchParams.get('view') as any) || 'champion',
          name: url.searchParams.get('name') || url.searchParams.get('player') || undefined,
          title: url.searchParams.get('title') || undefined,
          avatar: url.searchParams.get('avatar') || undefined,
          powerScore: url.searchParams.get('ps') || url.searchParams.get('powerScore') || undefined,
          bossesDefeated: url.searchParams.get('bosses') || url.searchParams.get('bossesDefeated') || undefined,
          totalBosses: url.searchParams.get('maxBosses') || undefined,
          attack: url.searchParams.get('atk') || undefined,
          defense: url.searchParams.get('def') || undefined,
          speed: url.searchParams.get('spd') || undefined,
          coins: url.searchParams.get('coins') || undefined,
          gems: url.searchParams.get('gems') || undefined,
          inviteCode: url.searchParams.get('code') || url.searchParams.get('invite') || undefined,
          bossName: url.searchParams.get('boss') || undefined,
          bossEmoji: url.searchParams.get('bossEmoji') || undefined,
          itemName: url.searchParams.get('item') || undefined,
        };

        const svg = generateShareCardSvg(params);
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Ensure Cross-Origin-Resource-Policy is set for the SVG itself
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.end(svg);
        return;
      }
    } catch (e) {
      console.warn('Error rendering dynamic share SVG:', e);
    }
    next();
  };

  return {
    name: 'vite-plugin-dynamic-share-card',
    configureServer(server) {
      server.middlewares.use(handleSvgRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleSvgRequest);
    },
    transformIndexHtml(html, ctx) {
      const url = new URL(ctx.originalUrl || '/', 'http://localhost:3000');
      const player = url.searchParams.get('player') || url.searchParams.get('name');
      const boss = url.searchParams.get('boss');
      const invite = url.searchParams.get('invite') || url.searchParams.get('code');
      const view = url.searchParams.get('view') || 'champion';

      if (player || boss || invite) {
        const svgUrl = `/share-card.svg${url.search}`;
        const pageTitle = boss 
          ? `${boss} Vanquished by ${player || 'Champion'} · Power-Up Armory`
          : player 
            ? `${player}'s Champion Codex · Power-Up Armory`
            : `Join Raid Squad ${invite} · Power-Up Armory`;

        // Inject dynamic OpenGraph and Twitter tags for social bots
        const metaTags = [
          `<title>${pageTitle}</title>`,
          `<meta property="og:title" content="${pageTitle}" />`,
          `<meta property="og:image" content="${svgUrl}" />`,
          `<meta name="twitter:title" content="${pageTitle}" />`,
          `<meta name="twitter:image" content="${svgUrl}" />`,
          `<meta property="og:url" content="${ctx.originalUrl}" />`
        ].join('\n    ');

        // Replace the static title and inject tags after charset
        return html
          .replace(/<title>.*?<\/title>/, '')
          .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${metaTags}`);
      }
      return html;
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), securityHeadersPlugin(), dynamicShareCardPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: BASE_SECURITY_HEADERS,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      headers: BASE_SECURITY_HEADERS,
    },
  };
});
