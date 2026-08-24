import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {useWishlist} from '~/lib/wishlist';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  product,
  productOptions,
  selectedVariant,
}: {
  product: Pick<ProductFragment, 'id' | 'handle' | 'title' | 'vendor'>;
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const {has, toggle} = useWishlist();
  const inWishlist = has(product.id);

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5>{option.name}</h5>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const style = {
                  border: selected
                    ? '2px solid var(--ink-900)'
                    : '2px solid var(--border)',
                  opacity: available ? 1 : 0.3,
                  background: selected ? 'var(--ink-900)' : 'var(--surface)',
                  color: selected ? 'var(--cream-50)' : 'var(--text-soft)',
                };

                if (isDifferentProduct) {
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={style}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      className={`product-options-item${exists && !selected ? ' link' : ''}`}
                      key={option.name + name}
                      style={style}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      <div className="cs-pdp-actions">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => open('cart')}
          lines={
            selectedVariant
              ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}]
              : []
          }
        >
          <span className="cs-add-to-cart">
            <BagIcon />
            {selectedVariant?.availableForSale ? 'Agregar a la bolsa' : 'Agotado'}
          </span>
        </AddToCartButton>

        <button
          type="button"
          className="cs-icon-btn"
          aria-label={inWishlist ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          style={{width: 50, height: 50, border: '1px solid var(--border)', borderRadius: '999px', flexShrink: 0}}
          onClick={() =>
            toggle({
              id: product.id,
              handle: product.handle,
              title: product.title,
              vendor: product.vendor,
              image: selectedVariant?.image,
              price: selectedVariant?.price ?? {amount: '0', currencyCode: 'USD' as const},
            })
          }
        >
          <HeartIcon filled={inWishlist} />
        </button>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <>{name}</>;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function HeartIcon({filled}: {filled?: boolean}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{color: filled ? 'var(--coral-600)' : 'currentColor'}}
    >
      <path d="M12 21s-7-4.5-9.5-9C1 9 3 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6 4 4.5 7-2.5 4.5-9.5 9-9.5 9Z" />
    </svg>
  );
}
