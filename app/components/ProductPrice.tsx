import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return (
    <div aria-label="Precio" role="group" style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
      {compareAtPrice ? (
        <>
          {price ? (
            <span style={{fontWeight: 600, fontSize: 15, color: 'var(--coral-700)'}}>
              <Money data={price} />
            </span>
          ) : null}
          <span style={{textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 12}}>
            <Money data={compareAtPrice} />
          </span>
        </>
      ) : price ? (
        <span style={{fontWeight: 600, fontSize: 15, color: 'var(--coral-700)'}}>
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
