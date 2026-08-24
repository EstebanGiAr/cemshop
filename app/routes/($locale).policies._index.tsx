import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Políticas | CEMShop'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div>
      <section className="cs-policies-hero">
        <div className="cs-crumbs">
          <Link to="/">Inicio</Link>
          <span className="sep">/</span>
          <span className="current">Políticas</span>
        </div>
        <h1 className="cs-policies-title">
          Políticas de <em>la tienda</em>
        </h1>
        <p className="cs-policies-subtitle">
          Todo lo que necesitas saber sobre compras, envíos y privacidad en CEMShop.
        </p>
      </section>

      <section className="cs-section" style={{paddingTop: 0}}>
        <ul className="cs-policies-grid">
          {policies.map((policy, i) => (
            <li key={policy.id} className={`cs-reveal d${i + 1}`}>
              <Link to={`/policies/${policy.handle}`} className="cs-policy-card">
                <div className="cs-policy-card-icon">
                  <PolicyIcon handle={policy.handle} />
                </div>
                <div className="cs-policy-card-body">
                  <h2 className="cs-policy-card-title">{policy.title}</h2>
                  <p className="cs-policy-card-desc">
                    {getPolicyDescription(policy.handle)}
                  </p>
                </div>
                <span className="cs-policy-card-arrow">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function getPolicyDescription(handle: string): string {
  const map: Record<string, string> = {
    'privacy-policy': 'Cómo recopilamos, usamos y protegemos tu información personal.',
    'shipping-policy': 'Tiempos de entrega, costes de envío y seguimiento de pedidos.',
    'terms-of-service': 'Condiciones de uso de nuestra tienda y servicios.',
    'refund-policy': 'Proceso de devoluciones, cambios y reembolsos.',
    'subscription-policy': 'Gestión de suscripciones y renovaciones automáticas.',
  };
  return map[handle] ?? '';
}

function PolicyIcon({handle}: {handle: string}) {
  switch (handle) {
    case 'privacy-policy':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'shipping-policy':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case 'terms-of-service':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case 'refund-policy':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3" />
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      );
  }
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy { ...PolicyItem }
      shippingPolicy { ...PolicyItem }
      termsOfService { ...PolicyItem }
      refundPolicy { ...PolicyItem }
      subscriptionPolicy { id title handle }
    }
  }
` as const;
