import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.policy.title ?? 'Política'} | CEMShop`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();

  return (
    <div>
      <section className="cs-policy-hero">
        <div className="cs-crumbs">
          <Link to="/">Inicio</Link>
          <span className="sep">/</span>
          <Link to="/policies">Políticas</Link>
          <span className="sep">/</span>
          <span className="current">{policy.title}</span>
        </div>
        <h1 className="cs-policy-title">{policy.title}</h1>
      </section>

      <div className="cs-policy-layout cs-reveal">
        <article
          className="cs-policy-prose"
          dangerouslySetInnerHTML={{__html: policy.body}}
        />
        <Link to="/policies" className="cs-policy-back">
          ← Volver a Políticas
        </Link>
      </div>
    </div>
  );
}

const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) { ...Policy }
      shippingPolicy @include(if: $shippingPolicy) { ...Policy }
      termsOfService @include(if: $termsOfService) { ...Policy }
      refundPolicy @include(if: $refundPolicy) { ...Policy }
    }
  }
` as const;
