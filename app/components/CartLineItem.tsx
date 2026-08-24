import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <li key={id} className="cart-line">
      <div className="cart-line-inner">
        <div className="cart-line-img">
          {image ? (
            <Image
              alt={title}
              aspectRatio="4/5"
              data={image}
              height={112}
              loading="lazy"
              width={90}
            />
          ) : (
            <CartLinePlaceholder />
          )}
        </div>

        <div className="cart-line-info" style={{flex: 1}}>
          <div className="cart-line-cat">{product.vendor || 'Producto'}</div>
          <Link
            prefetch="intent"
            to={lineItemUrl}
            className="cart-line-name"
            onClick={() => {
              if (layout === 'aside') close();
            }}
          >
            {product.title}
          </Link>
          <div className="cart-line-opts">
            {selectedOptions
              .filter((opt) => opt.value !== 'Default Title')
              .map((opt) => `${opt.name}: ${opt.value}`)
              .join(' · ')}
          </div>

          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 12}}>
            <CartLineQuantity line={line} />
            <div style={{fontWeight: 600, fontSize: 15, color: 'var(--ink-900)'}}>
              <ProductPrice price={line?.cost?.totalAmount} />
            </div>
          </div>

          <div className="cart-line-actions" style={{marginTop: 8}}>
            <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
          </div>
        </div>
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            Artículos con {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="cart-line-children">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Reducir cantidad"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          −
        </button>
      </CartLineUpdateButton>
      <span className="cart-line-qty-val">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Aumentar cantidad"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          +
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button disabled={disabled} type="submit" className="remove">
        Eliminar
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function CartLinePlaceholder() {
  return (
    <svg viewBox="0 0 200 240" style={{width: '65%', height: '65%', opacity: 0.3}}>
      <defs>
        <linearGradient id="cl-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D882AC" />
          <stop offset="100%" stopColor="#B04878" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="120" rx="56" ry="86" fill="url(#cl-g)" />
    </svg>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
