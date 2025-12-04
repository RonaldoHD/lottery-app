import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllDraws, getProductsByDrawId } from '../lib/pocketbase';
import Howtowin from '../components/Howtowin';
import Footer from '../components/Footer';


export default function Home() {
  const [draws, setDraws] = useState([]);
  const [drawProducts, setDrawProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const loadDraws = async () => {
      try {
        const data = await getAllDraws();
        if (!mounted) return;
        
        setDraws(data || []);
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
          <div className="hero-badge mb-4 sm:mb-6">
            <span className="hero-pulse"></span>
            Live Draws Available
          </div>
          
          <h2 className="heading-1 mb-4 sm:mb-6">
            Win Your Dream
            <span className="block text-accent">
              Prizes Today
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
