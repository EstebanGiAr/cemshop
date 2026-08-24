import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense fallback={<FooterContent links={[]} />}>
      <Await resolve={footerPromise}>
        {(footer) => {
          const items = footer?.menu?.items ?? [];
          const links = items
            .filter((item) => !!item.url)
            .map((item) => {
              const url =
                item.url!.includes('myshopify.com') ||
                item.url!.includes(publicStoreDomain) ||
                item.url!.includes(header.shop.primaryDomain.url)
                  ? new URL(item.url!).pathname
                  : item.url!;
              return {id: item.id, title: item.title, url};
            });
          return <FooterContent links={links} />;
        }}
      </Await>
    </Suspense>
  );
}

function FooterContent({links}: {links: Array<{id: string; title: string; url: string}>}) {
  return (
    <footer className="cs-footer">
      <div className="cs-footer-grid">
        {/* Brand */}
        <div>
          <span className="cs-footer-logo">cemshop<span style={{color: 'var(--coral-400)'}}>.</span></span>
          <p className="cs-footer-desc">
            Placer íntimo, diseño honesto. Productos de alta calidad para explorar tu sensualidad con confianza y discreción.
          </p>
          <div className="cs-footer-social">
            {['IG', 'TT', 'PT', 'YT'].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>

        {/* Tienda */}
        <div>
          <h4>Tienda</h4>
          <NavLink to="/collections/all" prefetch="intent">Novedades</NavLink>
          <NavLink to="/collections" prefetch="intent">Colecciones</NavLink>
          <NavLink to="/collections/all" prefetch="intent">Más vendidos</NavLink>
          <NavLink to="/collections/all" prefetch="intent">Ofertas</NavLink>
        </div>

        {/* Ayuda */}
        <div>
          <h4>Ayuda</h4>
          <NavLink to="/policies/shipping-policy" prefetch="intent">Envíos</NavLink>
          <NavLink to="/policies/refund-policy" prefetch="intent">Devoluciones</NavLink>
          <NavLink to="/policies/privacy-policy" prefetch="intent">Privacidad</NavLink>
          <NavLink to="/pages/contact" prefetch="intent">Contacto</NavLink>
        </div>

        {/* Legal */}
        <div>
          <h4>Legal</h4>
          <NavLink to="/policies/terms-of-service" prefetch="intent">Términos</NavLink>
          <NavLink to="/policies/privacy-policy" prefetch="intent">Cookies</NavLink>
          {links.map((link) => (
            <NavLink key={link.id} to={link.url} prefetch="intent">{link.title}</NavLink>
          ))}
        </div>
      </div>

      <div className="cs-footer-bottom">
        <div>© 2026 CEMShop. Discreto, siempre.</div>
        <div className="cs-footer-payments">
          <span>VISA</span>
          <span>MASTERCARD</span>
          <span>PAYPAL</span>
          <span>APPLE PAY</span>
        </div>
      </div>
    </footer>
  );
}
