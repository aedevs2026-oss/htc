import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, MapPin, Gem, SlidersHorizontal, Headset } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CatalogCategoryCard } from "@/components/catalog-category-card";
import { ProductCard } from "@/components/product-card";
import { DealerCta } from "@/components/dealer-cta";
import { getCatalog } from "@/lib/catalog";
import { getFeaturedProducts, getHomeCategories } from "@/lib/catalog-helpers";
import { getSiteConfig } from "@/lib/site-config";

const rooms = [
  { title: "Living Room", image: "living-room-hero", desc: "A warmer welcome home", href: "/furniture?category=sofa" },
  { title: "Bedroom", image: "bedroom", desc: "Your everyday retreat", href: "/furniture?category=bedroom" },
  { title: "Dining Room", image: "dining-room", desc: "Make moments together", href: "/furniture?category=dining" },
  { title: "Home Office", image: "home-office", desc: "Work beautifully", href: "/furniture?category=office-furniture" },
  { title: "Outdoor Living", image: "outdoor-living", desc: "Slow down outside", href: "/furniture" }
];

const brands = [{ name: "NATUZZI", src: "natuzzi.svg" }, { name: "calligaris", src: "calligaris.svg" }, { name: "Stressless", src: "stressless.svg" }, { name: "himolla", src: "himolla.svg" }, { name: "KOINOR", src: "koinor.svg" }, { name: "ROLF BENZ", src: "rolf-benz.svg" }, { name: "BoConcept", src: "boconcept.svg" }, { name: "ligne roset", src: "ligne-roset.svg" }];

export default async function HomePage() {
  const [catalog, site] = await Promise.all([getCatalog(), getSiteConfig()]);
  const { products, categories } = catalog;
  const homeCategories = getHomeCategories(categories, site, 6);
  const featured = getFeaturedProducts(products, 4);
  const stats = site.heroStats;

  return (
    <>
      <section className="hero-section">
        <Image src="/images/living-room-hero.webp" alt="Luxury cream sofa in a warm contemporary living room" fill priority className="hero-image" sizes="100vw" />
        <div className="hero-shade" />
        <div className="site-container hero-content">
          <p className="eyebrow">Imported furniture for modern living</p>
          <h1>Spaces that<br /><em>inspire.</em></h1>
          <p className="hero-copy">Global designs. Timeless quality. Thoughtfully selected furniture for homes, offices and spaces that live with you.</p>
          <div className="button-row">
            <Link className="button button-dark" href="/furniture">Browse catalogue <ArrowRight size={16} /></Link>
            <Link className="button button-light" href="/dealers"><MapPin size={16} /> Find a dealer</Link>
          </div>
          <div className="hero-proof">
            <div><strong>{stats.brands}</strong><span>Global brands</span></div>
            <div><strong>{stats.designs}</strong><span>Catalogue designs</span></div>
            <div><strong>{stats.dealers}</strong><span>Dealer partners</span></div>
          </div>
        </div>
        <div className="hero-side-note">Furniture<br />for a better<br />tomorrow</div>
        <div className="hero-pagination"><span className="pagination-active">01</span><span>02</span><span>03</span><span className="pagination-line" /></div>
      </section>

      <section className="benefit-strip">
        <div className="site-container benefit-grid">
          <div><Globe2 /><span><b>Imported collections</b><small>From global brands</small></span></div>
          <div><Gem /><span><b>Premium quality</b><small>Made to last</small></span></div>
          <div><MapPin /><span><b>Wide dealer network</b><small>Closer to your home</small></span></div>
          <div><SlidersHorizontal /><span><b>Personalisation</b><small>Made for your space</small></span></div>
          <div><Headset /><span><b>Expert consultation</b><small>Here when you need us</small></span></div>
        </div>
      </section>

      <section className="section site-container">
        <SectionHeading eyebrow="Explore our range" title="Shop by category" description="Browse real HTC categories with live product counts." link="/furniture" linkText="View all furniture" />
        <div className="category-grid">
          {homeCategories.map((item) => <CatalogCategoryCard key={item.slug} category={item} />)}
        </div>
      </section>

      <section className="imported-band">
        <div className="imported-copy">
          <p className="eyebrow">World-class brands</p>
          <h2>International<br />designs, <em>local living.</em></h2>
          <p>Handpicked from renowned global brands, our imported furniture brings world-class design, superior quality and everyday comfort to your home.</p>
          <Link href="/collections" className="button button-dark">Explore collections <ArrowRight size={16} /></Link>
        </div>
        <div className="imported-image">
          <Image src="/images/luxury-living-editorial.webp" alt="Luxury living room with sculptural cream sofa, caramel leather chair and natural stone finishes" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="imported-points">
          <div><Globe2 /><span>Exclusive global brands</span></div>
          <div><BadgeCheck /><span>Modern &amp; timeless design</span></div>
          <div><Gem /><span>Premium materials &amp; finishes</span></div>
          <div><MapPin /><span>Available through dealers</span></div>
        </div>
      </section>

      <section className="brand-strip site-container">
        <SectionHeading eyebrow="A world of design" title="Our global brands" link="/collections" linkText="Explore brands" compact />
        <div className="brand-logos brand-icon-grid">{brands.map((brand) => <div className="brand-icon-card" key={brand.name} title={brand.name}><Image src={`/brand/brands/${brand.src}`} alt={brand.name} width={88} height={80} /><span className="sr-only">{brand.name}</span></div>)}</div>
      </section>

      <section className="section room-section">
        <div className="site-container">
          <SectionHeading eyebrow="Find your style" title="Explore by room" description="Jump into the catalogue by room type." link="/rooms" linkText="View all rooms" />
          <div className="room-grid">
            {rooms.map((room) => (
              <Link href={room.href} className="room-card" key={room.title}>
                <Image src={`/images/${room.image}.webp`} alt={room.title} fill sizes="(max-width: 768px) 50vw, 20vw" />
                <span className="room-overlay" />
                <span className="room-card-copy"><b>{room.title}</b><small>{room.desc}</small></span>
                <span className="round-arrow"><ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section site-container">
        <SectionHeading eyebrow="From htcfurniture.in" title="Featured catalogue pieces" description="A selection from the HTC product catalogue — prices shown in INR." link="/furniture" linkText="View all products" />
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={String(product.id)} product={product} tag={product.isFeatured ? "Featured" : undefined} href={undefined} />
          ))}
        </div>
      </section>

      <DealerCta />

      <section className="customise-band">
        <div className="customise-copy">
          <p className="eyebrow">Your furniture, your style</p>
          <h2>Make it<br /><em>uniquely yours.</em></h2>
          <p>Choose materials, colours and finishes to create a piece that feels right for your space.</p>
          <Link href="/contact" className="button button-gold">Start a consultation <ArrowRight size={16} /></Link>
        </div>
        <div className="swatch-image"><Image src="/images/materials-swatches.webp" alt="Curated upholstery and wood finish samples" fill sizes="(max-width: 768px) 100vw, 50vw" /></div>
        <div className="customise-steps">
          <div><span>01</span> Choose material</div><div><span>02</span> Select colour</div><div><span>03</span> Confirm dimensions</div><div><span>04</span> Request a quote</div>
        </div>
      </section>

      <section className="why-section">
        <div className="site-container why-layout">
          <div className="why-intro"><p className="eyebrow">The HTC difference</p><h2>More than<br /><em>just furniture.</em></h2><p>We connect thoughtful design with trusted global makers and a dealer network that brings the experience closer to you.</p><Link href="/about" className="text-link">Discover our story <ArrowRight size={16} /></Link></div>
          <div className="stats-grid">
            <div><Globe2 /><strong>{stats.brands}</strong><b>Global brands</b><span>International perspectives</span></div>
            <div><Gem /><strong>{products.length}</strong><b>Catalogue products</b><span>Synced from HTC</span></div>
            <div><MapPin /><strong>{stats.dealers}</strong><b>Dealer partners</b><span>Across multiple locations</span></div>
            <div><Headset /><strong>Personal</strong><b>Expert guidance</b><span>From discovery to delivery</span></div>
          </div>
        </div>
      </section>

      <section className="section site-container testimonial-section">
        <SectionHeading eyebrow="Words from our community" title="Made for real life" description="We believe great furniture should feel just as good years from now." />
        <div className="testimonial-grid">
          <article><div className="stars">★★★★★</div><p>&ldquo;Beautiful designs and a thoughtful selection. The team helped us find pieces that feel right for our home.&rdquo;</p><b>HTC customer</b><small>Living room collection</small></article>
          <article><div className="stars">★★★★★</div><p>&ldquo;The showroom experience made it easy to understand the materials, comfort and finish before choosing.&rdquo;</p><b>HTC customer</b><small>Imported recliner</small></article>
          <article><div className="stars">★★★★★</div><p>&ldquo;A lovely range of international designs with helpful guidance from the first visit to delivery.&rdquo;</p><b>HTC customer</b><small>Dining collection</small></article>
        </div>
        <p className="disclaimer-note">Customer quotes shown here are sample design copy. Replace with approved customer testimonials before launch.</p>
      </section>

      <section className="newsletter-section">
        <div className="site-container newsletter-inner">
          <div><p className="eyebrow">A little inspiration, delivered</p><h2>Stay inspired.</h2><p>Discover new collections, design ideas and news from HTC Furniture.</p></div>
          <form className="newsletter-form" action="/contact"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" name="email" type="email" placeholder="Your email address" required /><button type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button></form>
        </div>
      </section>
    </>
  );
}
