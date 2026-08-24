import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {Money, getPaginationVariables, flattenConnection} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'CEMShop | Mis Pedidos'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div>
      <div className="cs-account-page-header">
        <span className="cs-eyebrow">Cuenta</span>
        <h2>Mis pedidos</h2>
      </div>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite">
      {orders?.nodes.length ? (
        <div className="cs-orders-list">
          <PaginatedResourceSection connection={orders}>
            {({node: order}) => <OrderItem key={order.id} order={order} />}
          </PaginatedResourceSection>
        </div>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="cs-orders-empty">
      <EmptyBagIcon />
      {hasFilters ? (
        <>
          <h3>Sin resultados</h3>
          <p>No encontramos pedidos con ese filtro.</p>
          <Link to="/account/orders" className="cs-btn cs-btn--ghost">
            Limpiar filtros
          </Link>
        </>
      ) : (
        <>
          <h3>Aún no tienes pedidos</h3>
          <p>Cuando realices tu primera compra aparecerá aquí.</p>
          <Link to="/collections" className="cs-btn cs-btn--primary">
            Explorar productos →
          </Link>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="cs-order-search"
      aria-label="Filtrar pedidos"
    >
      <div className="cs-order-search-title">Buscar pedido</div>
      <div className="cs-order-search-inputs">
        <div className="cs-field">
          <label htmlFor="order-name">Número de pedido</label>
          <input
            id="order-name"
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="ej: 1001"
            aria-label="Número de pedido"
            defaultValue={currentFilters.name || ''}
          />
        </div>
        <div className="cs-field">
          <label htmlFor="order-confirmation">Confirmación</label>
          <input
            id="order-confirmation"
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="ej: ABC123"
            aria-label="Número de confirmación"
            defaultValue={currentFilters.confirmationNumber || ''}
          />
        </div>
        <div style={{display: 'flex', gap: 10, alignItems: 'flex-end', paddingBottom: 0}}>
          <button
            type="submit"
            disabled={isSearching}
            className="cs-btn cs-btn--primary"
            style={{height: 46}}
          >
            {isSearching ? 'Buscando…' : 'Buscar'}
          </button>
          {hasFilters && (
            <button
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
              className="cs-btn cs-btn--ghost"
              style={{height: 46}}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;

  return (
    <Link
      to={`/account/orders/${btoa(order.id)}`}
      className="cs-order-card"
    >
      <div>
        <div className="cs-order-number">Pedido #{order.number}</div>
        <div className="cs-order-date">
          {new Date(order.processedAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        {order.confirmationNumber && (
          <div className="cs-order-confirmation">
            Confirmación: {order.confirmationNumber}
          </div>
        )}
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
