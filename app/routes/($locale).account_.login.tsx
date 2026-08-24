import type {Route} from './+types/account_.login';

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const acrValues = url.searchParams.get('acr_values') || undefined;
  const loginHint = url.searchParams.get('login_hint') || undefined;
  const loginHintMode = url.searchParams.get('login_hint_mode') || undefined;
  const locale = url.searchParams.get('locale') || undefined;

  return context.customerAccount.login({
    countryCode: context.storefront.i18n.country,
    acrValues,
    loginHint,
    loginHintMode,
    locale,
  });
}

export default function Login() {
  return (
    <div className="cs-login-redirect">
      <span className="cs-logo">
        CEMShop<span className="dot">.</span>
      </span>
      <div className="cs-spinner" aria-label="Cargando…" />
      <p>Accediendo a tu cuenta…</p>
    </div>
  );
}
