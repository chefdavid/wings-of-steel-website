import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaHandHoldingHeart, FaBuilding, FaQuoteLeft, FaEnvelope, FaPhone, FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';
import { URLTeamProvider } from '../contexts/URLTeamContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import DonationProgressBar from '../components/DonationProgressBar';
import DonationFormComponent from '../components/DonationForm';
import { supabase } from '../lib/supabaseClient';

const Donate = () => {
  const [searchParams] = useSearchParams();
  const preselectedAmount = searchParams.get('amount') ? parseInt(searchParams.get('amount')!, 10) : undefined;

  // SEO meta tags
  useEffect(() => {
    document.title = 'Donate to Wings of Steel Youth Sled Hockey | Support Adaptive Sports';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Support Wings of Steel youth sled hockey team. Your tax-deductible donation provides equipment, ice time, and opportunities for children with disabilities. 501(c)(3) nonprofit — no child pays to play.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Support Wings of Steel youth sled hockey team. Your tax-deductible donation provides equipment, ice time, and opportunities for children with disabilities. 501(c)(3) nonprofit — no child pays to play.';
      document.head.appendChild(meta);
    }
    return () => {
      document.title = 'Wings of Steel Youth Sled Hockey';
    };
  }, []);

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    interestArea: 'general',
    message: '',
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const impactTiers = [
    { amount: 80, item: 'Shin Pads', description: 'Provides shin pads for one player to stay protected on the ice', color: 'from-blue-500 to-blue-600', border: 'border-blue-400' },
    { amount: 120, item: 'Helmet, Gloves, or Shoulder Pads', description: 'Funds essential safety equipment for one athlete', color: 'from-teal-500 to-teal-600', border: 'border-teal-400' },
    { amount: 130, item: 'Hockey Sticks', description: 'Provides sticks for one player for the entire season', color: 'from-indigo-500 to-indigo-600', border: 'border-indigo-400' },
    { amount: 250, item: 'Practice Session', description: 'Covers one full team practice session including ice time', color: 'from-purple-500 to-purple-600', border: 'border-purple-400' },
    { amount: 300, item: 'Jerseys (Home & Away)', description: 'Provides a complete jersey set for one player', color: 'from-orange-500 to-orange-600', border: 'border-orange-400' },
    { amount: 900, item: 'Player Sled', description: 'Funds a complete sled for a new player joining the team', color: 'from-yellow-500 to-yellow-600', border: 'border-yellow-400' },
  ];

  const testimonials = [
    {
      quote: "When my son first got on the ice in his sled, he looked back at me with the biggest smile. For the first time, he was doing something just like every other kid. Wings of Steel gave him that.",
      author: 'Parent of a Wings of Steel player',
    },
    {
      quote: "These kids push harder than anyone I've ever coached. They don't see limitations — they see goals. Being part of this team has been the greatest honor of my coaching career.",
      author: 'Wings of Steel Coach',
    },
    {
      quote: "Sled hockey changed my life. I went from watching sports on TV to competing at nationals. My teammates are my family.",
      author: 'Wings of Steel Athlete',
    },
  ];

  const sponsorshipLevels = [
    { name: 'Bronze', amount: '$500', benefits: ['Logo on team website', 'Social media recognition', 'Tax-deductible receipt'], accent: 'border-amber-700', nameColor: 'text-amber-700', bg: 'bg-amber-700/10' },
    { name: 'Silver', amount: '$1,000', benefits: ['All Bronze benefits', 'Logo on team banner at events', 'Newsletter feature'], accent: 'border-gray-400', nameColor: 'text-gray-400', bg: 'bg-gray-400/10' },
    { name: 'Gold', amount: '$2,500', benefits: ['All Silver benefits', 'Logo on team jerseys', 'VIP access to team events'], accent: 'border-yellow-400', nameColor: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'Platinum', amount: '$5,000+', benefits: ['All Gold benefits', 'Title sponsor recognition', 'Custom partnership opportunities'], accent: 'border-cyan-300', nameColor: 'text-cyan-300', bg: 'bg-cyan-300/10' },
  ];

  const faqs = [
    {
      question: 'Is my donation tax-deductible?',
      answer: 'Yes! Wings of Steel is a registered 501(c)(3) nonprofit organization. You will receive a receipt via email that you can use for tax purposes. Our EIN is available upon request.',
    },
    {
      question: 'How much of my donation goes to the team?',
      answer: '100% of your donation goes directly to supporting our players. We cover all processing fees, so the full amount benefits our athletes through equipment, ice time, travel, and tournaments.',
    },
    {
      question: 'Can I donate in honor of a player?',
      answer: "Absolutely! When making your donation, you can select a player's name from the dropdown or type in a name. This is a great way for families and friends to support their athlete.",
    },
    {
      question: 'Can I make my donation anonymous?',
      answer: "Yes, there's an option to make your donation anonymous. Your name won't appear in any public donor lists, though we still need your contact info for the tax receipt.",
    },
    {
      question: 'How do I cancel a recurring donation?',
      answer: 'You can cancel your recurring donation at any time by contacting us at sjsledhockey@hotmail.com or by managing your subscription through the email receipt you receive.',
    },
    {
      question: 'Does my company offer donation matching?',
      answer: 'Many employers match charitable donations. Check with your HR department to see if your company participates in a matching gift program. This can double or even triple your impact!',
    },
    {
      question: 'Can I donate equipment instead of money?',
      answer: 'We appreciate equipment donations! However, sled hockey requires specialized adaptive equipment. Please contact us to discuss what we currently need — we can guide you on the most impactful way to help.',
    },
    {
      question: 'How do I get a tax receipt?',
      answer: 'A receipt is automatically sent to your email after each donation. If you need a year-end summary or have questions about your donations, contact Kristi Gonzales at sjsledhockey@hotmail.com.',
    },
  ];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryLoading(true);
    setInquiryError('');

    if (!inquiryForm.name || !inquiryForm.email) {
      setInquiryError('Please fill in your name and email.');
      setInquiryLoading(false);
      return;
    }

    try {
      // Insert into Supabase
      const { error: dbError } = await supabase
        .from('donation_inquiries')
        .insert({
          name: inquiryForm.name,
          email: inquiryForm.email,
          phone: inquiryForm.phone || null,
          company_name: inquiryForm.companyName || null,
          interest_area: inquiryForm.interestArea,
          message: inquiryForm.message || null,
        });

      if (dbError) {
        console.error('DB error:', dbError);
      }

      // Send notification emails via edge function
      const response = await supabase.functions.invoke('send-donation-inquiry', {
        body: {
          name: inquiryForm.name,
          email: inquiryForm.email,
          phone: inquiryForm.phone,
          companyName: inquiryForm.companyName,
          interestArea: inquiryForm.interestArea,
          message: inquiryForm.message,
        },
      });

      if (response.error) {
        console.error('Email error:', response.error);
      }

      setInquirySuccess(true);
      setInquiryForm({ name: '', email: '', phone: '', companyName: '', interestArea: 'general', message: '' });
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setInquiryError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setInquiryLoading(false);
    }
  };

  return (
    <URLTeamProvider>
      <div className="min-h-screen bg-dark-steel">
        <Navigation />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 px-4 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 bg-dark-steel">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/images/hero champion.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <FaHeart className="text-5xl md:text-6xl text-yellow-400 mx-auto mb-6" />
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-sport text-white mb-4">
                  Support Wings of Steel Youth Sled Hockey
                </h1>
                <p className="text-lg md:text-xl text-ice-blue mb-4 max-w-3xl mx-auto">
                  Your generous donation provides adaptive sports equipment, ice time, travel, and tournament entry
                  for children with disabilities. Together, we ensure that no child is left on the sidelines.
                </p>
                <p className="text-yellow-400 font-bold text-lg md:text-xl mb-8">
                  No Child Pays to Play — 100% of donations go directly to our players.
                </p>
                <a
                  href="#donate-form"
                  className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  <FaHeart />
                  Donate Now
                </a>
              </motion.div>
            </div>
          </section>

          {/* Donation Progress Bar */}
          <section className="py-8 px-4 bg-dark-steel">
            <div className="max-w-2xl mx-auto">
              <DonationProgressBar mode="full" />
            </div>
          </section>

          {/* Embedded Donation Form */}
          <section id="donate-form" className="py-12 md:py-16 px-4 bg-gradient-to-b from-dark-steel to-steel-gray">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-200"
              >
                <DonationFormComponent
                  initialAmount={preselectedAmount}
                  eventTag="general-donation"
                  embedded={true}
                />
              </motion.div>
            </div>
          </section>

          {/* What Your Donation Funds */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-gray-900 mb-4">
                  What Your Donation Funds
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Every dollar has a direct impact on our athletes. Here's exactly how your donation helps.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {impactTiers.map((tier, index) => (
                  <motion.a
                    key={tier.amount}
                    href={`/donate?amount=${tier.amount}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-xl p-6 border-2 ${tier.border} bg-gradient-to-br ${tier.color} text-white hover:shadow-xl hover:shadow-${tier.border}/20 transition-all transform hover:scale-105 block`}
                  >
                    <div className="text-4xl font-sport text-white mb-2">${tier.amount}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{tier.item}</h3>
                    <p className="text-white/80 text-sm">{tier.description}</p>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className="py-12 px-4 bg-dark-steel">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-sport text-white mb-6">
                Questions? Contact Us Directly
              </h2>
              <div className="bg-steel-gray rounded-xl p-8 border-2 border-steel-blue">
                <p className="text-white font-bold text-xl mb-4">Kristi Gonzales</p>
                <p className="text-ice-blue mb-1">Donation & Sponsorship Coordinator</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                  <a
                    href="tel:856-873-1300"
                    className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-lg"
                  >
                    <FaPhone />
                    (856) 873-1300
                  </a>
                  <a
                    href="mailto:kristigonzales1977@yahoo.com"
                    className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-lg"
                  >
                    <FaEnvelope />
                    kristigonzales1977@yahoo.com
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Why Your Support Matters */}
          <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-center mb-10">
                  <FaHandHoldingHeart className="text-5xl text-blue-600 mx-auto mb-4" />
                  <h2 className="text-3xl md:text-4xl font-sport text-gray-900 mb-4">
                    Why Your Support Matters
                  </h2>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg">
                  <ul className="space-y-4 text-gray-600 text-lg">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1 flex-shrink-0"><FaCheck /></span>
                      <span><strong className="text-gray-900">No Child Pays to Play:</strong> We provide all equipment, ice time, coaching, and travel at no cost to families.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1 flex-shrink-0"><FaCheck /></span>
                      <span><strong className="text-gray-900">501(c)(3) Nonprofit:</strong> Wings of Steel is a registered 501(c)(3) organization. All donations are tax-deductible.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1 flex-shrink-0"><FaCheck /></span>
                      <span><strong className="text-gray-900">100% Direct Impact:</strong> Every dollar goes directly to supporting our athletes — equipment, ice time, travel, and tournaments.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1 flex-shrink-0"><FaCheck /></span>
                      <span><strong className="text-gray-900">Championship Excellence:</strong> Your support helps us compete at the highest levels of USA Sled Hockey, including national championships.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1 flex-shrink-0"><FaCheck /></span>
                      <span><strong className="text-gray-900">Life-Changing Opportunities:</strong> Sled hockey builds confidence, teamwork, and friendships that last a lifetime for children with disabilities.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Corporate & Business Giving */}
          <section className="py-16 px-4 bg-steel-gray">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <FaBuilding className="text-5xl text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  Corporate & Business Giving
                </h2>
                <p className="text-ice-blue text-lg max-w-2xl mx-auto">
                  Partner with Wings of Steel and make a lasting impact in your community while showcasing your company's commitment to inclusion and adaptive sports.
                </p>
              </motion.div>

              {/* Matching Gifts */}
              <div className="bg-dark-steel rounded-xl p-8 border-2 border-yellow-400/30 mb-10">
                <h3 className="text-2xl font-sport text-yellow-400 mb-3">Employer Matching Gifts</h3>
                <p className="text-ice-blue text-lg">
                  Many companies match employee charitable contributions, doubling or even tripling your impact. Check with your HR department to see if your employer participates in a matching gift program. We're happy to provide any documentation needed.
                </p>
              </div>

              {/* Sponsorship Levels */}
              <h3 className="text-2xl font-sport text-white text-center mb-8">Sponsorship Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sponsorshipLevels.map((level, index) => (
                  <motion.div
                    key={level.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`${level.bg} rounded-xl p-6 border-2 ${level.accent} hover:shadow-lg transition-all`}
                  >
                    <div className={`${level.nameColor} font-sport text-2xl mb-1`}>{level.name}</div>
                    <div className="text-white font-bold text-xl mb-4">{level.amount}</div>
                    <ul className="space-y-2">
                      {level.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-ice-blue text-sm">
                          <FaCheck className={`${level.nameColor} mt-0.5 flex-shrink-0 text-xs`} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-10">
                <a
                  href="#inquiry-form"
                  className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-lg font-sport text-lg hover:bg-yellow-300 transition-all shadow-lg transform hover:scale-105"
                >
                  <FaBuilding />
                  Become a Corporate Sponsor
                </a>
              </div>
            </div>
          </section>

          {/* Player Stories / Testimonials */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-gray-900 mb-4">
                  Stories from Our Team
                </h2>
                <p className="text-gray-600 text-lg">
                  Hear from the families and athletes whose lives have been changed by your generosity.
                </p>
              </motion.div>

              <div className="space-y-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="bg-gray-50 rounded-xl p-8 border-l-4 border-blue-500 shadow-md relative"
                  >
                    <FaQuoteLeft className="text-blue-500/20 text-4xl absolute top-4 left-6" />
                    <p className="text-gray-700 text-lg italic pl-8 mb-4">
                      "{testimonial.quote}"
                    </p>
                    <p className="text-blue-600 font-semibold text-right">
                      — {testimonial.author}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Request More Information Form */}
          <section id="inquiry-form" className="py-16 px-4 bg-steel-gray">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-center mb-10">
                  <FaEnvelope className="text-5xl text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                    Request More Information
                  </h2>
                  <p className="text-ice-blue text-lg">
                    Have questions about donating, sponsorships, or how you can help? Send us a message and we'll get back to you promptly.
                  </p>
                </div>

                {inquirySuccess ? (
                  <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-8 text-center">
                    <FaCheck className="text-green-500 text-4xl mx-auto mb-4" />
                    <h3 className="text-2xl font-sport text-white mb-2">Thank You!</h3>
                    <p className="text-ice-blue">
                      We've received your inquiry and will be in touch soon. A confirmation has been sent to your email.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="bg-dark-steel rounded-xl p-8 border-2 border-steel-blue space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ice-blue mb-2">
                          Name <span className="text-yellow-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={inquiryForm.name}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-steel-gray border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ice-blue mb-2">
                          Email <span className="text-yellow-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 bg-steel-gray border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ice-blue mb-2">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 bg-steel-gray border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ice-blue mb-2">
                          Company Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={inquiryForm.companyName}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, companyName: e.target.value }))}
                          className="w-full px-4 py-3 bg-steel-gray border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ice-blue mb-2">
                        Area of Interest
                      </label>
                      <select
                        value={inquiryForm.interestArea}
                        onChange={(e) => setInquiryForm(prev => ({ ...prev, interestArea: e.target.value }))}
                        className="w-full px-4 py-3 bg-steel-gray border-2 border-steel-blue rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                      >
                        <option value="general">General Donation Information</option>
                        <option value="corporate">Corporate Sponsorship</option>
                        <option value="matching">Employer Matching Gifts</option>
                        <option value="equipment">Equipment Donation</option>
                        <option value="volunteer">Volunteering</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ice-blue mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-steel-gray border-2 border-steel-blue rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                        placeholder="Tell us how you'd like to help or any questions you have..."
                      />
                    </div>

                    {inquiryError && (
                      <div className="bg-red-600/20 border-2 border-red-500 rounded-lg p-4">
                        <p className="text-red-300">{inquiryError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={inquiryLoading}
                      className="w-full bg-yellow-400 text-black py-4 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                    >
                      {inquiryLoading ? 'Sending...' : 'Send Inquiry'}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </section>


          {/* FAQ Section */}
          <section className="py-16 px-4 bg-steel-gray">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                  Frequently Asked Questions
                </h2>
              </motion.div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-dark-steel rounded-lg border-2 border-steel-blue overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-steel-blue/10 transition-colors"
                    >
                      <h3 className="text-lg font-sport text-white pr-4">{faq.question}</h3>
                      {openFaq === index ? (
                        <FaChevronUp className="text-yellow-400 flex-shrink-0" />
                      ) : (
                        <FaChevronDown className="text-yellow-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-ice-blue">{faq.answer}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 px-4 bg-gradient-to-b from-steel-gray to-dark-steel">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-sport text-white mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-ice-blue text-lg mb-8">
                Every donation, no matter the size, helps a child with disabilities experience the joy of playing hockey.
              </p>
              <a
                href="#donate-form"
                className="inline-flex items-center gap-2 bg-yellow-400 text-black px-10 py-5 rounded-lg font-sport text-xl hover:bg-yellow-300 transition-all shadow-lg transform hover:scale-105"
              >
                <FaHeart />
                Donate Now
              </a>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </URLTeamProvider>
  );
};

export default Donate;
