import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllDraws, getProductsByDrawId, getAllEbooks } from '../lib/pocketbase';
import Howtowin from '../components/Howtowin';
import Footer from '../components/Footer';


export default function Home() {
  const [draws, setDraws] = useState([]);
  const [drawProducts, setDrawProducts] = useState({});
  const [ebooks, setEbooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const loadDraws = async () => {
      try {
        const [data, ebooksData] = await Promise.all([
          getAllDraws(),
          getAllEbooks().catch(() => []) // Don't fail if ebooks collection doesn't exist
        ]);
        if (!mounted) return;
        
        setDraws(data || []);
        setEbooks(ebooksData || []);
        setError(null);
        
        // Load products for each draw
        if (data && data.length > 0) {
          const productsMap = {};
          for (const draw of data) {
            try {
              const products = await getProductsByDrawId(draw.id);
              if (mounted) {
                productsMap[draw.id] = products || [];
              }
            } catch (e) {
              console.error('Error loading products for draw:', draw.id, e);
            }
          }
          if (mounted) {
            setDrawProducts(productsMap);
          }
        }
      } catch (err) {
        console.error('Error loading draws:', err);
        if (mounted) {
          setError('Unable to connect to the server. Make sure PocketBase is running.');
          setDraws([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadDraws();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <header className=" ">
        <div className="container-main">
          <div className="header-content">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="WinZone Logo" 
                width={48} 
                height={48} 
                className="w-12 h-12 object-contain"
                priority
              />
              <span className="text-xl font-bold text-white">Winzone</span>
            </Link>
           
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        
        <div className="container-main text-center">
          {/* <div className="hero-badge mb-4 sm:mb-6">
            <span className="hero-pulse"></span>
            Live Draws Available
          </div> */}
          
          <h2 className="heading-1 mb-4 sm:mb-6">
            Browse products and 
            <span className="block text-accent">
            Win Prizes Today
            </span>
          </h2>
          
          <p className="text-body max-w-2xl mx-auto mb-8 sm:mb-10">
            Enter our exciting draws for a chance to win incredible prizes. 
            Simple entry, transparent draws, real winners.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-responsive-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified Draws
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Secure Payments
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant Entry
            </div>
          </div>
        </div>
      </section>

      {/* Ebooks Section - Carousel Style */}
      {ebooks.length > 0 && (
        <section className="section-spacing bg-[var(--winzone-purple-dark)]/30">
          <div className="container-main">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4">
              <div>
                <h3 className="heading-2">Ebooks</h3>
                <p className="text-body-sm mt-1">Browse our collection of premium ebooks</p>
              </div>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Buttons */}
              {ebooks.length > 2 && (
                <>
                  <button
                    onClick={() => {
                      const container = document.getElementById('ebooks-carousel');
                      if (container) {
                        const scrollAmount = window.innerWidth < 640 
                          ? container.offsetWidth / 2 
                          : window.innerWidth < 1024 
                            ? container.offsetWidth / 2 
                            : window.innerWidth < 1280
                              ? container.offsetWidth / 3
                              : container.offsetWidth / 4;
                        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                      }
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--winzone-purple-light)]/80 hover:bg-[var(--winzone-purple-light)] text-white p-2 rounded-full shadow-lg transition-all hidden sm:flex items-center justify-center"
                    aria-label="Previous ebooks"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById('ebooks-carousel');
                      if (container) {
                        const scrollAmount = window.innerWidth < 640 
                          ? container.offsetWidth / 2 
                          : window.innerWidth < 1024 
                            ? container.offsetWidth / 2 
                            : window.innerWidth < 1280
                              ? container.offsetWidth / 3
                              : container.offsetWidth / 4;
                        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                      }
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--winzone-purple-light)]/80 hover:bg-[var(--winzone-purple-light)] text-white p-2 rounded-full shadow-lg transition-all hidden sm:flex items-center justify-center"
                    aria-label="Next ebooks"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Carousel */}
              <div
                id="ebooks-carousel"
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {ebooks.map((ebook) => {
                  // Handle image field - PocketBase file fields can be strings (URLs) or objects
                  const imageUrl = typeof ebook.image === 'string' 
                    ? ebook.image 
                    : ebook.image_url || (ebook.image && typeof ebook.image === 'object' ? ebook.image.url : null);
                  
                  return (
                    <Link
                      key={ebook.id}
                      href={`/single_ebook/${ebook.id}`}
                      className="group bg-[var(--winzone-purple-light)]/20 border border-[var(--winzone-purple-light)]/30 rounded-2xl overflow-hidden hover:border-[var(--winzone-orange)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--winzone-orange)]/20 flex-shrink-0 snap-start"
                      style={{
                        width: 'calc(50% - 12px)',
                        minWidth: 'calc(50% - 12px)',
                      }}
                    >
                      {/* Ebook Image */}
                      <div className="relative aspect-[3/4] bg-[var(--winzone-purple-light)]/10 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={ebook.name || 'Ebook'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-[var(--winzone-orange)] text-white text-xs font-bold px-3 py-1 rounded-full">
                          ${ebook.price || '0'}
                        </div>
                      </div>

                      {/* Ebook Info */}
                      <div className="p-4">
                        <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-[var(--winzone-orange)] transition-colors line-clamp-2">
                          {ebook.name || 'Ebook'}
                        </h4>
                        {ebook.pages && (
                          <p className="text-slate-400 text-sm mb-3">
                            {ebook.pages} pages
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[var(--winzone-orange)] font-bold text-lg">
                            ${ebook.price || '0'}
                          </span>
                          <span className="text-slate-400 text-sm group-hover:text-[var(--winzone-orange)] transition-colors">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Draws Grid */}
      <section className="section-spacing">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <h3 className="heading-2">Active Draws</h3>
              <p className="text-body-sm mt-1">Choose a draw and enter for your chance to win</p>
            </div>
            <div className="text-muted">
              {draws.length} draw{draws.length !== 1 ? 's' : ''} available
            </div>
          </div>

          {isLoading ? (
            <div className="loader-center">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-state-icon bg-rose-900/50">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="empty-state-title">Connection Error</h4>
              <p className="empty-state-text mb-4">
                {error}
              </p>
              <p className="text-slate-600 text-responsive-xs">
                Run <code className="bg-winzone-purple-light px-2 py-1 rounded">./pocketbase serve</code> in the backend folder
              </p>
            </div>
          ) : draws.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h4 className="empty-state-title">No Active Draws</h4>
              <p className="empty-state-text">
                There are no active draws at the moment. Check back soon for exciting new prizes!
              </p>
            </div>
          ) : (
            <div className="grid-responsive">
              {draws.map((draw) => {
                const products = drawProducts[draw.id] || [];
                const mainProduct = products[0];
                
                return (
                  <Link
                    key={draw.id}
                    href={`/prize/${draw.id}`}
                    className="draw-card group"
                  >
                    {/* Image */}
                    <div className="draw-card-image">
                      {draw.image_url ? (
                        <img
                          src={draw.image_url}
                          alt={draw.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : mainProduct?.image_url ? (
                        <img
                          src={mainProduct.image_url}
                          alt={mainProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex-center bg-gradient-to-br from-winzone-purple-light to-winzone-purple-dark">
                          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-winzone-purple via-transparent to-transparent"></div>
                      
                      {/* Entry Fee Badge */}
                      <div className="entry-badge">
                        ${draw.entry_fee} Entry
                      </div>
                    </div>

                    {/* Content */}
                    <div className="draw-card-content">
                      <h4 className="draw-card-title group-hover:text-winzone-orange">
                        {draw.title}
                      </h4>
                      <p className="draw-card-description">
                        {draw.description || 'Enter for a chance to win amazing prizes!'}
                      </p>
                      
                      {/* Products Preview */}
                      {products.length > 0 && (
                        <div className="mb-4">
                          <p className="text-muted mb-2">Prizes Include:</p>
                          <div className="flex flex-wrap gap-2">
                            {products.slice(0, 3).map((product) => (
                              <span key={product.id} className="text-xs bg-winzone-purple-light text-slate-300 px-2 py-1 rounded-md">
                                {product.name}
                              </span>
                            ))}
                            {products.length > 3 && (
                              <span className="text-xs bg-winzone-purple-light text-slate-500 px-2 py-1 rounded-md">
                                +{products.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* CTA */}
                      <div className="flex-between">
                        <span className="draw-card-cta group-hover:text-winzone-orange-light">
                          Enter Now →
                        </span>
                        {mainProduct && (
                          <span className="text-muted">
                            Worth ${mainProduct.retail_price}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>



      {/* How to Win Section */}
      <Howtowin/>

      {/* Footer */}
      <Footer />
    </div>
  );
}
