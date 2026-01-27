import { motion } from 'framer-motion'
import { Target, Zap, DollarSign, Gift, Users } from 'lucide-react'

const ContestSection = () => {
  const contests = [
    {
      title: 'Longest Drive',
      icon: Zap,
      description: 'Show off your power game',
      details: 'Separate contests for men and women with premium prizes.',
      color: 'from-steel-blue to-dark-steel'
    },
    {
      title: 'Closest to Pin',
      icon: Target,
      description: 'Precision pays off',
      details: 'Test your accuracy on our signature par 3 holes.',
      color: 'from-green-500 to-green-700'
    },
    {
      title: '50/50 Raffle',
      icon: DollarSign,
      description: 'Win half the pot!',
      details: 'Winner takes home 50% of all raffle proceeds.',
      color: 'from-red-500 to-red-700'
    },
    {
      title: 'Basket Auction',
      icon: Gift,
      description: 'Premium prizes & experiences',
      details: 'Bid on vacation packages, signed memorabilia, and more!',
      color: 'from-indigo-500 to-indigo-700'
    }
  ]

  const fundraisers = [
    {
      title: 'Mulligans',
      description: '$5 each — no limit!',
      icon: '🎯'
    }
  ]

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="font-sport text-5xl text-center text-dark-steel mb-12">
          CONTESTS & CHALLENGES
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {contests.map((contest, index) => {
            const Icon = contest.icon
            return (
              <motion.div
                key={contest.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${contest.color} p-4`}>
                  <Icon className="text-white mx-auto" size={40} />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">{contest.title}</h3>
                  <p className="text-championship-gold font-semibold mb-2">
                    {contest.description}
                  </p>
                  <p className="text-gray-600 text-sm">{contest.details}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="bg-gradient-to-r from-dark-steel to-steel-gray rounded-lg p-8 text-white">
          <h3 className="font-sport text-3xl text-center mb-8">
            FUNDRAISER ADD-ONS
          </h3>
          <div className="flex justify-center gap-6">
            {fundraisers.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-white/90">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <motion.div
            className="inline-block bg-white rounded-lg shadow-lg p-6"
            whileHover={{ scale: 1.05 }}
          >
            <Users className="mx-auto text-steel-blue mb-4" size={48} />
            <h3 className="font-bold text-2xl text-dark-steel mb-2">
              Can't Golf? You Can Still Help!
            </h3>
            <p className="text-gray-700 mb-4 max-w-md">
              Join us for dinner only ($50), volunteer at the event, 
              or make a direct donation to support our athletes.
            </p>
            <button className="bg-championship-gold hover:bg-yellow-500 text-dark-steel font-bold py-3 px-6 rounded-lg transition-all">
              Other Ways to Contribute
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContestSection