import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <PreviousLink>
              {isLoading ? (
                <span className="cs-btn cs-btn--ghost" style={{display: 'inline-flex', marginBottom: 24}}>Cargando…</span>
              ) : (
                <span className="cs-btn cs-btn--ghost" style={{display: 'inline-flex', marginBottom: 24}}>
                  ↑ Cargar anteriores
                </span>
              )}
            </PreviousLink>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}
            <NextLink>
              {isLoading ? (
                <span className="cs-btn cs-btn--ghost" style={{display: 'inline-flex', marginTop: 36}}>Cargando…</span>
              ) : (
                <span className="cs-btn cs-btn--ghost" style={{display: 'inline-flex', marginTop: 36}}>
                  Cargar más ↓
                </span>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
