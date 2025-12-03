import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { getDrawById, getProductsByDrawId, createSubmission } from '../../lib/pocketbase';
import Howtowin from '../../components/Howtowin';

export default function PrizePage() {
  const router = useRouter();
  const { id } = router.query;

  const [draw, setDraw] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [entryForm, setEntryForm] = useState({
    user_email: '',
    user_name: '',
  });

  useEffect(() => {
    if (id) {
      loadDrawData();
    }
  }, [id]);

  const loadDrawData = async () => {
    setIsLoading(true);
    try {
      const [drawData, productsData] = await Promise.all([
        getDrawById(id),
        getProductsByDrawId(id),
      ]);
      setDraw(drawData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading draw:', error);
    }
    setIsLoading(false);
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSubmission({
        draw_id: id,
        user_email: entryForm.user_email,
        user_name: entryForm.user_name,
      });
      setSubmitSuccess(true);
    } catch (error) {
      alert('Error submitting entry: ' + error.message);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-winzone-purple flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-winzone-orange"></div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="min-h-screen bg-winzone-purple flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Draw Not Found</h1>
          <Link href="/" className="text-winzone-orange hover:text-winzone-orange-light text-sm sm:text-base">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const mainProduct = products[0];
  const totalValue = products.reduce((sum, p) => sum + (p.retail_price || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header-main">
        <div className="container-main">
          <div className="header-content-sm">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="WinZone Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10 object-contain"
              />
              <span className="text-lg font-bold text-white">Winzone</span>
            </Link>
            <Link href="/" className="btn-link text-responsive-xs flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Draws</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-main py-8 sm:py-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start mb-12 sm:mb-16">
          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-winzone-orange/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-winzone-purple-light/50 backdrop-blur-xl border border-winzone-purple-light rounded-3xl overflow-hidden">
              {draw.image_url || mainProduct?.image_url ? (
                <img
                  src={draw.image_url || mainProduct?.image_url}
                  alt={draw.title}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-winzone-purple-light to-winzone-purple-dark">
                  <svg className="w-24 h-24 sm:w-32 sm:h-32 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Draw Active
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">{draw.title}</h1>
            
            <p className="text-base sm:text-lg text-slate-400 mb-6 sm:mb-8">
              {draw.description || 'Enter for a chance to win this amazing prize!'}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="stat-card">
                <p className="stat-label">Entry Fee</p>
                <p className="stat-value">${draw.entry_fee}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Prizes</p>
                <p className="stat-value">{products.length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Value</p>
                <p className="stat-value-accent">${totalValue}</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowEntryModal(true)}
              className="btn-primary-lg"
            >
              Enter Draw for ${draw.entry_fee}
            </button>

            <p className="text-slate-500 text-xs sm:text-sm text-center mt-3 sm:mt-4">
              Secure payment • Instant entry • Fair draw
            </p>
          </div>
        </div>

        {/* Products Section */}
        {products.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <h2 className="heading-3 mb-6 sm:mb-8">Prizes You Could Win</h2>
            <div className="grid-responsive">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-card-image">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex-center bg-gradient-to-br from-winzone-purple-light to-winzone-purple-dark">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div className="product-card-price">
                      ${product.retail_price}
                    </div>
                  </div>
                  <div className="product-card-content">
                    <h3 className="product-card-title">{product.name}</h3>
                    <p className="text-body-sm">
                      {product.description || 'Amazing prize waiting for you!'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How to Win */}
        <Howtowin/>
      </main>

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {submitSuccess ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full flex-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="heading-3 mb-3 sm:mb-4">Entry Submitted!</h2>
                <p className="text-body-sm mb-6 sm:mb-8">
                  Your entry has been recorded. You'll be notified by email if you win!
                </p>
                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    setSubmitSuccess(false);
                  }}
                  className="btn-primary-md w-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2 className="modal-header-title">Enter to Win</h2>
                  <p className="modal-header-subtitle">{draw.title}</p>
                </div>
                <form onSubmit={handleSubmitEntry} className="modal-body">
                  <div className="stat-card mb-4 sm:mb-6">
                    <div className="flex-between">
                      <span className="text-body-sm">Entry Fee</span>
                      <span className="stat-value">${draw.entry_fee}</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={entryForm.user_name}
                      onChange={(e) => setEntryForm({ ...entryForm, user_name: e.target.value })}
                      className="form-input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={entryForm.user_email}
                      onChange={(e) => setEntryForm({ ...entryForm, user_email: e.target.value })}
                      className="form-input"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEntryModal(false)}
                      className="btn-secondary-md flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary-md flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : `Pay $${draw.entry_fee} & Enter`}
                    </button>
                  </div>

                  <p className="text-muted text-center mt-4">
                    By entering, you agree to the terms and conditions.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
