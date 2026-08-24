# CEMShop — Sistema de Diseño

Diseño propio CEMShop (Mayo 2026). **Minimal moderno:** crema/rosé empolvado + acentos rosa-malva + tipografía serif editorial (Cormorant Garamond) + sans humanista (Manrope).

Todo el CSS vive en `app/styles/app.css`. **No usar Tailwind para estilos de componentes** — usar clases `cs-` del sistema.

---

## Paleta de colores

Tokens definidos en `:root` en `app/styles/app.css`. Nunca hardcodear valores.

### Crema / Rosé empolvado

| Token | Hex | Uso |
|-------|-----|-----|
| `--cream-50` | `#FDFBFD` | Superficies de cards, aside background |
| `--cream-100` | `#F7F2F6` | Fondo general de página (`--bg`) |
| `--cream-200` | `#EDE3EA` | Fondo imagen producto, placeholders, galería |
| `--cream-300` | `#DDD0D8` | Bordes visibles |
| `--nude-400` | `#C0B0BA` | — |
| `--nude-500` | `#9A8892` | Texto muted (`--text-muted`) |

### Tinta oscura

| Token | Hex | Uso |
|-------|-----|-----|
| `--ink-700` | `#5E4858` | Texto secundario (`--text-soft`) |
| `--ink-800` | `#3C2830` | — |
| `--ink-900` | `#2C1828` | Texto principal, header, footer, botones primarios |

### Rosé / Coral (acento)

| Token | Hex | Uso |
|-------|-----|-----|
| `--coral-400` | `#D882AC` | Iconos sobre oscuro, dot del logo |
| `--coral-500` | `#C86098` | Estrellas de rating |
| `--coral-600` | `#B84878` | Acento principal — CTAs, `<em>` en títulos, nav activo |
| `--coral-700` | `#98305E` | Hover de CTAs |
| `--coral-tint` | `#F5E2EE` | Fondo secciones destacadas (newsletter, policy icons) |

### Tokens semánticos

```css
--bg:           var(--cream-100)   /* Fondo página */
--surface:      var(--cream-50)    /* Cards, paneles, aside */
--surface-2:    var(--cream-200)   /* Fondos secundarios */
--border:       #D8C8D4            /* Bordes normales */
--border-soft:  #EAE0E7            /* Bordes suaves */
--text:         var(--ink-900)
--text-muted:   var(--nude-500)
--text-soft:    var(--ink-700)
--accent:       var(--coral-600)
--accent-hover: var(--coral-700)
--accent-tint:  var(--coral-tint)
```

---

## Tipografía

| Rol | Fuente | Variable |
|-----|--------|---------|
| Display / titulares | **Cormorant Garamond** italic 400/500/600 | `--font-display` |
| Body / UI / labels | **Manrope** 300–700 | `--font-body` |

Cargadas desde Google Fonts en `app/root.tsx`.

### Escala tipográfica (desktop)

```
Hero h1:           clamp(64px, 6.5vw, 130px) / line-height 0.92 / ls -0.03em
Section h2:        44px / ls -0.015em
Catalog title:     68px / line-height 0.96
PDP h1:            52px / line-height 0.98
Logo:              28px italic
Nav links:         13px / weight 500 / ls 0.01em
Body:              14px / line-height 1.5 / ls -0.005em
Eyebrow:           11px / ls 0.22em / UPPERCASE / text-muted
Precio listing:    15px weight 600
Precio PDP:        32px Cormorant / color coral-700
Cart line name:    font-display 18px
```

---

## Espaciado y radios

```css
--radius-sm:   6px
--radius:      10px
--radius-lg:   18px
--radius-xl:   28px

--pad-card:    18px
--gap-grid:    20px
--aside-width: 420px   /* 100vw en móvil */
--header-height: 64px  /* 60px en móvil */
```

### Padding de secciones

```css
.cs-section          /* 64px 48px */
.cs-section--tight   /* 36px 48px */
.cs-section--flush   /* 0 48px 64px */
```

En tablet (≤1024px): 52px/36px. En móvil (≤768px): 40px/20px. En phones (≤480px): 32px/16px.

---

## Componentes — clases CSS

### Botones

```html
<button class="cs-btn cs-btn--primary">Comprar ahora</button>   <!-- ink-900, hover: coral-700 -->
<button class="cs-btn cs-btn--coral">Leer el diario</button>    <!-- coral-600 -->
<button class="cs-btn cs-btn--ghost">Ver todo →</button>        <!-- outline -->
```

Forma: `border-radius: 999px` (pill). Todos tienen `padding: 12px 28px`, `font-size: 13px`, `font-weight: 500`.

### Add to Cart

```html
<span class="cs-add-to-cart">
  <BagIcon />
  Agregar a la bolsa
</span>
```

Coral-600 background, pill shape, `flex: 1` dentro de `.cs-pdp-actions`. En móvil: ocupa el ancho disponible del flex container del form.

### Carrito — botón checkout

```html
<a href={checkoutUrl} class="cs-checkout-btn">
  <LockIcon /> Pagar de forma segura <ArrowIcon />
</a>
```

### Eyebrow / Tag

```html
<span class="cs-eyebrow">Colección Primavera · 2026</span>
<span class="cs-tag-soft">OFERTA</span>
```

### Chips / Filtros

```html
<span class="cs-chip">Nuevo</span>
<span class="cs-chip cs-chip--active">Bestseller</span>
```

### Grids

```html
<div class="cs-grid-4">  <!-- 4 col desktop → 2 col móvil -->
<div class="cs-grid-3">  <!-- 3 col → 2 col -->
<div class="cs-grid-2">  <!-- 2 col fijo -->
<div class="products-grid"> <!-- 3 col → 2 col, usado en colección y búsqueda -->
```

### Breadcrumbs

```html
<div class="cs-crumbs">
  <a href="/">Inicio</a>
  <span class="sep">/</span>
  <span class="current">Página actual</span>
</div>
```

---

## Páginas — estructura y clases

### Home (`($locale)._index.tsx`)

```
.cs-hero                    (grid 1.05fr 1fr, min-height: clamp(580px, 88vh, 960px))
  .cs-hero-copy             (flex col, padding clamp)
  .cs-hero-art              (gradiente animado + imagen/orb + badge)
    .cs-hero-badge          (pill glassmorphism, top-right)

.cs-trust                   (grid 4 cols, ink-900 bg)

.cs-section                 (catgorías)
  .cs-grid-4 > .cs-cat     (tiles de categoría, aspect-ratio 1/1.1)

.cs-section                 (productos destacados)
  .cs-grid-4 > .cs-product (cards)

.cs-section--tight          (editorial)
  .cs-editorial             (grid 1fr 1fr, ink-900)

.cs-newsletter              (coral-tint, centrado, form pill)
```

**Mobile hero (≤768px):** `.cs-hero-art { order: -1 }` — imagen arriba, texto abajo.

### PDP (`($locale).products.$handle.tsx`)

```
.cs-pdp-breadcrumb          (padding: 20px 48px 0 desktop / 16px 20px 0 móvil)
.cs-pdp                     (grid 1.1fr 1fr, padding 40px 48px)
  div (galería)
    .cs-gallery-main        (aspect-ratio 4/5, border-radius-lg)
    .cs-gallery-thumbs      (flex, gap 10px; scroll horizontal en móvil)
  .cs-pdp-info              (sticky top:100px desktop; static en móvil)
    .cs-eyebrow             (vendor)
    h1
    .cs-rating
    .cs-price-row           (.now coral + .was tachado + .save badge)
    .cs-pdp-desc
    ProductForm             (.product-form > .product-options + .cs-pdp-actions)
    .cs-pdp-feats           (grid 2×2 desktop; 1 col con bordes en móvil)
.cs-pdp-tabs                (padding 0 48px 64px)
```

**Mobile PDP (≤768px):** 1 columna, galería full-width sin border-radius, todos los hijos de `.cs-pdp-info` heredan el padding 20px del padre (sin padding propio adicional). Acciones en fila horizontal (add-to-cart + heart).

### Catálogo (`($locale).collections.$handle.tsx`)

```
.cs-catalog-hero            (padding 48px 48px 28px)
  .cs-crumbs
  .cs-catalog-meta          (flex between: título + contador)
    .cs-catalog-title       (68px, line-height 0.96, em → coral)

.cs-section
  .products-grid            (3 col → 2 col móvil)
    .cs-product             (card estándar)
```

### Búsqueda (`($locale).search.tsx`)

```
.cs-catalog-hero            (mismo patrón que catálogo)
  .cs-crumbs
  .cs-catalog-title         (Resultados para <em>término</em>)
  SearchForm                (div.cs-search-form-page dentro del render prop)

.cs-section
  .products-grid            (misma clase que catálogo, usa tarjetas cs-product)
  .cs-search-pager          (botones paginación pill)
```

**Barra de búsqueda en página:** `div.cs-search-form-page` va DENTRO del render prop de `SearchForm` (no como className del componente). Pill con fondo surface, input `flex: 1`, botón 44px. En móvil: `width: 100%`.

### Buscador predictivo (aside)

```
aside (type="search")
  .predictive-search        (height 100%, overflow-y auto)
    form.predictive-search-form  (sticky top, flex, border-bottom)
      input[type=search]
      button (icon)
    .predictive-search-result (por tipo)
      h5 (etiqueta: Productos / Colecciones / Artículos / Páginas)
      ul > li.predictive-search-result-item
        a (flex, gap 14px)
          img (68×80px, object-fit cover)
          .search-item-info
            .search-item-brand
            .search-item-name
            .search-item-price
```

### Carrito aside

```
aside (type="cart")
  CartMain
    ul.cart-details         (flex 1, overflow-y auto)
      li.cart-line          (padding 16px 20px, border-bottom)
        .cart-line-img      (90×112px)
        .cart-line-info
    .cart-summary-aside     (padding 18px 20px, border-top)
      .cs-summary-row       (Subtotal)
      .cs-checkout-btn
```

Sin código promo ni gift cards.

### Políticas

**Índice (`/policies`):**
```
.cs-policies-hero           (padding 56px 48px 40px, border-bottom)
  .cs-crumbs
  .cs-policies-title        (clamp 40–72px, em → coral)
  .cs-policies-subtitle

.cs-section
  ul.cs-policies-grid       (2 col → 1 col móvil)
    li > a.cs-policy-card   (flex, icon coral-tint + title + desc + arrow →)
```

**Individual (`/policies/$handle`):**
```
.cs-policy-hero             (padding 56px 48px 40px)
  .cs-crumbs
  .cs-policy-title          (clamp 36–64px)

.cs-policy-layout           (padding 56px 48px 80px)
  article.cs-policy-prose   (HTML de Shopify estilizado)
  a.cs-policy-back          (← Volver a Políticas)
```

---

## Aside (drawer)

```
.overlay                    (fixed inset 0, backdrop-filter blur 4px, z-index 200)
  button.close-outside      (área fuera del aside para cerrar)
  aside                     (fixed right, width var(--aside-width), transform translateX)
    header                  (padding 24px 28px, border-bottom)
      h3
      button.close          (×)
    main                    (flex 1, overflow-y auto, padding 20px 24px)
```

En móvil (≤768px): `aside { width: 100vw; right: -100vw }`.

---

## Responsive — breakpoints

### Desktop (base, >1024px)
Diseño completo. Hero con `min-height: clamp(580px, 88vh, 960px)` y `h1: clamp(64px, 6.5vw, 130px)`.

### Tablet landscape (≤1024px)
- Padding de secciones: 52px/36px
- PDP: gap 40px, padding 32px 36px

### Tablet / Móvil (≤768px)
- Topbar oculto
- Header: 60px altura, nav oculto, toggle hamburger visible
- Hero: imagen arriba (`order: -1`), texto abajo; h1 `clamp(38px, 9vw, 60px)`
- Trust strip: grid 2×2, `padding-left: 12px !important` en first-child
- Grids 4/3 → 2 columnas
- Editorial: 1 columna, arte oculto
- Newsletter: formulario en columna, form con `border-radius: var(--radius-lg)` y elementos apilados
- Catálogo: sin sidebar filtros, productos 2 col
- PDP: 1 columna, galería sin border-radius, `.cs-pdp-info { padding: 24px 20px 0 }`, acciones en fila (add-to-cart + heart)
- Aside: 100vw
- Cart page: 1 columna
- Account: sidebar arriba, formularios 1 col
- Footer: 2 columnas
- Breadcrumb PDP: `padding: 16px 20px 0` (clase `.cs-pdp-breadcrumb`)

### Phones (≤480px)
- Hero h1: `clamp(36px, 9vw, 50px)`, CTAs apilados verticalmente
- Trust strip: 1 columna
- Footer: 1 columna

---

## Animaciones

| Animación | Propiedad | Duración |
|-----------|-----------|----------|
| Hero gradient drift | `transform: rotate + translate` | 14s infinite |
| Card hover lift | `translateY(-3px)` + box-shadow | 250ms ease |
| Card image zoom | `scale(1.04)` | 400ms ease |
| Quick-add reveal | `opacity 0→1` + `translateY(8px→0)` | 200ms |
| Category tile lift | `translateY(-4px)` | 200ms |
| Header shadow | `.scrolled` → box-shadow | 200ms |
| Aside drawer | `translateX` | 300ms cubic-bezier(0.4, 0, 0.2, 1) |

---

## Silhouettes SVG

Cuando no hay imagen, se usan SVGs abstractos en `--cream-200` / `--coral` gradients. Disponibles en: `HeroOrb`, `CategoryOrb`, `EditorialOrb`, `CartLinePlaceholder`, `SearchProductPlaceholder`, `ProductSilhouette`.

---

## Patrones UX

### Carrito
- Drawer derecho, `type="cart"`, se abre con `open('cart')`
- Sin código promocional ni gift cards (simplificado)
- Checkout via `cart.checkoutUrl` → Shopify hosted checkout

### Búsqueda
- Predictiva en aside `type="search"`, datos via `useFetcher({key: 'search'})`
- Página `/search`: usa `SearchForm` + `SearchResults` (muestra cs-product cards idénticas al catálogo)

### Navegación
- Menú desktop: `header-menu-desktop` (oculto en móvil)
- Menú móvil: aside `type="mobile"` con `header-menu-mobile`
- Breadcrumbs en: PDP, catálogo, colecciones index, búsqueda, políticas

### Cuenta
- Customer Account API (OAuth) — requiere HTTPS
- Layout con sidebar: perfil + órdenes + direcciones
- En móvil: sidebar arriba, contenido abajo
