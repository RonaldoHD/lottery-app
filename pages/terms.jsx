import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="page-container">
      {/* Header */}
      <header className="">
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
              <span className="text-xl font-bold text-[var(--text-white)]">Winzone</span>
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn-link flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="container-main py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-1 mb-4 sm:mb-6">Terms and Conditions</h1>
          <p className="text-body-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="card card-padding-lg space-y-6">
            <section>
              <h2 className="heading-3 mb-3">1. Acceptance of Terms</h2>
              <p className="text-body">
                By accessing and using WinZone ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">2. Eligibility</h2>
              <p className="text-body mb-3">
                To participate in any draw on WinZone, you must:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>Be legally capable of entering into binding contracts</li>
                <li>Reside in a jurisdiction where participation in online draws is legal</li>
                <li>Provide accurate and truthful information when creating an account or entering a draw</li>
                <li>Not be an employee, contractor, or immediate family member of WinZone or its affiliates</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">3. How It Works</h2>
              <p className="text-body mb-3">
                WinZone operates as a platform for prize draws:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>Participants pay an entry fee to enter a draw for a chance to win prizes</li>
                <li>Each draw has a specified entry fee, prize details, and end date</li>
                <li>Winners are selected randomly from all valid entries</li>
                <li>Entry fees are non-refundable once payment is processed</li>
                <li>All draws are conducted fairly and transparently</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">4. Entry Fees and Payments</h2>
              <p className="text-body mb-3">
                Entry fees are clearly displayed for each draw. By entering a draw, you agree to:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>Pay the specified entry fee in full</li>
                <li>Understand that entry fees are non-refundable except as required by law</li>
                <li>Accept that payment processing is handled by third-party payment providers</li>
                <li>Acknowledge that all transactions are final once confirmed</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">5. Winner Selection and Notification</h2>
              <p className="text-body mb-3">
                Winners are selected using a random selection process:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>Selection occurs after the draw end date and time</li>
                <li>Winners will be notified via the contact information provided during entry</li>
                <li>Winners must respond within 7 days of notification to claim their prize</li>
                <li>If a winner does not respond within the specified time, an alternate winner may be selected</li>
                <li>Winners may be required to provide proof of identity and eligibility</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">6. Prizes</h2>
              <p className="text-body mb-3">
                Prize details are specified for each draw:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>Prizes are as described in the draw listing</li>
                <li>WinZone reserves the right to substitute prizes of equal or greater value</li>
                <li>Prizes are non-transferable and cannot be exchanged for cash (unless stated otherwise)</li>
                <li>Winners are responsible for any taxes, duties, or fees associated with receiving prizes</li>
                <li>Delivery of prizes may take 14-30 business days after winner confirmation</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">7. Prohibited Conduct</h2>
              <p className="text-body mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>Use automated systems, bots, or scripts to enter draws</li>
                <li>Create multiple accounts to increase your chances of winning</li>
                <li>Provide false or misleading information</li>
                <li>Attempt to manipulate or interfere with the draw process</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">8. Account Termination</h2>
              <p className="text-body">
                WinZone reserves the right to suspend or terminate your account at any time if you violate these Terms and Conditions, engage in fraudulent activity, or for any other reason at our sole discretion. In such cases, you will not be entitled to a refund of any entry fees paid.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">9. Limitation of Liability</h2>
              <p className="text-body mb-3">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>WinZone is not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount of entry fees you have paid</li>
                <li>We do not guarantee that the Platform will be error-free or continuously available</li>
                <li>We are not responsible for third-party payment processing issues</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">10. Changes to Terms</h2>
              <p className="text-body">
                WinZone reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on the Platform. Your continued use of the Platform after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">11. Governing Law</h2>
              <p className="text-body">
                These Terms and Conditions are governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of the Platform will be subject to the exclusive jurisdiction of the courts in the jurisdiction where WinZone operates.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">12. Contact Information</h2>
              <p className="text-body">
                If you have any questions about these Terms and Conditions, please contact us through the Platform or via the contact information provided in our Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

