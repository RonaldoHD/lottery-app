import React, { useState } from 'react';
import { lotteryData } from '../data/lotteryData';

export default function LoginModal({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
          <div className="text-5xl mb-3">🎁</div>
          <h2 className="text-3xl font-bold mb-2">Enter to Win!</h2>
          <p className="text-blue-100">Join the contest in seconds</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <p className="text-gray-700 text-lg mb-2">
              <span className="font-bold text-blue-600">Create your account</span> to enter the lottery
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mt-3">
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-bold text-yellow-700">Entry Fee: ${lotteryData.entryFee.toFixed(2)}</span>
              </p>
              <p className="text-xs text-gray-600">
                One-time payment to enter the lottery
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              💳 Pay ${lotteryData.entryFee.toFixed(2)} & Enter Now
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start space-x-3 text-sm text-gray-600">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">What happens next?</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Instant entry into the lottery</li>
                  <li>• Chance to win {lotteryData.currentProduct.name}</li>
                  <li>• Secure payment processing</li>
                  <li>• Winner announced daily</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-center text-gray-500">
            By entering, you agree to our terms and conditions. 
            Must be 18+ to participate. Entry fee is non-refundable.
          </p>
        </div>
      </div>
    </div>
  );
}