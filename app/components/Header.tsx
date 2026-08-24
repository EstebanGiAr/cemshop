import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useWishlist} from '~/lib/wishlist';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Promotional topbar */}
      <div className="cs-topbar">
        <span>Envío discreto en 24h</span>
        <strong>·</strong>
        <span>Devoluciones gratis</span>
        <strong>·</strong>
        <span>Atención 24/7</span>
      </div>

      {/* Main header */}
      <header className={`cs-header${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <NavLink prefetch="intent" to="/" className="cs-logo" end>
          cemshop<span className="dot">.</span>
        </NavLink>

        {/* Desktop nav */}
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />

        {/* CTA icons */}
        <div className="cs-header-tools">
          <HeaderMenuMobileToggle />
          <SearchToggle />
          <AccountLink isLoggedIn={isLoggedIn} />
          <WishlistLink />
          <CartToggle cart={cart} />
        </div>
      </header>
    </>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const className = viewport === 'desktop' ? 'cs-nav header-menu-desktop' : 'header-menu-mobile';

  const fallbackItems = FALLBACK_HEADER_MENU.items;
  const items = (menu || FALLBACK_HEADER_MENU).items;

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink end onClick={close} prefetch="intent" to="/">
          Inicio
        </NavLink>
      )}
      {items.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            key={item.id}
            end
            onClick={close}
            prefetch="intent"
            to={url}
            className={({isActive}) => (isActive ? 'active' : undefined)}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="cs-icon-btn header-menu-mobile-toggle"
      onClick={() => open('mobile')}
      aria-label="Menú"
    >
      <MenuIcon />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="cs-icon-btn"
      onClick={() => open('search')}
      aria-label="Buscar"
    >
      <SearchIcon />
    </button>
  );
}

function AccountLink({isLoggedIn}: {isLoggedIn: Promise<boolean>}) {
  return (
    <NavLink prefetch="intent" to="/account" className="cs-icon-btn" aria-label="Cuenta">
      <UserIcon />
    </NavLink>
  );
}

function WishlistLink() {
  const {items} = useWishlist();
  return (
    <NavLink prefetch="intent" to="/wishlist" className="cs-icon-btn" aria-label="Favoritos">
      <HeartIcon />
      {items.length > 0 && <span className="badge">{items.length}</span>}
    </NavLink>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="cs-icon-btn"
      aria-label={`Bolsa (${count} artículos)`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <BagIcon />
      {count > 0 && <span className="badge">{count}</span>}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/* ── SVG icons ── */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-4.5-9.5-9C1 9 3 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6 4 4.5 7-2.5 4.5-9.5 9-9.5 9Z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {id: '1', resourceId: null, tags: [], title: 'Inicio', type: 'HTTP', url: '/', items: []},
    {id: '2', resourceId: null, tags: [], title: 'Colecciones', type: 'HTTP', url: '/collections', items: []},
    {id: '3', resourceId: null, tags: [], title: 'Novedades', type: 'HTTP', url: '/collections/all', items: []},
  ],
};
