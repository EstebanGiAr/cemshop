import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const childMap = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(childMap)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  const lineItems = (cart?.lines?.nodes ?? []).map((line) => {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      return null;
    }
    return (
      <CartLineItem
        key={line.id}
        line={line}
        layout={layout}
        childrenMap={childrenMap}
      />
    );
  });

  return (
    <section
      className={`cart-main${withDiscount ? ' with-discount' : ''}`}
      aria-label={layout === 'page' ? 'Página del carrito' : 'Carrito'}
    >
      <CartEmpty hidden={linesCount} layout={layout} />

      {layout === 'page' ? (
        cartHasItems && (
          <div className="cs-cart-page-layout">
            <ul
              aria-label="Artículos en el carrito"
              style={{listStyle: 'none', margin: 0, padding: 0}}
            >
              {lineItems}
            </ul>
            <CartSummary cart={cart} layout={layout} />
          </div>
        )
      ) : (
        <>
          <ul
            className="cart-details"
            aria-label="Artículos en el carrito"
            style={{listStyle: 'none', margin: 0, padding: 0}}
          >
            {lineItems}
          </ul>
          {cartHasItems && <CartSummary cart={cart} layout={layout} />}
        </>
      )}
    </section>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden} className="cs-cart-empty">
      <BagIcon />
      <h3>Tu bolsa está vacía</h3>
      <p>¿No sabes por dónde empezar? Descubre nuestra selección.</p>
      <Link
        to="/collections/all"
        onClick={close}
        prefetch="viewport"
        className="cs-btn cs-btn--primary"
        style={{marginTop: 8}}
      >
        Explorar productos →
      </Link>
    </div>
  );
}

function BagIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--border)"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}
