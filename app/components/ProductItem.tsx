import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {useWishlist} from '~/lib/wishlist';

export function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const {open} = useAside();
  const variant = product.selectedOrFirstAvailableVariant;
  const {has, toggle} = useWishlist();
  const vendor = 'vendor' in product && typeof product.vendor === 'string' ? product.vendor : undefined;
  const inWishlist = has(product.id);

  return (
    <Link className="cs-product cs-reveal" prefetch="intent" to={variantUrl}>
      <div className="cs-product-img">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="4/5"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        ) : (
          <ProductPlaceholder />
        )}
        <button
          className="cs-product-heart"
          aria-label={inWishlist ? `Quitar ${product.title} de favoritos` : `Agregar ${product.title} a favoritos`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle({
              id: product.id,
              handle: product.handle,
              title: product.title,
              vendor,
              image: product.featuredImage,
              price: product.priceRange.minVariantPrice,
            });
          }}
        >
          <HeartIcon filled={inWishlist} />
        </button>
        {variant && (
          <AddToCartButton
            disabled={!variant.availableForSale}
            lines={[{merchandiseId: variant.id, quantity: 1, selectedVariant: variant}]}
            onClick={(e) => {
              e.stopPropagation();
              open('cart');
            }}
          >
            <span className="cs-product-quick">
              <BagIcon />
              {variant.availableForSale ? 'Agregar a la bolsa' : 'Agotado'}
            </span>
          </AddToCartButton>
        )}
      </div>

      <div className="cs-product-meta">
        <div className="cs-product-cat">{vendor || 'Producto'}</div>
        <h3 className="cs-product-name">{product.title}</h3>
        <div className="cs-product-price">
          <span className="price">
            <Money data={product.priceRange.minVariantPrice} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductPlaceholder() {
  return (
    <svg
      viewBox="0 0 200 240"
      style={{width: '60%', height: '60%', opacity: 0.3}}
    >
      <defs>
        <linearGradient id="ph-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDD0D8" />
          <stop offset="100%" stopColor="#C0B0BA" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="120" rx="56" ry="86" fill="url(#ph-grad)" />
      <ellipse cx="84" cy="92" rx="14" ry="20" fill="white" opacity="0.4" />
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

function BagIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}
