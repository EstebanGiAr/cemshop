import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {Route} from './+types/wishlist';
import {useWishlist, type WishlistItem} from '~/lib/wishlist';
import {useVariantUrl} from '~/lib/variants';

export const meta: Route.MetaFunction = () => {
  return [{title: 'CEMShop | Favoritos'}];
};

export default function Wishlist() {
  const {items, remove} = useWishlist();

  return (
    <div>
      <section className="cs-catalog-hero">
        <div className="cs-crumbs">
          <Link to="/">Inicio</Link>
          <span className="sep">/</span>
          <span className="current">Favoritos</span>
        </div>

        <div className="cs-catalog-meta cs-reveal">
          <div>
            <h1 className="cs-catalog-title">
              Tus <em>favoritos</em>
            </h1>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0}}>
            <span style={{fontSize: 13, color: 'var(--text-muted)'}}>
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>
      </section>

      <section className="cs-section" style={{paddingTop: 28}}>
        {items.length === 0 ? (
          <div className="cs-search-empty">
            <p>Todavía no has guardado nada en favoritos.</p>
            <p className="cs-search-empty-hint">
              Toca el corazón en cualquier producto para guardarlo aquí.
            </p>
            <Link
              className="cs-btn cs-btn--primary"
              to="/collections/all"
              prefetch="intent"
              style={{marginTop: 16, display: 'inline-flex'}}
            >
              Explorar productos →
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={() => remove(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WishlistCard({
  item,
  onRemove,
}: {
  item: WishlistItem;
  onRemove: () => void;
}) {
  const variantUrl = useVariantUrl(item.handle);

  return (
    <Link className="cs-product cs-reveal" prefetch="intent" to={variantUrl}>
      <div className="cs-product-img">
        {item.image ? (
          <Image
            alt={item.image.altText || item.title}
            aspectRatio="4/5"
            data={item.image}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        ) : (
          <ProductPlaceholder />
        )}
        <button
          className="cs-product-heart"
          aria-label={`Quitar ${item.title} de favoritos`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
        >
          <HeartIcon filled />
        </button>
      </div>

      <div className="cs-product-meta">
        <div className="cs-product-cat">{item.vendor || 'Producto'}</div>
        <h3 className="cs-product-name">{item.title}</h3>
        <div className="cs-product-price">
          <span className="price">
            <Money data={item.price} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductPlaceholder() {
  return (
    <svg viewBox="0 0 200 240" style={{width: '60%', height: '60%', opacity: 0.3}}>
      <defs>
        <linearGradient id="wl-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDD0D8" />
          <stop offset="100%" stopColor="#C0B0BA" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="120" rx="56" ry="86" fill="url(#wl-grad)" />
    </svg>
  );
}

function HeartIcon({filled}: {filled?: boolean}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{color: filled ? 'var(--coral-600)' : 'var(--ink-900)'}}
    >
      <path d="M12 21s-7-4.5-9.5-9C1 9 3 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6 4 4.5 7-2.5 4.5-9.5 9-9.5 9Z" />
    </svg>
  );
}
