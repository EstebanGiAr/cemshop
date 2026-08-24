import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Image,
  Money,
} from '@shopify/hydrogen';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `CEMShop | ${data?.product.title ?? ''}`},
    {rel: 'canonical', href: `/products/${data?.product.handle}`},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});

  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product};
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, vendor} = product;
  const image = selectedVariant?.image;
  const hasComparePrice =
    selectedVariant?.compareAtPrice &&
    selectedVariant.compareAtPrice.amount !== selectedVariant.price.amount;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="cs-pdp-breadcrumb">
        <div className="cs-crumbs">
          <Link to="/">Inicio</Link>
          <span className="sep">/</span>
          <Link to="/collections/all">Productos</Link>
          <span className="sep">/</span>
          <span className="current">{title}</span>
        </div>
      </div>

      {/* PDP Grid */}
      <section className="cs-pdp">
        {/* Gallery */}
        <div>
          <div className="cs-gallery-main">
            {image ? (
              <Image
                data={image}
                alt={image.altText || title}
                sizes="(min-width: 45em) 50vw, 100vw"
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            ) : (
              <ProductSilhouette />
            )}
            {hasComparePrice && (
              <span className="cs-tag-soft" style={{position: 'absolute', top: 18, left: 18}}>
                OFERTA
              </span>
            )}
          </div>
          {/* Additional images from product.images would go here */}
        </div>

        {/* Product Info */}
        <div className="cs-pdp-info cs-reveal">
          {vendor && <span className="cs-eyebrow">{vendor}</span>}
          <h1>{title}</h1>

          <div className="cs-rating">
            <span className="stars">★★★★★</span>
            <span>4.9 · 312 reseñas</span>
            <span style={{marginLeft: 10}}>· en stock</span>
          </div>

          {/* Price */}
          <div className="cs-price-row">
            <span className="now">
              <Money data={selectedVariant.price} />
            </span>
            {hasComparePrice && (
              <>
                <span className="was">
                  <Money data={selectedVariant.compareAtPrice!} />
                </span>
                <span className="save">Oferta</span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.description && (
            <p className="cs-pdp-desc">
              {product.description.slice(0, 200)}
              {product.description.length > 200 ? '…' : ''}
            </p>
          )}

          {/* Product form (variants + add to cart) */}
          <ProductForm
            product={product}
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

          {/* Trust features */}
          <div className="cs-pdp-feats">
            <div className="cs-pdp-feat">
              <span className="feat-icon"><ShieldIcon /></span>
              <div><strong>Envío 100% discreto</strong><span>Caja neutra, sin logo</span></div>
            </div>
            <div className="cs-pdp-feat">
              <span className="feat-icon"><TruckIcon /></span>
              <div><strong>Recíbelo mañana</strong><span>Pidiendo antes de las 16h</span></div>
            </div>
            <div className="cs-pdp-feat">
              <span className="feat-icon"><ReturnIcon /></span>
              <div><strong>30 días para cambiar</strong><span>Sin preguntas</span></div>
            </div>
            <div className="cs-pdp-feat">
              <span className="feat-icon"><LockIcon /></span>
              <div><strong>Garantía 2 años</strong><span>Cobertura completa</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Description tabs */}
      <section className="cs-pdp-tabs">
        <div className="cs-tab-list">
          {['Descripción', 'Especificaciones', 'Reseñas (312)'].map((t, i) => (
            <button
              key={t}
              className={`cs-tab-btn${i === 0 ? ' active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="cs-tab-content active">
          <div
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
            style={{color: 'var(--text-soft)', fontSize: 14.5, lineHeight: 1.65, maxWidth: 680}}
          />
        </div>
      </section>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/* ── Placeholders ── */
function ProductSilhouette() {
  return (
    <svg viewBox="0 0 200 240" style={{width: '55%', height: '55%', opacity: 0.4}}>
      <defs>
        <linearGradient id="pdp-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D882AC" />
          <stop offset="100%" stopColor="#B04878" />
        </linearGradient>
      </defs>
      <rect x="78" y="34" width="44" height="178" rx="22" fill="url(#pdp-g)" />
      <rect x="86" y="50" width="10" height="40" rx="5" fill="white" opacity="0.35" />
      <circle cx="100" cy="206" r="14" fill="#B04878" opacity="0.6" />
    </svg>
  );
}

/* ── Icons ── */
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v5h5" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* ── GraphQL ── */
const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
