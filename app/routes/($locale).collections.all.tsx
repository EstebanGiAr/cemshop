import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections.all';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: `CEMShop | Todo el catálogo`}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 9});

  const [{products}] = await Promise.all([
    context.storefront.query(CATALOG_QUERY, {
      variables: paginationVariables,
    }),
  ]);

  return {products};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function AllProducts() {
  const {products} = useLoaderData<typeof loader>();
  const productCount = products.nodes.length;

  return (
    <div>
      <section className="cs-catalog-hero">
        <div className="cs-crumbs">
          <Link to="/">Inicio</Link>
          <span className="sep">/</span>
          <Link to="/collections">Colecciones</Link>
          <span className="sep">/</span>
          <span className="current">Todo</span>
        </div>

        <div className="cs-catalog-meta cs-reveal">
          <div>
            <h1 className="cs-catalog-title">
              Todo el <em>catálogo</em>
            </h1>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0}}>
            <span style={{fontSize: 13, color: 'var(--text-muted)'}}>
              {productCount} {productCount === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>
      </section>

      <section className="cs-section" style={{paddingTop: 28}}>
        <PaginatedResourceSection<ProductItemFragment>
          connection={products}
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
            id: 'all-products',
            handle: 'all',
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

const CATALOG_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
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
` as const;
