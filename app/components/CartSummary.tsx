import type {CartLayout} from '~/components/CartMain';
import {Money, type OptimisticCart} from '@shopify/hydrogen';
import {useId} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const className =
    layout === 'page' ? 'cs-cart-summary cart-summary-page' : 'cart-summary-aside';

  if (layout === 'aside') {
    return (
      <div className={className}>
        <div className="cs-summary-row">
          <span>Subtotal</span>
          <span>
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart.cost.subtotalAmount} />
            ) : (
              '—'
            )}
          </span>
        </div>
        <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
      </div>
    );
  }

  return (
    <div className={className} aria-labelledby={summaryId}>
      <h3 id={summaryId}>Resumen</h3>

      <div className="cs-summary-row">
        <span>Subtotal</span>
        <span>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            '—'
          )}
        </span>
      </div>

      <div className="cs-summary-row">
        <span>Envío</span>
        <span style={{color: 'var(--coral-700)', fontWeight: 500}}>Gratis</span>
      </div>

      <div className="cs-summary-row total">
        <span>Total</span>
        <span>
          {cart?.cost?.totalAmount?.amount ? (
            <Money data={cart.cost.totalAmount} />
          ) : (
            '—'
          )}
        </span>
      </div>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />

      <div className="cs-payment-methods">
        <span>VISA</span>
        <span>·</span>
        <span>MASTERCARD</span>
        <span>·</span>
        <span>PAYPAL</span>
        <span>·</span>
        <span>KLARNA</span>
      </div>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <a href={checkoutUrl} target="_self" className="cs-checkout-btn">
      <LockIcon />
      Pagar de forma segura
      <ArrowIcon />
    </a>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
