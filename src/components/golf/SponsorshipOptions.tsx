import { motion } from 'framer-motion'
import { Star, Award, Medal, Target, Beer, Heart, Trophy, Users, Megaphone } from 'lucide-react'

const SponsorshipOptions = () => {
  const premiumSponsors = [
    {
      level: 'GOLD SPONSOR',
      price: '$2,700',
      icon: Star,
      color: 'bg-gradient-to-br from-yellow-500 to-amber-600',
      borderColor: 'border-yellow-500',
      benefits: [
        'Golf for 4 players',
        'Lunch & beverage sponsorship',
        'Premium signage at registration',
        'Logo on all event materials',
        'Social media recognition',
        'Recognition at dinner'
      ],
      featured: true
    },
    {
      level: 'SILVER SPONSOR',
      price: '$1,800',
      icon: Award,
      color: 'bg-gradient-to-br from-gray-400 to-gray-600',
      borderColor: 'border-gray-400',
      benefits: [
        'Golf for 4 players',
        'Lunch sponsorship recognition',
        'Signage at registration',
        'Logo on event website',
        'Social media recognition'
      ]
    },
    {
      level: 'BRONZE SPONSOR',
      price: '$1,000',
      icon: Medal,
      color: 'bg-gradient-to-br from-orange-600 to-orange-700',
      borderColor: 'border-orange-600',
      benefits: [
        'Golf for 2 players',
        'Beer sponsorship recognition',
        'Recognition in print materials',
        'Logo on event website',
        'Social media shout-out'
      ]
    }
  ]

  const additionalSponsors: Array<{
    level: string
    price: string
    icon: any
    image?: string
    description: string
    color: string
  }> = [
    {
      level: 'BEVERAGE CART',
      price: '$450',
      icon: Beer,
      description: 'Sponsor the on-course refreshments',
      color: 'from-amber-500 to-amber-600'
    },
    {
      level: 'CONTEST SPONSOR',
      price: '$250',
      icon: Target,
      description: 'Sponsor longest drive or closest to pin',
      color: 'from-purple-500 to-purple-600'
    },
    {
      level: 'HOLE SPONSOR',
      price: '$100',
      icon: Megaphone,
      description: 'Your signage on a tee box',
      color: 'from-green-500 to-green-600'
    },
    {
      level: "LET'S GO GOLFING",
      price: 'Join Us!',
      icon: null,
      image: '/images/tee-placement.jpg',
      description: 'Ready to tee off for a great cause',
      color: 'from-championship-gold to-yellow-600'
    },
    {
      level: 'TEAM REGISTRATION',
      price: '$640',
      icon: Users,
      description: 'Register a foursome to play',
      color: 'from-blue-500 to-blue-600'
    },
    {
      level: 'DONATION',
      price: 'Any Amount',
      icon: Heart,
      description: 'Support our mission directly',
      color: 'from-red-500 to-red-600'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Premium Sponsorship Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {premiumSponsors.map((sponsor, index) => {
          const Icon = sponsor.icon
          return (
            <motion.div
              key={sponsor.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {sponsor.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-championship-gold text-dark-steel px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg">
                    Best Value
                  </span>
                </div>
              )}
              
              <div className={`h-full bg-white rounded-xl shadow-2xl overflow-hidden border-2 ${sponsor.borderColor} ${
                sponsor.featured ? 'transform scale-105' : ''
              } flex flex-col`}>
                <div className={`${sponsor.color} p-8 text-white text-center`}>
                  <Icon className="mx-auto mb-4" size={56} />
                  <h3 className="text-3xl font-sport mb-2">{sponsor.level}</h3>
                  <p className="text-4xl font-bold">{sponsor.price}</p>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <ul className="space-y-4 mb-8 flex-1">
                    {sponsor.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full ${sponsor.featured ? 'bg-championship-gold hover:bg-yellow-500 text-dark-steel' : 'bg-steel-blue hover:bg-dark-steel text-white'} font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg`}>
                    Choose This Package
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Additional Sponsorship Options */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
        <h3 className="text-2xl font-sport text-white text-center mb-8">
          MORE WAYS TO SUPPORT
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {additionalSponsors.map((sponsor, index) => {
            const Icon = sponsor.icon
            
            // Special layout for Let's Go Golfing box
            if (sponsor.image) {
              return (
                <motion.div
                  key={sponsor.level}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="relative rounded-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] max-w-sm h-[200px]"
                  style={{
                    backgroundImage: `url(${sponsor.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  
                  {/* Content overlay */}
                  <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
                    <h4 className="font-sport text-3xl text-white mb-2 drop-shadow-lg">
                      {sponsor.level}
                    </h4>
                    <p className="text-white/90 text-lg font-semibold drop-shadow">
                      {sponsor.description}
                    </p>
                  </div>
                </motion.div>
              )
            }
            
            // Regular layout for other boxes
            return (
              <motion.div
                key={sponsor.level}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-white rounded-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] max-w-sm"
              >
                <div className="flex items-center mb-3">
                  <div className={`bg-gradient-to-r ${sponsor.color} p-3 rounded-lg text-white mr-4`}>
                    {Icon && <Icon size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-steel">{sponsor.level}</h4>
                    <p className="text-2xl font-bold text-dark-steel">
                      {sponsor.price}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{sponsor.description}</p>
                <button className="w-full mt-4 border-2 border-steel-blue text-steel-blue hover:bg-steel-blue hover:text-white font-semibold py-2 rounded transition-all">
                  Select
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <p className="text-white text-lg mb-4">
          All sponsorships are tax-deductible • Wings of Steel is a 501(c)(3) nonprofit
        </p>
        <p className="text-ice-blue text-xl font-semibold">
          Questions? Contact us at{' '}
          <a href="mailto:golf@wingsofsteel.org" className="underline hover:text-white transition-colors">
            golf@wingsofsteel.org
          </a>
        </p>
      </div>
    </div>
  )
}

export default SponsorshipOptions