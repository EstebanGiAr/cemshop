import {Await, useLoaderData, Link, NavLink} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';

export const meta: Route.MetaFunction = () => {
  return [{title: 'CEMShop · Placer sin pedir permiso'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0],
    allCollections: collections.nodes,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });
  return {recommendedProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      {data.isShopLinked ? null : <MockShopNotice />}
      <HeroSection collection={data.featuredCollection} />
      <TrustStrip />
      <CategoriesSection collections={data.allCollections} />
      <FeaturedProducts products={data.recommendedProducts} />
      <EditorialBanner collection={data.featuredCollection} />
      <NewsletterSection />
    </div>
  );
}

/* ── HERO ── */
function HeroSection({collection}: {collection: FeaturedCollectionFragment}) {
  const image = collection?.image;
  return (
    <section className="cs-hero">
      <div className="cs-hero-copy">
        <span className="cs-eyebrow">Colección Primavera · 2026</span>
        <h1>
          Placer sin pedir <em>permiso</em>.
        </h1>
        <p className="lede">
          Lencería, juguetes y bienestar íntimo curados con criterio. Materiales
          seguros, diseño honesto, envío 100% discreto.
        </p>
        <div className="cs-hero-cta">
          <Link className="cs-btn cs-btn--primary" to="/collections/all" prefetch="intent">
            Comprar ahora →
          </Link>
          <Link className="cs-btn cs-btn--ghost" to="/collections" prefetch="intent">
            Explorar colecciones
          </Link>
        </div>
        <div className="cs-hero-stats">
          <div className="stat">
            <div className="num">4,9</div>
            <div className="lbl">★ 12k reseñas</div>
          </div>
          <div className="stat">
            <div className="num">120k+</div>
            <div className="lbl">Clientas felices</div>
          </div>
          <div className="stat">
            <div className="num">48h</div>
            <div className="lbl">Envío exprés</div>
          </div>
        </div>
      </div>

      <div className="cs-hero-art">
        <div className="cs-hero-badge">
          <span className="dot" />
          Edición limitada
        </div>
        {image ? (
          <Image
            data={image}
            sizes="50vw"
            alt={image.altText || collection.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />
        ) : (
          <HeroOrb />
        )}
      </div>
    </section>
  );
}

function HeroOrb() {
  return (
    <svg viewBox="0 0 200 240" style={{width: '60%', height: '60%', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 30px 60px rgba(180,80,60,0.18))'}}>
      <defs>
        <radialGradient id="hero-g" cx="35%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#C86098" />
          <stop offset="100%" stopColor="#B04878" />
        </radialGradient>
      </defs>
      <ellipse cx="78" cy="92" rx="58" ry="62" fill="url(#hero-g)" />
      <ellipse cx="128" cy="148" rx="44" ry="48" fill="#D882AC" opacity="0.85" />
      <ellipse cx="78" cy="92" rx="22" ry="24" fill="white" opacity="0.35" />
    </svg>
  );
}

/* ── TRUST STRIP ── */
function TrustStrip() {
  const items = [
    {icon: <ShieldIcon />, title: 'Envío 100% discreto', desc: 'Caja neutra, sin marca exterior'},
    {icon: <TruckIcon />, title: 'Envío gratis +49€', desc: 'Recíbelo en 24-48h'},
    {icon: <ChatIcon />, title: 'Atención íntima 24/7', desc: 'Chat confidencial real'},
    {icon: <ReturnIcon />, title: '30 días para cambiar', desc: 'Devolución sencilla y segura'},
  ];
  return (
    <div className="cs-trust">
      {items.map((item, i) => (
        <div key={i} className={`cs-reveal d${i + 1}`}>
          <div className="cs-trust-icon">{item.icon}</div>
          <div className="cs-trust-text">
            <strong>{item.title}</strong>
            <span>{item.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── CATEGORIES ── */
function CategoriesSection({collections}: {collections: FeaturedCollectionFragment[]}) {
  const cats = collections.slice(0, 8);
  const fillers = FALLBACK_CATEGORIES.slice(0, Math.max(0, 8 - cats.length));
  const all = [...cats, ...fillers].slice(0, 8);

  return (
    <section className="cs-section">
      <div className="cs-section-head cs-reveal">
        <div className="copy">
          <span className="cs-eyebrow">Explora</span>
          <h2>Compra por categoría</h2>
          <p>Encuentra rápido lo que buscas — o déjate guiar.</p>
        </div>
        <Link className="cs-btn cs-btn--ghost" to="/collections" prefetch="intent">
          Ver todo →
        </Link>
      </div>
      <div className="cs-grid-4">
        {all.slice(0, 4).map((cat, i) => (
          <CategoryCard key={i} cat={cat} index={i} />
        ))}
      </div>
      {all.length > 4 && (
        <div className="cs-grid-4" style={{marginTop: 'var(--gap-grid)'}}>
          {all.slice(4, 8).map((cat, i) => (
            <CategoryCard key={i + 4} cat={cat} index={i + 4} />
          ))}
        </div>
      )}
    </section>
  );
}

const FALLBACK_CATEGORIES = [
  {handle: 'all', title: 'Todo', image: null},
  {handle: 'lingerie', title: 'Lencería', image: null},
  {handle: 'juguetes', title: 'Juguetes', image: null},
  {handle: 'lubricantes', title: 'Lubricantes', image: null},
  {handle: 'bienestar', title: 'Bienestar', image: null},
  {handle: 'parejas', title: 'Para parejas', image: null},
  {handle: 'regalos', title: 'Regalos', image: null},
  {handle: 'edicion-ltda', title: 'Edición ltda.', image: null},
];

function CategoryCard({cat, index}: {cat: any; index: number}) {
  const bgs = ['cream', 'coral', 'cream', 'ink', 'coral', 'cream', 'ink', 'cream'];
  const bg = bgs[index % bgs.length];
  return (
    <Link
      to={`/collections/${cat.handle}`}
      className="cs-cat cs-reveal"
      style={{
        background: bg === 'ink' ? 'var(--ink-900)' : bg === 'coral' ? 'var(--coral-tint)' : 'var(--cream-200)',
        transitionDelay: `${(index % 4) * 0.07}s`,
      }}
      prefetch="intent"
    >
      {cat.image ? (
        <>
          <Image data={cat.image} className="cs-cat-img" alt={cat.title} sizes="25vw" />
          <div className="cs-cat-overlay" />
        </>
      ) : (
        <div className="cs-cat-bg">
          <CategoryOrb index={index} />
        </div>
      )}
      <div className="cs-cat-label" style={bg === 'ink' ? {color: 'var(--ink-900)'} : {}}>
        <span>{cat.title}</span>
        <span className="cs-cat-arrow">↗</span>
      </div>
    </Link>
  );
}

function CategoryOrb({index}: {index: number}) {
  const tones = [
    {a: '#C86098', b: '#D882AC'},
    {a: '#D490B8', b: '#E8B8D0'},
    {a: '#C0B0C0', b: '#DDD0DA'},
    {a: '#5A3858', b: '#8C6080'},
  ];
  const t = tones[index % tones.length];
  return (
    <svg viewBox="0 0 200 240" style={{width: '55%', height: '55%', opacity: 0.85}}>
      <defs>
        <radialGradient id={`cat-g-${index}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor={t.a} />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="110" rx="68" ry="80" fill={`url(#cat-g-${index})`} />
      <ellipse cx="84" cy="88" rx="18" ry="24" fill="white" opacity="0.3" />
    </svg>
  );
}

/* ── FEATURED PRODUCTS ── */
function FeaturedProducts({products}: {products: Promise<RecommendedProductsQuery | null>}) {
  return (
    <section className="cs-section" style={{paddingTop: 0}}>
      <div className="cs-section-head cs-reveal">
        <div className="copy">
          <span className="cs-eyebrow">Selección de la casa</span>
          <h2>Lo más deseado</h2>
          <p>Los favoritos de la comunidad este mes.</p>
        </div>
        <div className="cs-section-chips">
          {['Todo', 'Nuevo', 'Bestseller'].map((t, i) => (
            <span key={t} className={`cs-chip${i === 0 ? ' cs-chip--active' : ''}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <Suspense fallback={<ProductsGridSkeleton />}>
        <Await resolve={products}>
          {(response) => (
            <div className="cs-grid-4">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="cs-grid-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{background: 'var(--surface)', borderRadius: 'var(--radius-lg)', aspectRatio: '4/5', opacity: 0.5}} />
      ))}
    </div>
  );
}

/* ── EDITORIAL BANNER ── */
function EditorialBanner({collection}: {collection: FeaturedCollectionFragment}) {
  return (
    <section className="cs-section--tight cs-reveal">
      <div className="cs-editorial">
        <div className="cs-editorial-copy">
          <span className="cs-eyebrow" style={{color: 'var(--coral-400)'}}>
            Diario CEMShop
          </span>
          <h2>
            Hablemos de placer <em>sin tabúes</em>.
          </h2>
          <p>
            Guías honestas, entrevistas con sexólogas y rutinas íntimas.
            Acompañamos cada producto con educación que tiene sentido.
          </p>
          <div style={{display: 'flex', gap: 12, marginTop: 12}}>
            <Link className="cs-btn cs-btn--coral" to="/collections/all" prefetch="intent">
              Ver colección →
            </Link>
          </div>
        </div>
        <div className="cs-editorial-art">
          {collection?.image ? (
            <Image data={collection.image} alt={collection.title} sizes="50vw" />
          ) : (
            <EditorialOrb />
          )}
        </div>
      </div>
    </section>
  );
}

function EditorialOrb() {
  return (
    <svg viewBox="0 0 200 240" style={{width: '60%', height: '60%', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.4))'}}>
      <defs>
        <linearGradient id="ed-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D882AC" />
          <stop offset="100%" stopColor="#B04878" />
        </linearGradient>
      </defs>
      <path d="M40 60 Q 100 0 160 60 Q 220 130 130 170 Q 60 200 50 140 Q 40 100 40 60 Z" fill="url(#ed-g)" />
      <path d="M70 80 Q 100 50 130 80 Q 160 130 110 150 Q 85 160 80 130" stroke="white" strokeOpacity="0.25" strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ── NEWSLETTER ── */
function NewsletterSection() {
  return (
    <section className="cs-newsletter cs-reveal">
      <span className="cs-eyebrow">Únete</span>
      <h2>Acceso temprano a colecciones íntimas.</h2>
      <p>
        Una carta al mes con guías, lanzamientos y un 10% en tu primer pedido.
        Sin spam, siempre discreto.
      </p>
      <form
        className="cs-newsletter-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <input type="email" placeholder="tu@correo.com" required />
        <button type="submit">Suscribirme</button>
      </form>
    </section>
  );
}

/* ── ICONS ── */
function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5h14v11H9l-4 3V5Z" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v5h5" />
    </svg>
  );
}

/* ── GRAPHQL ── */
const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    vendor
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      availableForSale
      title
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      image {
        id
        url
        altText
        width
        height
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
        vendor
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
