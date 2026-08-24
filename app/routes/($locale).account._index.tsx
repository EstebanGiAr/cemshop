import {Link, useLoaderData} from 'react-router';
import {Money, flattenConnection} from '@shopify/hydrogen';
import type {Route} from './+types/account._index';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {OrderItemFragment} from 'customer-accountapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: 'CEMShop | Mi Cuenta'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  await customerAccount.handleAuthStatus();

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      first: 5,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('No se pudieron cargar los pedidos');
  }

  return {orders: data.customer.orders.nodes};
}

export default function AccountOverview() {
  const {orders} = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="cs-account-page-header">
        <span className="cs-eyebrow">Cuenta</span>
        <h2>Mis pedidos recientes</h2>
      </div>

      {orders.length === 0 ? (
        <div className="cs-orders-empty">
          <EmptyBagIcon />
          <h3>Aún no tienes pedidos</h3>
          <p>Cuando realices tu primera compra aparecerá aquí.</p>
          <Link to="/collections" className="cs-btn cs-btn--primary">
            Explorar productos →
          </Link>
        </div>
      ) : (
        <>
          <div className="cs-orders-list">
            {orders.map((order: OrderItemFragment) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
          <div style={{marginTop: 20}}>
            <Link to="/account/orders" className="cs-btn cs-btn--ghost">
              Ver todos los pedidos →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function OrderRow({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;

  return (
    <Link to={`/account/orders/${btoa(order.id)}`} className="cs-order-card">
      <div>
        <div className="cs-order-number">Pedido #{order.number}</div>
        <div className="cs-order-date">
          {new Date(order.processedAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <div className="cs-order-status">
          {order.financialStatus && (
            <span className="cs-tag-soft">{order.financialStatus}</span>
          )}
          {fulfillmentStatus && (
            <span className="cs-tag-soft">{fulfillmentStatus}</span>
          )}
        </div>
      </div>
      <div className="cs-order-total">
        <div className="cs-order-total-amount">
          <Money data={order.totalPrice} />
        </div>
        <span className="cs-order-view-link">Ver pedido →</span>
      </div>
    </Link>
  );
}

function EmptyBagIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--border)"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{marginBottom: 8}}
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
    </svg>
  );
}
