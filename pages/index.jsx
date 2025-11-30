import React, { useState } from 'react';
import LoginModal from '../components/LoginModal';
import Image from 'next/image';
import { lotteryData } from '../data/lotteryData';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [won, setWon] = useState(false);

  const product = lotteryData.currentProduct;
  const entryFee = lotteryData.entryFee;

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowModal(false);
  };

  const handleClickToWin = () => {
    const chance = Math.random();
    if (chance > 0.5) {
      setWon(true);
    } else {
      alert("Sorry, try again! Don't give up - your next attempt could be the winner!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
                {lotteryData.hero.badge}
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                {lotteryData.hero.headline}
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {product.name}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                {lotteryData.hero.subheadline}
              </p>

              {!isLoggedIn && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 mb-4"
                  onClick={() => setShowModal(true)}
                >
                  {lotteryData.hero.ctaText}
                </button>
              )}
              <p className="text-sm text-gray-500">Entry Fee: ${entryFee.toFixed(2)} • Secure Payment • Instant Entry</p>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-50 transform rotate-6"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="mx-auto rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
              Why This {product.shortName} is Life-Changing
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {product.features.map((feature, index) => {
                const gradientClasses = [
                  "from-blue-50 to-blue-100 border-blue-200",
                  "from-purple-50 to-purple-100 border-purple-200",
                  "from-pink-50 to-pink-100 border-pink-200"
                ];
                return (
                  <div key={index} className={`text-center p-6 rounded-xl bg-gradient-to-br ${gradientClasses[index]} border-2`}>
                    <div className="text-5xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
              Real Winners, Real Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {lotteryData.testimonials.map((testimonial) => (
                <div key={testimonial.id} className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${testimonial.borderColor}`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-xl mr-4`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">Won {testimonial.timeAgo}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                  <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                🏆 Over {lotteryData.stats.totalWinners.toLocaleString()}+ Happy Winners {lotteryData.stats.period}
              </p>
              <p className="text-gray-600">Join the community of winners today!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {product.name} - The Ultimate Prize
              </h2>
              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                <div className="text-left space-y-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-2xl mr-3">✅</span>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{spec.title}</h3>
                        <p className="text-blue-100">{spec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <Image
                    src={product.showcaseImageUrl}
                    alt={product.name}
                    width={500}
                    height={400}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <p className="text-2xl font-bold mb-6">
                Retail Value: <span className="line-through text-blue-200">${product.retailPrice.toFixed(2)}</span> 
                <span className="text-yellow-300 ml-2">Win for Just ${entryFee.toFixed(2)} Entry!</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {lotteryData.cta.headline}
            </h2>
            <p className="text-xl text-white mb-8 opacity-95">
              {lotteryData.cta.description}
            </p>
            {!isLoggedIn ? (
              <button
                className="bg-white text-orange-600 px-12 py-5 rounded-full text-2xl font-bold shadow-2xl hover:shadow-white/50 transform hover:scale-110 transition-all duration-300 mb-4"
                onClick={() => setShowModal(true)}
              >
                {lotteryData.cta.buttonText}
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                {!won ? (
                  <>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      🎉 You're In! Ready to Win?
                    </h3>
                    <p className="text-gray-700 mb-6 text-lg">
                      Click the button below to see if you're today's lucky winner!
                    </p>
                    <button
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                      onClick={handleClickToWin}
                    >
                      🍀 Try Your Luck Now!
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎊</div>
                    <h3 className="text-4xl font-bold text-green-600 mb-4">
                      CONGRATULATIONS!
                    </h3>
                    <p className="text-2xl text-gray-700 mb-6">
                      You've won a {product.name}!
                    </p>
                    <p className="text-gray-600 mb-6">
                      Our team will contact you within 24 hours to arrange delivery of your prize.
                    </p>
                    <div className="bg-green-100 rounded-xl p-6 border-2 border-green-400">
                      <p className="text-lg font-semibold text-green-800">
                        🎁 Check your email for prize claim instructions!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <p className="text-white/90 mt-6 text-sm">
              *Entry fee: ${entryFee.toFixed(2)}. Must be 18+ to enter. See terms and conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-2">
            © 2024 iPhone Lottery. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            This is a promotional contest. Winners selected at random. 
            Terms and conditions apply.
          </p>
        </div>
      </footer>

      {showModal && <LoginModal onLogin={handleLogin} />}
    </div>
  );
}
