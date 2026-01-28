import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaHandHoldingHeart } from 'react-icons/fa';
import { URLTeamProvider } from '../contexts/URLTeamContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import DonationProgressBar from '../components/DonationProgressBar';
import { useDonationModal } from '../contexts/DonationModalContext';

const Donate = () => {
  const { openModal } = useDonationModal();

  // Open modal on page load (if coming from a link with ?open=modal)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open') === 'modal') {
      openModal();
      window.history.replaceState({}, '', '/donate');
    }
  }, [openModal]);

  const impactMessages = [
    { amount: 80, text: 'Provides shin pads for one player' },
    { amount: 120, text: 'Funds a helmet, gloves, or shoulder pads' },
    { amount: 130, text: 'Provides sticks for one player' },
    { amount: 250, text: 'Covers one team practice session' },
    { amount: 300, text: 'Provides jerseys (home & away) for one player' },
    { amount: 900, text: 'Funds a sled for a new player' },
  ];

  return (
    <URLTeamProvider>
      <div className="min-h-screen bg-dark-steel">
        <Navigation />

        <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-b from-dark-steel via-steel-gray to-dark-steel">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <FaHeart className="text-6xl text-yellow-400 mx-auto mb-6" />
              <h1 className="text-4xl md:text-6xl font-sport text-white mb-4">
                Support Wings of Steel
              </h1>
              <p className="text-xl md:text-2xl text-ice-blue mb-8">
                Your donation helps us provide equipment, ice time, and support to athletes with disabilities.
                <br />
                <span className="text-yellow-400 font-bold">100% of donations go directly to our players.</span>
              </p>

              {/* Progress Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <DonationProgressBar mode="full" />
              </div>

              <button
                onClick={() => openModal()}
                className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto transform hover:scale-105"
              >
                <FaHeart />
                Donate Now
              </button>
            </motion.div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-16 px-4 bg-steel-gray">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-sport text-center text-white mb-12">
              Your Donation Makes a Difference
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {impactMessages.map((item, index) => (
                <motion.button
                  key={item.amount}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => openModal(item.amount)}
                  className="bg-dark-steel backdrop-blur-sm rounded-lg p-6 border-2 border-steel-blue hover:border-yellow-400 transition-all transform hover:scale-105 text-left cursor-pointer"
                >
                  <div className="text-4xl font-sport text-yellow-400 mb-2">${item.amount}</div>
                  <p className="text-ice-blue">{item.text}</p>
                </motion.button>
              ))}
            </div>

            <div className="bg-dark-steel rounded-lg p-8 border-2 border-steel-blue">
              <h3 className="text-2xl md:text-3xl font-sport text-white mb-4 flex items-center gap-2">
                <FaHandHoldingHeart className="text-yellow-400" />
                Why Your Support Matters
              </h3>
              <ul className="space-y-3 text-ice-blue">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span><strong>No Child Pays to Play:</strong> We provide all equipment and ice time at no cost to families</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span><strong>Tax-Deductible:</strong> Wings of Steel is a 501(c)(3) nonprofit organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span><strong>100% Direct Impact:</strong> Every dollar goes directly to supporting our athletes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span><strong>Championship Team:</strong> Help us continue our winning tradition and competitive excellence</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Recurring Donations Section - Prominent */}
        <section className="py-20 px-4 bg-gradient-to-b from-dark-steel via-steel-blue/10 to-dark-steel border-y-2 border-steel-blue">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <FaHeart className="text-6xl text-yellow-400 mx-auto mb-4" />
              <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-lg px-4 py-2 inline-block mb-4">
                <span className="text-yellow-400 font-bold text-sm">⭐ RECOMMENDED</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-sport text-white mb-4">
              Monthly Recurring Donations
            </h2>
            <p className="text-xl text-ice-blue mb-6 max-w-2xl mx-auto font-medium">
              Provide consistent support throughout the season. Monthly donations help us plan ahead and ensure our players always have what they need.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-dark-steel border-2 border-steel-blue rounded-lg p-4">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-ice-blue text-sm">Cancel anytime</p>
              </div>
              <div className="bg-dark-steel border-2 border-steel-blue rounded-lg p-4">
                <div className="text-2xl mb-2">💪</div>
                <p className="text-ice-blue text-sm">More impact</p>
              </div>
              <div className="bg-dark-steel border-2 border-steel-blue rounded-lg p-4">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-ice-blue text-sm">Set & forget</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-yellow-400 text-black px-10 py-5 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Monthly Donation
            </button>
            <p className="text-ice-blue text-sm mt-4">
              You can modify or cancel your monthly donation at any time
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-steel-gray">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-sport text-center text-white mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-dark-steel backdrop-blur-sm rounded-lg p-6 border-2 border-steel-blue">
                <h3 className="text-xl font-sport text-white mb-2">Is my donation tax-deductible?</h3>
                <p className="text-ice-blue">
                  Yes! Wings of Steel is a 501(c)(3) nonprofit organization. You will receive a receipt via email that you can use for tax purposes.
                </p>
              </div>

              <div className="bg-dark-steel backdrop-blur-sm rounded-lg p-6 border-2 border-steel-blue">
                <h3 className="text-xl font-sport text-white mb-2">How much of my donation goes to the team?</h3>
                <p className="text-ice-blue">
                  100% of your donation goes directly to supporting our players. We cover all processing fees, so the full amount benefits our athletes.
                </p>
              </div>

              <div className="bg-dark-steel backdrop-blur-sm rounded-lg p-6 border-2 border-steel-blue">
                <h3 className="text-xl font-sport text-white mb-2">Can I donate in honor of a player?</h3>
                <p className="text-ice-blue">
                  Absolutely! When making your donation, you can select a player's name from the dropdown or type in a name. This is a great way for families to support their athlete.
                </p>
              </div>

              <div className="bg-dark-steel backdrop-blur-sm rounded-lg p-6 border-2 border-steel-blue">
                <h3 className="text-xl font-sport text-white mb-2">Can I make my donation anonymous?</h3>
                <p className="text-ice-blue">
                  Yes, there's an option to make your donation anonymous. Your name won't appear in any public donor lists.
                </p>
              </div>

              <div className="bg-dark-steel backdrop-blur-sm rounded-lg p-6 border-2 border-steel-blue">
                <h3 className="text-xl font-sport text-white mb-2">How do I cancel a recurring donation?</h3>
                <p className="text-ice-blue">
                  You can cancel your recurring donation at any time by contacting us at info@WingsofSteel.org or by managing your subscription through the email receipt you receive.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </URLTeamProvider>
  );
};

export default Donate;
