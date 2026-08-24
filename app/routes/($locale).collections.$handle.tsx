import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `CEMShop | ${data?.collection.title ?? ''}`}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 9});

  if (!handle) throw redirect('/collections');

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});
  return {collection};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const productCount = collection.products.nodes.length;

  return (
    <div>
      {/* Page hero */}
      <section className="cs-catalog-hero">
        <div className="cs-crumbs">
          <Link to="/">Inicio</Link>
          <span className="sep">/</span>
          <Link to="/collections">Colecciones</Link>
          <span className="sep">/</span>
          <span className="current">{collection.title}</span>
        </div>

        <div className="cs-catalog-meta cs-reveal">
          <div>
            <h1 className="cs-catalog-title">
              {collection.title.split(' ').length > 1 ? (
                <>
                  {collection.title.split(' ').slice(0, -1).join(' ')}{' '}
                  <em>{collection.title.split(' ').slice(-1)[0]}</em>
                </>
              ) : (
                <em>{collection.title}</em>
              )}
            </h1>
            {collection.description && (
              <p className="collection-description">{collection.description}</p>
            )}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0}}>
            <span style={{fontSize: 13, color: 'var(--text-muted)'}}>
              {productCount} {productCount === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="cs-section" style={{paddingTop: 28}}>
        <PaginatedResourceSection<ProductItemFragment>
          connection={collection.products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 9 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      </section>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    vendor
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
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
        ...MoneyProductItem
      }
      compareAtPrice {
        ...MoneyProductItem
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
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
