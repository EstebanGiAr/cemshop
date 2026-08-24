# CEMShop Hydrogen — Contexto para Claude

## ¿Qué es este proyecto?

Ecommerce de productos íntimos/sexshop construido con **Shopify Hydrogen 2026.4.2** + **React Router 7** + **Tailwind CSS 4**. Desplegado en Shopify Oxygen (workers edge runtime). La tienda tiene diseño propio CEMShop: crema/nude + acentos coral/rosé + tipografía Cormorant Garamond + Manrope.

## Comandos esenciales

```bash
pnpm dev          # Servidor de desarrollo (Shopify CLI + codegen en vivo)
pnpm dev:cap      # Dev con Customer Account API push (tunnel *.tryhydrogen.dev)
pnpm dev:tunnel   # Dev con tunnel externo: pnpm dev:tunnel https://tu-url.com
pnpm build        # Build de producción (incluye codegen)
pnpm typecheck    # react-router typegen + tsc --noEmit
pnpm codegen      # Regenerar tipos GraphQL + React Router
pnpm lint         # ESLint
pnpm preview      # Preview del build
```

> **Nota TS importante:** Siempre ejecuta `pnpm codegen` antes de `pnpm typecheck`. Los errores `Cannot find module './+types/...'` son de tipos no generados, no errores reales de código.

> **Customer Account API:** Requiere HTTPS real. Usar `pnpm dev:cap` (crea tunnel `*.tryhydrogen.dev`) y acceder por esa URL, no por localhost.

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Shopify Hydrogen 2026.4.2 |
| Routing | React Router v7 (file-based, `app/routes/`) |
| Runtime | Shopify Oxygen (Cloudflare Workers) |
| CSS | `app/styles/app.css` — sistema de diseño propio (sin Tailwind en producción) |
| Tipos | TypeScript strict, path alias `~/*` → `app/*` |
| Package manager | pnpm |
| Node | ^22 o ^24 |

## Estructura del proyecto

```
cemshop-hydro/
├── app/
│   ├── routes/
│   │   ├── ($locale)._index.tsx              # Home (hero + trust + cats + products + editorial + newsletter)
│   │   ├── ($locale).products.$handle.tsx    # PDP — galería + opciones + trust + tabs
│   │   ├── ($locale).collections.$handle.tsx # Catálogo con grid 3 cols
│   │   ├── ($locale).collections._index.tsx  # Index de colecciones
│   │   ├── ($locale).cart.tsx                # Página carrito full
│   │   ├── ($locale).search.tsx              # Búsqueda — hero + grid de productos
│   │   ├── ($locale).policies._index.tsx     # Índice de políticas (cards con iconos)
│   │   ├── ($locale).policies.$handle.tsx    # Política individual (prose estilizado)
│   │   ├── ($locale).account.tsx             # Layout cuenta
│   │   ├── ($locale).account._index.tsx      # Dashboard cuenta
│   │   ├── ($locale).account.orders.*        # Pedidos
│   │   ├── ($locale).account.addresses.tsx
│   │   ├── ($locale).account.profile.tsx
│   │   ├── ($locale).account_.login.tsx
│   │   └── ... (blogs, sitemap, robots)
│   ├── components/
│   │   ├── Header.tsx                # Topbar + nav desktop + iconos + aside triggers
│   │   ├── Footer.tsx                # Footer 5 columnas oscuro
│   │   ├── PageLayout.tsx            # Layout wrapper + asides (cart/search/mobile)
│   │   ├── Aside.tsx                 # Drawer genérico animado
│   │   ├── ProductItem.tsx           # Card producto (grid) — cs-product
│   │   ├── ProductForm.tsx           # Variantes + add to cart + wishlist heart
│   │   ├── ProductPrice.tsx          # Precio con compare-at
│   │   ├── ProductImage.tsx          # Imagen con galería
│   │   ├── CartMain.tsx              # Lista items carrito (aside + página)
│   │   ├── CartLineItem.tsx          # Item individual del carrito
│   │   ├── CartSummary.tsx           # Resumen + checkout CTA (sin código promo)
│   │   ├── AddToCartButton.tsx       # Wrapper CartForm para add-to-cart
│   │   ├── SearchFormPredictive.tsx  # Form búsqueda predictiva
│   │   ├── SearchResultsPredictive.tsx # Resultados predictivos con imágenes grandes
│   │   ├── SearchResults.tsx         # Resultados página búsqueda (grid cs-product)
│   │   └── PaginatedResourceSection.tsx
│   ├── lib/
│   │   ├── context.ts    # Hydrogen context
│   │   ├── session.ts    # Manejo de sesión y carrito
│   │   ├── fragments.ts  # GraphQL fragments compartidos
│   │   ├── variants.ts   # useVariantUrl, getVariantUrl
│   │   ├── search.ts     # Utilidades de búsqueda
│   │   ├── i18n.ts       # Soporte multiidioma
│   │   └── redirect.ts   # redirectIfHandleIsLocalized
│   ├── graphql/customer-account/  # Mutations y queries de cuenta
│   ├── styles/
│   │   ├── app.css       # ⭐ Sistema de diseño CEMShop (ÚNICO ARCHIVO DE ESTILOS)
│   │   ├── reset.css     # Reset minimal
│   │   └── tailwind.css  # @import 'tailwindcss' (no activo en prod)
│   ├── root.tsx          # Layout raíz, fonts Google, SSR
│   ├── routes.ts         # Config rutas
│   ├── entry.client.tsx  # Hydration
│   └── entry.server.tsx  # SSR handler
├── server.ts
├── vite.config.ts
├── react-router.config.ts
├── CLAUDE.md             # Este archivo
├── AGENTS.md             # Guía para agentes AI
└── DESIGN.md             # Sistema de diseño detallado
```

## Convenciones de código

### CSS
- **Todo el CSS vive en `app/styles/app.css`** — no añadir CSS inline salvo casos excepcionales
- Prefijo `cs-` obligatorio para clases de componentes CEMShop
- Tokens de color via CSS custom properties: `var(--coral-600)`, `var(--ink-900)`, etc.
- **Nunca** valores de color hardcoded — siempre usar tokens del `:root`
- Breakpoints responsive: `1024px` (tablet landscape), `768px` (móvil), `480px` (phones)

### GraphQL
- Queries y mutations al final del archivo de ruta que las usa (como `as const`)
- Fragments compartidos en `app/lib/fragments.ts`
- Ejecutar `pnpm codegen` después de cambiar cualquier query

### Rutas (React Router v7)
- Pattern `($locale).{ruta}.tsx` — el locale es opcional
- `loadCriticalData()` → await (bloquea render)
- `loadDeferredData()` → no await (no bloquea)
- Exportar `meta()` con título `CEMShop | {título}`

### Componentes
- `useOptimisticCart()` para el carrito (UI optimista)
- `useAside()` → `open('cart' | 'search' | 'mobile')` para drawers
- El buscador predictivo usa la misma instancia via `useFetcher({key: 'search'})`
- El form de búsqueda debe renderizar su div estilizado DENTRO del render prop (no en el componente `SearchForm`) para evitar doble flex container

### Carrito
- Sin código promocional ni gift cards — eliminados de `CartSummary.tsx`
- Items del aside: `padding: 16px 20px` por línea
- Resumen aside: sólo Subtotal + botón checkout

### Búsqueda predictiva (aside)
- Resultados de producto: imagen 68×80px (ratio 4:5) + vendor + nombre + precio
- Secciones en español: Productos / Colecciones / Artículos / Páginas
- El div estilizado `.predictive-search-form` va dentro del render prop de `SearchFormPredictive`, no como className del propio componente

## Variables de entorno

```
PUBLIC_STORE_DOMAIN=         # cemshop.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN= # Token Storefront API
PUBLIC_CHECKOUT_DOMAIN=      # Dominio checkout
PUBLIC_STOREFRONT_ID=        # Para analytics
SESSION_SECRET=              # Secret sesiones
```

Sin `PUBLIC_STORE_DOMAIN` se muestra `<MockShopNotice>` (modo demo).

## Hydrogen patterns

```tsx
// Carrito optimista
const cart = useOptimisticCart(originalCart);

// Abrir aside
const {open} = useAside();
open('cart');

// Imagen con CDN Shopify (usa el componente Image de hydrogen, no <img>)
import {Image, Money} from '@shopify/hydrogen';
<Image data={imageObject} sizes="400px" />
<Money data={priceObject} />

// Analytics
import {Analytics} from '@shopify/hydrogen';
<Analytics.ProductView data={{products: [...]}} />

// Add to cart
import {CartForm} from '@shopify/hydrogen';
```

## Qué NO hacer

- No hacer `pnpm add` sin preguntar — el stack está completo
- No añadir comentarios explicativos al código
- No modificar `server.ts`, `entry.*.tsx`, `react-router.config.ts`, `vite.config.ts` sin motivo
- No saltarse `pnpm codegen` si se cambian queries GraphQL
- No poner CSS inline con valores hardcoded de color
- No añadir `className` al componente `SearchFormPredictive` directamente — usarlo dentro del render prop
- No usar `padding-left: 0` en `.cs-trust > div:first-child` en móvil — tiene un `!important` override que resetea el desktop rule

## Menú de navegación

- Header: handle `main-menu` en Shopify admin
- Footer: handle `footer` en Shopify admin
- Sin estos handles se usan los fallbacks definidos en `Header.tsx` y `Footer.tsx`
