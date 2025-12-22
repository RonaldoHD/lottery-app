import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { getEbookById, getDrawById, getProductsByDrawId, createSubmission, createOrder } from '../../lib/pocketbase';
import Footer from '../../components/Footer';

const securedpayment = (
  <div className="flex flex-col mt-4">
    <p className="text-muted mb-3">
      Secure payment with whish • Instant entry
    </p>
    <img
      src="https://play-lh.googleusercontent.com/xHb69kCRdCQOi5wZoX0zuCV3CwmCxAH-qR35qNWJJ0VpRT7NNnpyakciHkivdyvLxCw"
      alt="whish payment"
      className="object-contain rounded-lg w-[50px] h-[35px] object-cover"
    />
  </div>
);

export default function SingleEbookPage() {
  const router = useRouter();
  const { id } = router.query;

  const [ebook, setEbook] = useState(null);
  const [draw, setDraw] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ebookDownloaded, setEbookDownloaded] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [purchaseForm, setPurchaseForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    if (id) {
      loadEbookData();
    }
    // Check if ebook was already downloaded
    if (typeof window !== 'undefined' && id) {
      const downloaded = localStorage.getItem(`ebook_downloaded_${id}`);
      if (downloaded === 'true') {
        setEbookDownloaded(true);
      }
    }
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (!draw?.end_date) return;

    const calculateCountdown = () => {
      const endDate = new Date(draw.end_date).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [draw?.end_date]);

  const loadEbookData = async () => {
    setIsLoading(true);
    try {
      const ebookData = await getEbookById(id);
      setEbook(ebookData);
      
      // Load draw and products if draw_id exists
      if (ebookData?.draw_id) {
        try {
          const [drawData, productsData] = await Promise.all([
            getDrawById(ebookData.draw_id),
            getProductsByDrawId(ebookData.draw_id),
          ]);
          setDraw(drawData);
          setProducts(productsData);
        } catch (error) {
          console.error('Error loading draw data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading ebook:', error);
    }
    setIsLoading(false);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      // 1) Create an order record for this ebook purchase
      await createOrder({
        ebook_id: ebook.id,
        username: purchaseForm.first_name,
        user_lastname: purchaseForm.last_name,
        phone: purchaseForm.phone,
      });

      // 2) If this ebook is linked to a draw, also create a submission (entry)
      if (ebook?.draw_id) {
        await createSubmission({
          draw_id: ebook.draw_id,
          first_name: purchaseForm.first_name,
          last_name: purchaseForm.last_name,
          phone: purchaseForm.phone,
        });
      }

      setSubmitSuccess(true);
    } catch (error) {
      alert('Error processing purchase: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    // Get PDF URL from content field
    const pdfUrl = typeof ebook?.content === 'string' 
      ? ebook.content 
      : ebook?.content?.url || ebook?.pdf_url;
    
    if (!pdfUrl) {
      alert('Ebook PDF not available');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${ebook.name || 'ebook'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Mark as downloaded
      setEbookDownloaded(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ebook_downloaded_${id}`, 'true');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download ebook. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-3 mb-4">Ebook Not Found</h1>
          <Link href="/" className="text-accent hover:opacity-80">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="">
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
              <span className="text-lg font-bold text-[var(--text-white)]">Winzone</span>
            </Link>
            <Link href="/" className="btn-link flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Products</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-main py-8 sm:py-12">
        {/* Ecommerce Product Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-12 sm:mb-16">
          
          {/* Ebook Image */}
          <div className="relative">
            <div className="relative card overflow-hidden rounded-3xl">
              {(typeof ebook.image === 'string' ? ebook.image : ebook.image_url) ? (
                <img
                  src={typeof ebook.image === 'string' ? ebook.image : ebook.image_url}
                  alt={ebook.name || 'Ebook'}
                  className="w-full aspect-[3/4] object-cover"
                />
              ) : (
                <div className="w-full aspect-[3/4] flex items-center justify-center bg-[var(--winzone-purple-light)]">
                  <svg className="w-24 h-24 sm:w-32 sm:h-32 text-[var(--text-slate-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Ebook Details */}
          <div>
         

            <h3 className="heading-2 mb-3 sm:mb-4">
              {ebook.name || 'Ebook'}
            </h3>

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
               
                {ebook.pages && (
                  <span className="text-slate-400 text-sm sm:text-base">
                    {ebook.pages} pages
                  </span>
                )}
              </div>
              
              

              {!ebook.content && draw && (
                <p className="text-body mb-6">
                  Purchase this ebook and automatically enter the draw for a chance to win amazing prizes!
                </p>
              )}
            </div>

            {draw && draw.end_date && (
              <div className="countdown-container flex items-center text-body-sm mb-6">
                <svg
                  className="w-4 h-4 text-[var(--winzone-orange)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Draw ends in {countdown.days} days, {countdown.hours}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
                </span>
              </div>
            )}

            {/* Purchase Button */}
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="btn-glow mb-4 w-full sm:w-auto"
            >
              Purchase Ebook - ${ebook.price || '0'}
            </button>

            {securedpayment}

            {/* Benefits */}
            <div className="mt-6 sm:mt-8 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--winzone-orange)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-body-sm">
                  <strong>Instant Access:</strong> Download your ebook immediately after purchase
                </p>
              </div>
              {draw && (
                <>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[var(--winzone-orange)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-body-sm">
                      <strong>Automatic Entry:</strong> Your purchase automatically enters you into the draw
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[var(--winzone-orange)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-body-sm">
                      <strong>Win Prizes:</strong> Get notified if you win amazing prizes
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Draw Prizes Section */}
        {draw && products.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <h2 className="heading-2 mb-6 sm:mb-8">Prizes You Could Win</h2>
            <div className="bg-[var(--winzone-purple-light)]/20 border border-[var(--winzone-purple-light)]/30 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-semibold text-xl mb-2">{draw.title}</h3>
              {draw.description && (
                <p className="text-body-sm text-slate-300 mb-4">{draw.description}</p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-card-content">
                    <h3 className="product-card-title">{product.name}</h3>
                    <p
                      className="text-body-sm"
                      dangerouslySetInnerHTML={{
                        __html: product.description || 'Amazing prize waiting for you!'
                      }}
                    ></p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ebook Details Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="heading-2 mb-6 sm:mb-8">Ebook Details</h2>
          <div className="bg-[var(--winzone-purple-light)]/20 border border-[var(--winzone-purple-light)]/30 rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Name</h4>
                <p className="text-body-sm text-slate-300">{ebook.name || 'N/A'}</p>
              </div>
              {ebook.pages && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Pages</h4>
                  <p className="text-body-sm text-slate-300">{ebook.pages}</p>
                </div>
              )}
              <div>
                <h4 className="text-white font-semibold mb-2">Price</h4>
                <p className="text-body-sm text-slate-300">${ebook.price || '0'}</p>
              </div>
              {ebook.created && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Created</h4>
                  <p className="text-body-sm text-slate-300">
                    {new Date(ebook.created).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
              {ebook.updated && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Last Updated</h4>
                  <p className="text-body-sm text-slate-300">
                    {new Date(ebook.updated).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
              {draw && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Draw Status</h4>
                  <p className="text-body-sm text-slate-300">Active</p>
                </div>
              )}
            </div>
            
          </div>
        </section>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="modal-overlay">
          <div className="modal-container scrollbar-hide">
            {submitSuccess ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[rgba(16,185,129,0.2)] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="heading-2 mb-3 sm:mb-4">Purchase Successful!</h2>
                <p className="text-body-sm mb-4 sm:mb-6">
                  Thank you for your purchase! {draw ? "You've been automatically entered into the draw." : "Your ebook is ready to download."}
                </p>
                
                {/* Ebook Download Section */}
                {(typeof ebook?.content === 'string' ? ebook.content : ebook?.content?.url || ebook?.pdf_url) && (
                  <div className="bg-[var(--winzone-purple-light)]/30 rounded-xl p-4 mb-6 sm:mb-8">
                    <p className="text-white text-sm sm:text-base font-medium mb-3">
                      Download Your Ebook
                    </p>
                    {ebookDownloaded ? (
                      <div className="w-full px-6 py-3 bg-[rgba(16,185,129,0.2)] border border-[#10b981] rounded-lg flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[#10b981] font-semibold">Ebook Downloaded</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full px-6 py-3 bg-[var(--winzone-orange)] hover:bg-[var(--winzone-orange)]/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloading ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Ebook
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSubmitSuccess(false);
                    setPurchaseForm({ first_name: '', last_name: '', phone: '' });
                  }}
                  className="btn-primary btn-primary-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2 className="modal-header-title">Purchase Ebook</h2>
                  <p className="modal-header-subtitle">{ebook.name || 'Ebook'}</p>
                </div>
                <form onSubmit={handlePurchase} className="modal-body">
                  <div className="bg-[var(--winzone-purple-light)]/30 border border-[var(--winzone-purple-light)] rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                      {(typeof ebook.image === 'string' ? ebook.image : ebook.image_url) && (
                        <div className="flex-shrink-0">
                          <img
                            src={typeof ebook.image === 'string' ? ebook.image : ebook.image_url}
                            alt={ebook.name || 'Ebook'}
                            className="w-20 h-28 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {ebook.name || 'Ebook'}
                        </h3>
                        {ebook.pages && (
                          <p className="text-slate-400 text-sm mb-2">
                            {ebook.pages}
                          </p>
                        )}
                        <p className="text-2xl font-bold text-[var(--winzone-orange)]">
                          ${ebook.price || '0'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {draw && (
                    <div className="bg-[var(--winzone-purple-light)]/20 border border-[var(--winzone-purple-light)]/30 rounded-xl p-4 mb-6">
                      <p className="text-white text-sm font-medium mb-2">
                        🎁 Bonus: Automatic Entry into Draw
                      </p>
                      <p className="text-slate-300 text-xs">
                        By purchasing this ebook, you'll automatically be entered into the draw for a chance to win amazing prizes!
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="form-label">
                        First Name <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={purchaseForm.first_name}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, first_name: e.target.value })}
                        className="form-input"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Last Name <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={purchaseForm.last_name}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, last_name: e.target.value })}
                        className="form-input"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      Phone Number <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={purchaseForm.phone}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, phone: e.target.value })}
                      className="form-input"
                      placeholder="+961"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPurchaseModal(false)}
                      className="btn-secondary btn-secondary-md flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary btn-primary-md flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : `Pay $${ebook.price || '0'} & Purchase`}
                    </button>
                  </div>

                  {securedpayment}
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}



