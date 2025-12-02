import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllDraws, getProductsByDrawId } from '../lib/pocketbase';
import Howtowin from '../components/Howtowin';

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
    <div className="min-h-screen bg-slate-950">
 

      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">LuckyDraw</h1>
                <p className="text-xs text-slate-400">Win Amazing Prizes</p>
              </div>
            </div>
            <Link
              href="/admin/login"
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-[12rem] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Live Draws Available
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Win Your Dream
            <span className="block bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              Prizes Today
            </span>
          </h2>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Enter our exciting draws for a chance to win incredible prizes. 
            Simple entry, transparent draws, real winners.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified Draws
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Secure Payments
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant Entry
            </div>
          </div>
        </div>
      </section>

      {/* Draws Grid */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-3xl font-bold text-white">Active Draws</h3>
              <p className="text-slate-400 mt-1">Choose a draw and enter for your chance to win</p>
            </div>
            <div className="text-slate-500 text-sm">
              {draws.length} draw{draws.length !== 1 ? 's' : ''} available
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-rose-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Connection Error</h4>
              <p className="text-slate-500 max-w-md mx-auto mb-4">
                {error}
              </p>
              <p className="text-slate-600 text-sm">
                Run <code className="bg-slate-800 px-2 py-1 rounded">./pocketbase serve</code> in the backend folder
              </p>
            </div>
          ) : draws.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">No Active Draws</h4>
              <p className="text-slate-500 max-w-md mx-auto">
                There are no active draws at the moment. Check back soon for exciting new prizes!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draws.map((draw) => {
                const products = drawProducts[draw.id] || [];
                const mainProduct = products[0];
                
                return (
                  <Link
                    key={draw.id}
                    href={`/prize/${draw.id}`}
                    className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-slate-800 overflow-hidden">
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                          <svg className="w-16 h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      
                      {/* Entry Fee Badge */}
                      <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        ${draw.entry_fee} Entry
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {draw.title}
                      </h4>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {draw.description || 'Enter for a chance to win amazing prizes!'}
                      </p>
                      
                      {/* Products Preview */}
                      {products.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-500 mb-2">Prizes Include:</p>
                          <div className="flex flex-wrap gap-2">
                            {products.slice(0, 3).map((product) => (
                              <span key={product.id} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                                {product.name}
                              </span>
                            ))}
                            {products.length > 3 && (
                              <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                                +{products.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-semibold text-sm group-hover:text-amber-300 transition-colors">
                          Enter Now →
                        </span>
                        {mainProduct && (
                          <span className="text-slate-500 text-sm">
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

      {/* Features Section */}
      <section className="relative py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">How It Works</h3>
            <p className="text-slate-400 max-w-xl mx-auto">
              Simple, transparent, and exciting. Here's how you can win.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Choose a Draw</h4>
              <p className="text-slate-400">
                Browse our active draws and pick the prize you want to win.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Enter & Pay</h4>
              <p className="text-slate-400">
                Submit your entry with a small fee for your chance to win.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Win Big</h4>
              <p className="text-slate-400">
                Winners are selected randomly and notified immediately!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Win Section */}
      <Howtowin/>

      {/* Footer */}
      <footer className="relative bg-slate-900/80 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <span className="text-white font-semibold">LuckyDraw</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/yourprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <p className="text-slate-500 text-sm text-center md:text-right">
                © {new Date().getFullYear()} LuckyDraw. All rights reserved.
                <br />
                <span className="text-slate-600">Must be 18+ to enter. Terms and conditions apply.</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
