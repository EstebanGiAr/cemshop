import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) return null;
  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) return null;

  return (
    <section className="cs-search-section">
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => (
          <>
            <div className="cs-search-pager">
              <PreviousLink>
                {isLoading ? 'Cargando…' : '↑ Anteriores'}
              </PreviousLink>
            </div>

            <ul className="products-grid" style={{listStyle: 'none', padding: 0, margin: 0}}>
              {nodes.map((product) => {
                const productUrl = urlWithTrackingParams({
                  baseUrl: `/products/${product.handle}`,
                  trackingParams: product.trackingParameters,
                  term,
                });
                const price = product?.selectedOrFirstAvailableVariant?.price;
                const compareAt = product?.selectedOrFirstAvailableVariant?.compareAtPrice;
                const image = product?.selectedOrFirstAvailableVariant?.image;

                return (
                  <li key={product.id}>
                    <Link className="cs-product" prefetch="intent" to={productUrl}>
                      <div className="cs-product-img">
                        {image ? (
                          <Image
                            data={image}
                            alt={product.title}
                            aspectRatio="4/5"
                            sizes="(min-width: 45em) 300px, 50vw"
                          />
                        ) : (
                          <SearchProductPlaceholder />
                        )}
                      </div>
                      <div className="cs-product-meta">
                        {product.vendor && (
                          <div className="cs-product-cat">{product.vendor}</div>
                        )}
                        <h3 className="cs-product-name">{product.title}</h3>
                        <div className="cs-product-price">
                          {price && (
                            <span className="price">
                              <Money data={price} />
                            </span>
                          )}
                          {compareAt && compareAt.amount !== price?.amount && (
                            <span className="was">
                              <Money data={compareAt} />
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="cs-search-pager">
              <NextLink>
                {isLoading ? 'Cargando…' : 'Ver más ↓'}
              </NextLink>
            </div>
          </>
        )}
      </Pagination>
    </section>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) return null;

  return (
    <section className="cs-search-section cs-search-section--list">
      <h2 className="cs-search-section-title">Páginas</h2>
      <ul className="cs-search-list">
        {pages.nodes.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });
          return (
            <li key={page.id}>
              <Link prefetch="intent" to={pageUrl} className="cs-search-list-link">
                {page.title}
                <span className="cs-search-list-arrow">→</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) return null;

  return (
    <section className="cs-search-section cs-search-section--list">
      <h2 className="cs-search-section-title">Artículos</h2>
      <ul className="cs-search-list">
        {articles.nodes.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });
          return (
            <li key={article.id}>
              <Link prefetch="intent" to={articleUrl} className="cs-search-list-link">
                {article.title}
                <span className="cs-search-list-arrow">→</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SearchResultsEmpty({term}: {term?: string}) {
  if (!term) {
    return (
      <div className="cs-search-empty">
        <p>Escribe algo para comenzar a buscar.</p>
      </div>
    );
  }
  return (
    <div className="cs-search-empty">
      <p>
        Sin resultados para <strong>"{term}"</strong>.
      </p>
      <p className="cs-search-empty-hint">
        Prueba con otra palabra o revisa la ortografía.
      </p>
    </div>
  );
}

function SearchProductPlaceholder() {
  return (
    <svg viewBox="0 0 200 240" style={{width: '60%', height: '60%', opacity: 0.25}}>
      <defs>
        <linearGradient id="sp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDD0D8" />
          <stop offset="100%" stopColor="#C0B0BA" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="120" rx="56" ry="86" fill="url(#sp-grad)" />
    </svg>
  );
}
