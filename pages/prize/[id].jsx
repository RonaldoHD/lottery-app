import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { getDrawById, getProductsByDrawId, createSubmission } from '../../lib/pocketbase';
import HowToWin from '../../components/Howtowin';
import Footer from '../../components/Footer';



const securedpayment = (
  <div className=" flex flex-col mt-4" >
    <p className="text-muted   mb-3">
      Secure payment with whish • Instant entry
    </p>

    <img
      src="https://play-lh.googleusercontent.com/xHb69kCRdCQOi5wZoX0zuCV3CwmCxAH-qR35qNWJJ0VpRT7NNnpyakciHkivdyvLxCw"
      alt="whish payment"
      className=" object-contain rounded-lg w-[50px] h-[35px] object-cover"
    />
  </div>
)


// Ebook Component
function EbookBox({ imageUrl, title = "Ebook", pages = "52 pages", price = "$2" }) {
  return (
    <div className="bg-[var(--winzone-purple-light)]/30 border border-[var(--winzone-purple-light)] rounded-xl p-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-4">
        {imageUrl && (
          <div className="flex-shrink-0">
            <img
              src={imageUrl}
              alt={title}
              className="w-[70px]   object-cover rounded-lg"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs sm:text-sm mb-2">
            Ebook
          </p>
          <h3 className="text-white font-semibold text-sm sm:text-base mb-1 truncate">
            {title}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-2">
            {pages}
          </p>

        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl font-bold text-[var(--winzone-orange)]">
            {price}
          </span>
        </div>

      </div>
    </div>
  );
}

export default function PrizePage() {
  const router = useRouter();
  const { id } = router.query;

  const [draw, setDraw] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ebookDownloaded, setEbookDownloaded] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [entryForm, setEntryForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    if (id) {
      loadDrawData();
    }
    // Check if ebook was already downloaded
    if (typeof window !== 'undefined') {
      const downloaded = localStorage.getItem('ebook_downloaded');
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
        first_name: entryForm.first_name,
        last_name: entryForm.last_name,
        phone: entryForm.phone,
      });
      setSubmitSuccess(true);
    } catch (error) {
      alert('Error submitting entry: ' + error.message);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-3 mb-4">Draw Not Found</h1>
          <Link href="/" className="text-accent hover:opacity-80">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const mainProduct = products[0];

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
              <span className="hidden sm:inline">Back to Draws</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-main py-8 sm:py-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-12 sm:mb-16">

          {/* Details */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="hero-badge">
                <span className="hero-pulse"></span>
                Draw Active
              </div>


            </div>

            <h1 className="heading-1 mb-3 sm:mb-4">{draw.title}</h1>

            <p className="text-body mb-6 sm:mb-8">
              {draw.description || 'Enter for a chance to win this amazing prize!'}
            </p>

            {/* Ebook Box */}
            <EbookBox
              imageUrl="https://api.mycoolifyserver.online/api/files/pbc_121766130/tbgqwtns4j4sf13/book_cover_t44vp0ufxp.jpg?token="
              title="Selling without fear"
              pages="52 pages"
              price="$2"
            />

            {draw.end_date && (
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
                  Ends in {countdown.days} days, {countdown.hours}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
                </span>
              </div>
            )}


            {/* CTA with glow */}
            <button
              onClick={() => setShowEntryModal(true)}
              className="btn-glow mb-4"
            >
              Enter Draw NOW !!
            </button>



            {securedpayment}

          </div>


          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0    "></div>
            <div className="relative card overflow-hidden rounded-3xl">
              {draw.image_url || mainProduct?.image_url ? (
                <img
                  src={draw.image_url || mainProduct?.image_url}
                  alt={draw.title}
                  className="w-full  object-cover"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-[var(--winzone-purple-light)]">
                  <svg className="w-24 h-24 sm:w-32 sm:h-32 text-[var(--text-slate-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              )}
            </div>
          </div>


        </div>

        {/* Products Section */}
        {products.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <h2 className="heading-2 mb-6 sm:mb-8">Prizes Details</h2>
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

        {/* How to Win */}
        <HowToWin />
      </main>

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="modal-overlay ">
          <div className="modal-container scrollbar-hide">
            {submitSuccess ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[rgba(16,185,129,0.2)] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="heading-2 mb-3 sm:mb-4">Entry Submitted!</h2>
                <p className="text-body-sm mb-4 sm:mb-6">
                  Your entry has been recorded. You'll be notified by phone if you win!
                </p>
                
                {/* Ebook Download Section */}
                <div className="bg-[var(--winzone-purple-light)]/30   rounded-xl  mb-6 sm:mb-8">
                  <p className="text-white text-sm sm:text-base font-medium mb-3">
                    Get Your Free Ebook!
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
                      onClick={async () => {
                        setIsDownloading(true);
                        try {
                          const response = await fetch('https://api.mycoolifyserver.online/api/files/pbc_1389469579/gedil7k1eqqt8xy/selling_without_fear_ebook_akw6mj06p0.pdf?token=');
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'Selling_Without_Fear.pdf';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                          
                          // Mark as downloaded
                          setEbookDownloaded(true);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('ebook_downloaded', 'true');
                          }
                        } catch (error) {
                          console.error('Download error:', error);
                          alert('Failed to download ebook. Please try again.');
                        } finally {
                          setIsDownloading(false);
                        }
                      }}
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

                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    setSubmitSuccess(false);
                    setEntryForm({ first_name: '', last_name: '', phone: '' });
                  }}
                  className="btn-primary btn-primary-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              < >

                <div className="modal-header">
                  <h2
                    className="modal-header-title">Enter to Win</h2>
                  <p className="modal-header-subtitle">{draw.title}</p>
                </div>
                <form onSubmit={handleSubmitEntry} className="modal-body">
                  <div className="mb-4">
                    <EbookBox
                      imageUrl="https://api.mycoolifyserver.online/api/files/pbc_121766130/tbgqwtns4j4sf13/book_cover_t44vp0ufxp.jpg?token="
                      title="Selling without fear"
                      pages="52 pages"
                      price="$2"
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="form-label">
                        First Name <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={entryForm.first_name}
                        onChange={(e) => setEntryForm({ ...entryForm, first_name: e.target.value })}
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
                        value={entryForm.last_name}
                        onChange={(e) => setEntryForm({ ...entryForm, last_name: e.target.value })}
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
                      value={entryForm.phone}
                      onChange={(e) => setEntryForm({ ...entryForm, phone: e.target.value })}
                      className="form-input"
                      placeholder="+961"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEntryModal(false)}
                      className="btn-secondary btn-secondary-md flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary btn-primary-md flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : `Pay $${draw.entry_fee} & Enter`}
                    </button>
                  </div>

                  {securedpayment}
                </form>

                <HowToWin />
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
