import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';

export default function PrivacyPage() {
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
          <h1 className="heading-1 mb-4 sm:mb-6">Privacy Policy</h1>
          <p className="text-body-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="card card-padding-lg space-y-6">
            <section>
              <h2 className="heading-3 mb-3">1. Introduction</h2>
              <p className="text-body">
                WinZone ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and participate in prize draws.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">2. Information We Collect</h2>
              <p className="text-body mb-3">
                We collect information that you provide directly to us:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and any other information you provide when entering a draw</li>
                <li><strong>Payment Information:</strong> Payment details processed through secure third-party payment providers (we do not store full credit card information)</li>
                <li><strong>Account Information:</strong> Username, password, and account preferences</li>
                <li><strong>Communication Data:</strong> Records of correspondence when you contact us</li>
              </ul>
              <p className="text-body mt-3 mb-3">
                We also automatically collect certain information:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li><strong>Usage Data:</strong> How you interact with our Platform, pages visited, time spent</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                <li><strong>Cookies and Tracking:</strong> Information collected through cookies and similar technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">3. How We Use Your Information</h2>
              <p className="text-body mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>Process and manage your draw entries</li>
                <li>Process payments and verify transactions</li>
                <li>Notify winners and facilitate prize delivery</li>
                <li>Send you important updates about draws you've entered</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our Platform and user experience</li>
                <li>Detect and prevent fraud, abuse, and illegal activity</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent, which you can opt out of at any time)</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">4. Information Sharing and Disclosure</h2>
              <p className="text-body mb-3">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With third-party service providers who perform services on our behalf (payment processing, hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
                <li><strong>With Your Consent:</strong> When you explicitly consent to sharing your information</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-3 mb-3">5. Data Security</h2>
              <p className="text-body">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">6. Data Retention</h2>
              <p className="text-body">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">7. Your Rights and Choices</h2>
              <p className="text-body mb-3">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
              </ul>
              <p className="text-body mt-3">
                To exercise these rights, please contact us using the contact information provided below.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">8. Cookies and Tracking Technologies</h2>
              <p className="text-body mb-3">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside text-body space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our Platform</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve security and prevent fraud</li>
              </ul>
              <p className="text-body mt-3">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our Platform.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">9. Third-Party Links</h2>
              <p className="text-body">
                Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party websites you visit.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">10. Children's Privacy</h2>
              <p className="text-body">
                Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">11. International Data Transfers</h2>
              <p className="text-body">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our Platform, you consent to the transfer of your information to these countries.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">12. Changes to This Privacy Policy</h2>
              <p className="text-body">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Platform after changes are posted constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="heading-3 mb-3">13. Contact Us</h2>
              <p className="text-body mb-3">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-[var(--winzone-purple-light)]/30 border border-[var(--winzone-purple-light)] rounded-xl p-4">
                <p className="text-body">
                  <strong>WinZone Privacy Team</strong><br />
                  Email: privacy@winzone.com<br />
                  Platform: Contact us through the Platform
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

