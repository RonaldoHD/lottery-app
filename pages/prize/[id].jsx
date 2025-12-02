import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Draw Not Found</h1>
          <Link href="/" className="text-amber-400 hover:text-amber-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const mainProduct = products[0];
  const totalValue = products.reduce((sum, p) => sum + (p.retail_price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b1a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b1a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 pointer-events-none"></div>

      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">LuckyDraw</span>
            </Link>
            <Link
              href="/"
              className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Draws
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
              {draw.image_url || mainProduct?.image_url ? (
                <img
                  src={draw.image_url || mainProduct?.image_url}
                  alt={draw.title}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <svg className="w-32 h-32 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Draw Active
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{draw.title}</h1>
            
            <p className="text-lg text-slate-400 mb-8">
              {draw.description || 'Enter for a chance to win this amazing prize!'}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-500 text-sm">Entry Fee</p>
                <p className="text-2xl font-bold text-white">${draw.entry_fee}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-500 text-sm">Prizes</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-500 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-emerald-400">${totalValue}</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowEntryModal(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-rose-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:scale-[1.02]"
            >
              Enter Draw for ${draw.entry_fee}
            </button>

            <p className="text-slate-500 text-sm text-center mt-4">
              Secure payment • Instant entry • Fair draw
            </p>
          </div>
        </div>

        {/* Products Section */}
        {products.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Prizes You Could Win</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden"
                >
                  <div className="relative h-48 bg-slate-800">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <svg className="w-16 h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ${product.retail_price}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-slate-400 text-sm">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden">
            {submitSuccess ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Entry Submitted!</h2>
                <p className="text-slate-400 mb-8">
                  Your entry has been recorded. You'll be notified by email if you win!
                </p>
                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    setSubmitSuccess(false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-rose-600 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-6">
                  <h2 className="text-2xl font-bold text-white">Enter to Win</h2>
                  <p className="text-white/80 mt-1">{draw.title}</p>
                </div>
                <form onSubmit={handleSubmitEntry} className="p-6 space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Entry Fee</span>
                      <span className="text-2xl font-bold text-white">${draw.entry_fee}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={entryForm.user_name}
                      onChange={(e) => setEntryForm({ ...entryForm, user_name: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={entryForm.user_email}
                      onChange={(e) => setEntryForm({ ...entryForm, user_email: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-500"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEntryModal(false)}
                      className="flex-1 px-6 py-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : `Pay $${draw.entry_fee} & Enter`}
                    </button>
                  </div>

                  <p className="text-slate-500 text-xs text-center mt-4">
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


