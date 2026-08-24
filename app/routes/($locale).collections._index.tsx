import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div>
      <section className="cs-section">
        <div className="cs-section-head">
          <div className="copy">
            <span className="cs-eyebrow">Tienda</span>
            <h1 style={{fontSize: 56}}>Todas las <em style={{fontStyle: 'italic', color: 'var(--coral-600)'}}>colecciones</em></h1>
          </div>
        </div>
        <PaginatedResourceSection<CollectionFragment>
          connection={collections}
          resourcesClassName="cs-grid-4"
        >
          {({node: collection, index}) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              index={index}
            />
          )}
        </PaginatedResourceSection>
      </section>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  const bgs = ['var(--cream-200)', 'var(--coral-tint)', 'var(--cream-200)', 'var(--ink-900)'];
  const bg = bgs[index % bgs.length];
  return (
    <Link
      className="cs-cat"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      style={{background: bg}}
    >
      {collection?.image && (
        <>
          <Image
            alt={collection.image.altText || collection.title}
            data={collection.image}
            loading={index < 4 ? 'eager' : undefined}
            sizes="(min-width: 45em) 25vw, 50vw"
            className="cs-cat-img"
          />
          <div className="cs-cat-overlay" />
        </>
      )}
      <div className="cs-cat-label">
        <span>{collection.title}</span>
        <span className="cs-cat-arrow">↗</span>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
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
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
