# CEMShop — Guía para agentes AI

Este archivo describe cómo un agente debe operar en este repo para ser eficaz sin re-leer todo desde cero.

---

## Contexto rápido

- **Proyecto:** Ecommerce Shopify Hydrogen para productos íntimos (sexshop discreto, premium)
- **Stack:** Hydrogen 2026.4.2 + React Router v7 + TypeScript strict
- **CSS:** `app/styles/app.css` único — sistema propio con prefijo `cs-` (NO Tailwind para componentes)
- **Diseño detallado:** `DESIGN.md`
- **Arquitectura completa:** `CLAUDE.md`
- **Package manager:** pnpm
- **Runtime:** Shopify Oxygen (edge workers — sin Node.js APIs, sin filesystem)

---

## Archivos críticos — qué leer antes de tocar algo

| Objetivo | Lee primero |
|----------|-------------|
| Cualquier estilo | `app/styles/app.css` (tokens en `:root`) + `DESIGN.md` |
| Header / Footer | `app/components/Header.tsx`, `Footer.tsx` |
| Carrito aside | `CartMain.tsx`, `CartLineItem.tsx`, `CartSummary.tsx` |
| Búsqueda aside | `PageLayout.tsx` (función `SearchAside`) + `SearchResultsPredictive.tsx` |
| Búsqueda página | `($locale).search.tsx` + `SearchResults.tsx` |
| PDP | `($locale).products.$handle.tsx` + `ProductForm.tsx` |
| Home | `($locale)._index.tsx` |
| Políticas | `($locale).policies._index.tsx` + `($locale).policies.$handle.tsx` |
| Layout global | `PageLayout.tsx` + `root.tsx` |
| Tipos GraphQL | `storefrontapi.generated.d.ts` (no editar — generado) |

---

## Reglas de trabajo

### CSS
- Colores SIEMPRE con tokens: `var(--coral-600)`, `var(--ink-900)`, etc. Nunca hex/rgb hardcoded
- Clases nuevas van en `app/styles/app.css` con prefijo `cs-`
- Responsive: editar los bloques `@media (max-width: 1024px)`, `768px`, `480px` al final de `app.css`
- No usar inline styles salvo posicionamiento muy específico (y nunca colores inline)

### TypeScript
- Después de cambiar queries GraphQL → `pnpm codegen`
- Errores `Cannot find module './+types/...'` → ignorar, son tipos no generados

### GraphQL
- Queries y mutations al **final del archivo de ruta** como constantes `as const`
- Fragments compartidos en `app/lib/fragments.ts`

### Hydrogen
```tsx
// ✅ Carrito optimista
const cart = useOptimisticCart(originalCart);

// ✅ Abrir drawer
const {open, close} = useAside();
open('cart');  // | 'search' | 'mobile'

// ✅ Imagen con CDN Shopify
import {Image, Money} from '@shopify/hydrogen';
<Image data={imgObj} sizes="400px" />

// ❌ No usar window/document en loaders (Oxygen edge)
// ❌ No usar APIs de Node.js (fs, path, process.env manual, etc.)
// ❌ No hacer pnpm add sin preguntar
```

### Patrón búsqueda — trampas conocidas

El buscador tiene DOS instancias de formulario: el del **aside** (predictivo) y el de la **página** `/search` (regular).

**Aside predictivo:**
- `SearchFormPredictive` renderiza `<fetcher.Form className="predictive-search-form">`
- Los hijos (input + button) van **directamente** dentro del render prop, SIN un `<div>` extra con esa misma clase (causaría doble flex container que aplasta el input)

**Página `/search`:**
- `SearchForm` renderiza un `<Form>` de react-router
- El div estilizado `<div className="cs-search-form-page">` va DENTRO del render prop, no como `className` del componente `SearchForm`

### Trampas CSS conocidas

1. **Trust strip primer ítem:** La regla base `.cs-trust > div:first-child { padding-left: 0 }` (especificidad 0,2,1) gana sobre el override de `@media (max-width: 768px) .cs-trust > div { padding: 18px 12px }` (0,1,1). El fix usa `!important`: `.cs-trust > div:first-child { padding-left: 12px !important }`

2. **PDP aside full-width en móvil:** `aside { width: 100vw; right: -100vw }` + `.overlay.expanded aside { transform: translateX(-100vw) }` — no tocar la variable `--aside-width` dentro del media query (no funciona sin `:root`)

3. **PDP padding doble:** `.cs-pdp-info` tiene `padding: 24px 20px 0` en móvil. Sus hijos (desc, price, rating, options, actions, feats) NO deben tener padding-left/right propio — heredan el 20px del padre. Solo título (`h1`) y vendor (`cs-eyebrow`) son directos sin padding propio.

4. **Breadcrumb PDP:** El wrapper del breadcrumb usa `className="cs-pdp-breadcrumb"` (NO inline style `padding: '20px 48px 0'` que no se puede sobreescribir con media queries).

---

## Estado del proyecto (Mayo 2026)

### ✅ Implementado y diseñado

- Sistema de diseño completo en `app.css` (tokens, componentes, animaciones, 3 breakpoints)
- Header: topbar + nav desktop + iconos + scroll effect + menú móvil aside
- Footer: 5 columnas oscuro, responsive
- **Home:** hero animado (imagen arriba en móvil) + trust strip + categorías + productos + editorial + newsletter (form responsivo)
- **Catálogo:** hero editorial + grid 3 col + sin sidebar en móvil
- **Collections index:** tiles de categoría
- **PDP:** galería + opciones + trust features + tabs + breadcrumb responsive + acciones en fila (add-to-cart + heart) en móvil
- **Carrito aside:** items + resumen + checkout (sin código promo)
- **Carrito página:** layout 2 col → 1 col móvil
- **Búsqueda aside:** predictiva con imágenes 68×80px, etiquetas en español
- **Búsqueda página:** hero + grid `cs-product` idéntico al catálogo + paginación
- **Políticas:** índice con cards + iconos SVG temáticos; individual con prose estilizado
- **Account:** sidebar + órdenes + addresses + profile (responsive)
- **Responsive completo:** 1024px / 768px / 480px — todas las vistas

### ⬜ Pendiente / Por mejorar

- Tabs del PDP con JavaScript (actualmente estáticos — el botón no cambia contenido)
- Reviews reales (actualmente hardcoded 4.9 / 312)
- Filtros funcionales en el catálogo (actualmente visuales)
- Wishlist real (botón heart en PDP no guarda nada)
- Páginas de blog con diseño específico
- Página 404 personalizada
- Animaciones de entrada (scroll reveal)
- Modo oscuro

---

## Flujo de trabajo recomendado

```bash
# 1. Arrancar (con Customer Account API si se necesita)
pnpm dev        # localhost:3000
pnpm dev:cap    # tunnel *.tryhydrogen.dev (para OAuth)

# 2. Modificar código

# 3. Si cambiaste queries GraphQL:
pnpm codegen

# 4. Verificar tipos
pnpm typecheck

# 5. Build
pnpm build
```

---

## Contexto del negocio

CEMShop es una tienda de productos íntimos con posicionamiento **premium-discreto**:

- **Discreción:** envío en caja neutra, cargo como "CMS *Madrid"
- **Educación:** Diario CEMShop con guías + sexólogas
- **Calidad:** silicona médica, materiales certificados
- **Inclusividad:** para todas las personas, sin tabúes
- **Idioma:** Español (España), tutear, cálido pero elegante

El copy existente en la UI refleja estos valores. Al añadir textos, mantener el tono.

---

## Snippets frecuentes

### Nueva sección en home
```tsx
// En ($locale)._index.tsx
// 1. Añadir query en loadCriticalData() o loadDeferredData()
// 2. Añadir componente funcional con clases cs-section, cs-section-head, cs-grid-*
// 3. Renderizarlo en Homepage()
```

### Nuevo componente
```tsx
export function MiComponente() {
  return (
    <section className="cs-section">
      <div className="cs-section-head">
        <div className="copy">
          <span className="cs-eyebrow">Eyebrow</span>
          <h2>Título</h2>
        </div>
      </div>
      <div className="cs-grid-4">{/* items */}</div>
    </section>
  );
}
```

### Nueva ruta con diseño
```tsx
// app/routes/($locale).mi-pagina.tsx
export const meta: Route.MetaFunction = () => [{title: 'CEMShop | Mi Página'}];

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(MI_QUERY);
  return {data};
}

export default function MiPagina() {
  const {data} = useLoaderData<typeof loader>();
  return (
    <div>
      <section className="cs-catalog-hero">
        <div className="cs-crumbs">...</div>
        <h1 className="cs-catalog-title">...</h1>
      </section>
      <section className="cs-section">...</section>
    </div>
  );
}

const MI_QUERY = `#graphql ...` as const;
```

### Abrir carrito tras añadir producto
```tsx
import {useAside} from '~/components/Aside';
const {open} = useAside();

<AddToCartButton onClick={() => open('cart')} lines={[{merchandiseId: variant.id, quantity: 1}]}>
  <span className="cs-add-to-cart">Agregar a la bolsa</span>
</AddToCartButton>
```

### Clases de hero de página (patrón estándar)
```tsx
// Igual que /collections/$handle y /search
<section className="cs-catalog-hero">
  <div className="cs-crumbs">
    <Link to="/">Inicio</Link>
    <span className="sep">/</span>
    <span className="current">Sección</span>
  </div>
  <div className="cs-catalog-meta">
    <h1 className="cs-catalog-title">Título <em>en coral</em></h1>
    <span style={{fontSize: 13, color: 'var(--text-muted)'}}>N items</span>
  </div>
</section>
```
