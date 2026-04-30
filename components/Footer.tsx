'use client'

import { useRouter } from 'next/navigation'

export default function Footer() {
  const router = useRouter()

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-logo">Redleaf</div>
          <p className="footer-tagline">
            Crafted clothing for people who value quality over quantity.
            Every piece is designed to last a decade, not a season.
          </p>
          <div className="footer-social">
            {['Ig','Tw','Fb','Pt'].map(s => (
              <button key={s} className="footer-social-btn">{s}</button>
            ))}
          </div>
        </div>
        {[
          { title: 'Shop',    links: ['New Arrivals','Outerwear','Tops','Bottoms','Knitwear','Sale'] },
          { title: 'Company', links: ['About Us','Sustainability','Careers','Press','Wholesale'] },
          { title: 'Support', links: ['FAQ','Shipping','Returns','Size Guide','Contact Us'] },
        ].map(col => (
          <div key={col.title}>
            <div className="footer-col-title">{col.title}</div>
            <div className="footer-links-list">
              {col.links.map(l => (
                <button
                  key={l}
                  className="footer-link"
                  onClick={() =>
                    l === 'Contact Us' ? router.push('/contact')
                    : l === 'About Us' ? router.push('/about')
                    : router.push('/shop')
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 Redleaf. All rights reserved.</div>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Preferences</a>
        </div>
      </div>
    </footer>
  )
}
