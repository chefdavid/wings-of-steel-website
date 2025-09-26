import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle, FaUniversalAccess } from 'react-icons/fa';

const AccessibilityStatement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-dark-steel text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/" className="text-ice-blue hover:underline mb-4 inline-block" aria-label="Return to home page">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <FaUniversalAccess className="text-4xl text-ice-blue" aria-hidden="true" />
            <h1 className="text-4xl font-bold">Accessibility Statement</h1>
          </div>
          <p className="text-xl text-ice-blue">
            Wings of Steel is committed to ensuring digital accessibility for people with disabilities.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-12" aria-labelledby="commitment-heading">
          <h2 id="commitment-heading" className="text-2xl font-bold mb-4 text-dark-steel">Our Commitment</h2>
          <p className="mb-4 text-gray-700">
            Wings of Steel Youth Sled Hockey is deeply committed to making our website accessible to everyone,
            including individuals with disabilities. As a team that champions inclusivity on the ice, we extend
            this commitment to our digital presence. We continually work to improve the accessibility and
            usability of our website for all users, regardless of their abilities or the assistive technologies
            they use.
          </p>
          <p className="mb-4 text-gray-700">
            Our "No child pays to play" mission extends beyond financial barriers - we believe in removing all
            barriers that prevent participation in our sport and access to our information.
          </p>
        </section>

        <section className="mb-12" aria-labelledby="standards-heading">
          <h2 id="standards-heading" className="text-2xl font-bold mb-4 text-dark-steel">Accessibility Standards</h2>
          <p className="mb-4 text-gray-700">
            We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            These guidelines help make web content more accessible to people with various disabilities including:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-700">
            <li>Visual impairments</li>
            <li>Hearing impairments</li>
            <li>Physical disabilities</li>
            <li>Cognitive and neurological disabilities</li>
            <li>Speech disabilities</li>
          </ul>
        </section>

        <section className="mb-12" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl font-bold mb-4 text-dark-steel">Accessibility Features</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-green-700">
              <FaCheckCircle aria-hidden="true" />
              Implemented Features
            </h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Keyboard navigation support throughout the website</li>
              <li>Skip navigation links to quickly access main content</li>
              <li>Semantic HTML structure for better screen reader compatibility</li>
              <li>ARIA labels and landmarks for improved navigation</li>
              <li>Descriptive alt text for all informational images</li>
              <li>Focus indicators on all interactive elements</li>
              <li>Color contrast ratios meeting WCAG AA standards</li>
              <li>Responsive design for various screen sizes and devices</li>
              <li>Clear and simple language in our content</li>
              <li>Reduced motion options for users with vestibular disorders</li>
              <li>Form labels and error messages for better form navigation</li>
              <li>Consistent navigation and page layout</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-yellow-600">
              <FaExclamationTriangle aria-hidden="true" />
              Areas We're Improving
            </h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Video captions and audio descriptions for multimedia content</li>
              <li>Enhanced screen reader announcements for dynamic content updates</li>
              <li>Additional language translations</li>
              <li>PDF document accessibility</li>
            </ul>
          </div>
        </section>

        <section className="mb-12" aria-labelledby="assistance-heading">
          <h2 id="assistance-heading" className="text-2xl font-bold mb-4 text-dark-steel">Assistive Technologies</h2>
          <p className="mb-4 text-gray-700">
            Our website is designed to work with assistive technologies including:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-700">
            <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
            <li>Screen magnification software</li>
            <li>Voice recognition software</li>
            <li>Alternative input devices</li>
            <li>Browser zoom functionality (up to 200%)</li>
          </ul>
        </section>

        <section className="mb-12" aria-labelledby="feedback-heading">
          <h2 id="feedback-heading" className="text-2xl font-bold mb-4 text-dark-steel">Feedback & Contact</h2>
          <p className="mb-6 text-gray-700">
            We welcome your feedback on the accessibility of our website. If you encounter any barriers or
            have suggestions for improvement, please contact us:
          </p>

          <div className="bg-white p-6 rounded-lg shadow-md border border-steel-blue/20">
            <h3 className="font-semibold text-lg mb-4 text-dark-steel">Accessibility Coordinator</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-steel-blue" aria-hidden="true" />
                <span>
                  Email: <a href="mailto:accessibility@wingsofsteel.org" className="text-steel-blue hover:underline">
                    accessibility@wingsofsteel.org
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-steel-blue" aria-hidden="true" />
                <span>Phone: Available through main contact form</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              We aim to respond to accessibility feedback within 2 business days and to propose a solution
              within 10 business days.
            </p>
          </div>
        </section>

        <section className="mb-12" aria-labelledby="limitations-heading">
          <h2 id="limitations-heading" className="text-2xl font-bold mb-4 text-dark-steel">Known Limitations</h2>
          <p className="mb-4 text-gray-700">
            While we strive for accessibility across our entire website, some third-party content or features
            may have limitations:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-700">
            <li>Some older PDF documents may not be fully accessible</li>
            <li>Third-party payment processing systems may have their own accessibility standards</li>
            <li>Social media embeds may not meet all accessibility guidelines</li>
            <li>Live streaming content may not have real-time captions</li>
          </ul>
          <p className="text-gray-700">
            We are actively working with our partners to address these limitations where possible.
          </p>
        </section>

        <section className="mb-12" aria-labelledby="legal-heading">
          <h2 id="legal-heading" className="text-2xl font-bold mb-4 text-dark-steel">Legal Requirements</h2>
          <p className="mb-4 text-gray-700">
            This accessibility statement is in compliance with:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-700">
            <li>Americans with Disabilities Act (ADA)</li>
            <li>Section 508 of the Rehabilitation Act</li>
            <li>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
          </ul>
        </section>

        <section aria-labelledby="update-heading">
          <h2 id="update-heading" className="text-2xl font-bold mb-4 text-dark-steel">Statement Update</h2>
          <p className="text-gray-700">
            This accessibility statement was last updated on {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}.
          </p>
          <p className="mt-2 text-gray-700">
            We review and update this statement regularly as we continue to improve the accessibility of our website.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark-steel text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="mb-2">Wings of Steel Youth Sled Hockey</p>
          <p className="text-ice-blue text-sm">Breaking Barriers & Building Champions - On and Off the Ice</p>
        </div>
      </footer>
    </div>
  );
};

export default AccessibilityStatement;