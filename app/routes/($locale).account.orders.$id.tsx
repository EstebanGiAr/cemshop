import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `CEMShop | Pedido ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;
  const lineItems = order.lineItems.nodes;
  const discountApplications = order.discountApplications.nodes;
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? null;
  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<typeof firstDiscount, {__typename: 'MoneyV2'}>)
      : null;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage, fulfillmentStatus} =
    useLoaderData<typeof loader>();

  return (
    <div className="cs-order-detail">
      <div className="cs-order-detail-header">
        <Link
          to="/account/orders"
          className="cs-eyebrow"
          style={{textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12}}
        >
          ← Mis pedidos
        </Link>
        <h2>{order.name}</h2>
        <div className="cs-order-detail-meta">
          <span>
            {new Date(order.processedAt!).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {order.confirmationNumber && (
            <span>Confirmación: {order.confirmationNumber}</span>
          )}
          {order.fulfillmentStatus && (
            <span className="cs-tag-soft">{order.fulfillmentStatus}</span>
          )}
          {fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus && (
            <span className="cs-tag-soft">{fulfillmentStatus}</span>
          )}
        </div>
      </div>

      <table className="cs-order-table">
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Precio</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((lineItem, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <OrderLineRow key={i} lineItem={lineItem} />
          ))}
        </tbody>
        <tfoot>
          {((discountValue && discountValue.amount) || discountPercentage) && (
            <tr>
              <td colSpan={3} style={{color: 'var(--text-muted)'}}>
                Descuento
              </td>
              <td style={{color: 'var(--coral-700)', fontWeight: 500}}>
                {discountPercentage ? (
                  <span>-{discountPercentage}%</span>
                ) : (
                  discountValue && <Money data={discountValue!} />
                )}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={3} style={{color: 'var(--text-muted)'}}>
              Subtotal
            </td>
            <td>
              <Money data={order.subtotal!} />
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{color: 'var(--text-muted)'}}>
              Impuestos
            </td>
            <td>
              <Money data={order.totalTax!} />
            </td>
          </tr>
          <tr className="total-row">
            <td colSpan={3}>Total</td>
            <td>
              <Money data={order.totalPrice!} />
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="cs-order-info-grid">
        <div className="cs-order-info-card">
          <h4>Dirección de envío</h4>
          {order?.shippingAddress ? (
            <address>
              {order.shippingAddress.name && (
                <div style={{fontWeight: 500, marginBottom: 4}}>
                  {order.shippingAddress.name}
                </div>
              )}
              {order.shippingAddress.formatted && (
                <div>{order.shippingAddress.formatted}</div>
              )}
              {order.shippingAddress.formattedArea && (
                <div>{order.shippingAddress.formattedArea}</div>
              )}
            </address>
          ) : (
            <p style={{color: 'var(--text-muted)', fontSize: 13}}>
              Sin dirección de envío
            </p>
          )}
        </div>

        <div className="cs-order-info-card">
          <h4>Estado del pedido</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {fulfillmentStatus && (
              <div>
                <div className="cs-order-confirmation" style={{marginBottom: 4}}>
                  Fulfillment
                </div>
                <span className="cs-tag-soft">{fulfillmentStatus}</span>
              </div>
            )}
            <a
              href={order.statusPageUrl}
              target="_blank"
              rel="noreferrer"
              className="cs-btn cs-btn--ghost"
              style={{marginTop: 8, width: 'fit-content'}}
            >
              Ver estado en Shopify →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <tr>
      <td>
        <div className="cs-order-line-product">
          {lineItem?.image && (
            <div className="cs-order-line-img">
              <Image data={lineItem.image} width={60} height={60} />
            </div>
          )}
          <div>
            <div className="cs-order-line-name">{lineItem.title}</div>
            {lineItem.variantTitle && lineItem.variantTitle !== 'Default Title' && (
              <div className="cs-order-line-variant">{lineItem.variantTitle}</div>
            )}
          </div>
        </div>
      </td>
      <td>
        <Money data={lineItem.price!} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <Money data={lineItem.totalDiscount!} />
      </td>
    </tr>
  );
}
