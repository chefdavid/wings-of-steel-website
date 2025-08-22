import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, ShoppingCart, AlertCircle, Check } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

interface Player {
  firstName: string
  lastName: string
  nickname: string
  email: string
  shirtSize: string
  sendConfirmation: boolean
}

interface GolfRegistrationFormProps {
  earlyBirdDate: Date
  spotsRemaining: number
  setSpotsRemaining: (spots: number) => void
}

const GolfRegistrationForm: React.FC<GolfRegistrationFormProps> = ({ 
  earlyBirdDate, 
  spotsRemaining,
  setSpotsRemaining 
}) => {
  const [numPlayers, setNumPlayers] = useState(4)
  const [players, setPlayers] = useState<Player[]>(
    Array(4).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      nickname: '',
      email: '',
      shirtSize: 'L',
      sendConfirmation: false
    }))
  )
  const [captainInfo, setCaptainInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: ''
  })
  const [mulligans, setMulligans] = useState({
    player1: 0,
    player2: 0,
    player3: 0,
    player4: 0
  })
  const [addOns, setAddOns] = useState({
    dinnerGuests: 0,
    raffleTickets: 0,
    sponsorHole: false,
    beatThePro: 0,
    skinsGame: 0
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const isEarlyBird = new Date() < earlyBirdDate
  const basePrice = isEarlyBird ? 140 : 160 // $20 early bird discount
  
  // Calculate pricing
  const getTeamPrice = () => {
    const prices = {
      1: basePrice,
      2: isEarlyBird ? 260 : 320, // Save $20 for 2
      3: isEarlyBird ? 390 : 480, // Save $30 for 3
      4: isEarlyBird ? 520 : 640  // Save $40 for 4
    }
    return prices[numPlayers as keyof typeof prices] || 0
  }

  const calculateTotal = () => {
    let total = getTeamPrice()
    
    // Add mulligans ($10 each, max 4 per player)
    const totalMulligans = Object.values(mulligans).reduce((sum, count) => sum + count, 0)
    total += totalMulligans * 10
    
    // Add-ons
    total += addOns.dinnerGuests * 50
    total += addOns.raffleTickets * 20
    total += addOns.sponsorHole ? 100 : 0
    total += addOns.beatThePro * 20
    total += addOns.skinsGame * 25
    
    return total
  }

  const handlePlayerChange = (index: number, field: keyof Player, value: any) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const handleMulliganChange = (player: string, delta: number) => {
    setMulligans(prev => {
      const current = prev[player as keyof typeof prev]
      const newValue = Math.max(0, Math.min(4, current + delta))
      return { ...prev, [player]: newValue }
    })
  }

  // Helper function to log failed attempts
  const logFailedAttempt = async (errorMessage: string, errorType: string) => {
    try {
      const attemptData = {
        captain_info: captainInfo,
        players: players.slice(0, numPlayers),
        mulligans,
        add_ons: addOns,
        total_amount: calculateTotal(),
        is_early_bird: isEarlyBird,
        error_message: errorMessage,
        error_type: errorType,
        browser_info: navigator.userAgent
      }

      await supabase
        .from('golf_registration_attempts')
        .insert([attemptData])
      
      // We don't await or check errors here - this is fire-and-forget logging
    } catch (logError) {
      console.error('Failed to log registration attempt:', logError)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation checks first
      if (!captainInfo.firstName || !captainInfo.lastName || !captainInfo.email || !captainInfo.phone) {
        const validationError = 'Please fill in all required captain information'
        await logFailedAttempt(validationError, 'validation')
        setError(validationError)
        setLoading(false)
        return
      }

      // Check if all player info is filled
      for (let i = 0; i < numPlayers; i++) {
        if (!players[i].firstName || !players[i].lastName) {
          const playerError = `Please fill in all required information for Golfer ${i + 1}`
          await logFailedAttempt(playerError, 'validation')
          setError(playerError)
          setLoading(false)
          return
        }
      }

      // Prepare registration data
      const registrationData = {
        captain_info: captainInfo,
        players: players.slice(0, numPlayers),
        mulligans,
        add_ons: addOns,
        total_amount: calculateTotal(),
        is_early_bird: isEarlyBird,
        registration_date: new Date().toISOString()
      }

      // Insert into Supabase
      const { data, error: dbError } = await supabase
        .from('golf_registrations')
        .insert([registrationData])
        .select()

      if (dbError) {
        await logFailedAttempt(dbError.message, 'database')
        throw dbError
      }

      // Send confirmation emails
      const emailPromises = []
      
      // Captain email
      emailPromises.push(
        supabase.functions.invoke('send-golf-confirmation', {
          body: {
            to: captainInfo.email,
            registrationId: data[0].id,
            isCaptain: true
          }
        })
      )

      // Individual player emails if requested
      players.slice(0, numPlayers).forEach((player, index) => {
        if (player.sendConfirmation && player.email) {
          emailPromises.push(
            supabase.functions.invoke('send-golf-confirmation', {
              body: {
                to: player.email,
                registrationId: data[0].id,
                playerName: `${player.firstName} ${player.lastName}`
              }
            })
          )
        }
      })

      try {
        await Promise.all(emailPromises)
      } catch (emailError: any) {
        // Log email failure but don't fail the registration
        await logFailedAttempt(`Email sending failed: ${emailError.message}`, 'email')
        console.error('Email sending failed:', emailError)
        // Registration is still successful, just email failed
      }

      setSuccess(true)
      setSpotsRemaining(spotsRemaining - 1)
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setSuccess(false)
        // Reset all form fields
        setNumPlayers(4)
        setPlayers(Array(4).fill(null).map(() => ({
          firstName: '',
          lastName: '',
          nickname: '',
          email: '',
          shirtSize: 'L',
          sendConfirmation: false
        })))
        setCaptainInfo({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: ''
        })
        setMulligans({ player1: 0, player2: 0, player3: 0, player4: 0 })
        setAddOns({
          dinnerGuests: 0,
          raffleTickets: 0,
          sponsorHole: false,
          beatThePro: 0,
          skinsGame: 0
        })
      }, 5000)
    } catch (err: any) {
      console.error('Registration error:', err)
      // Log the failed attempt with error details
      await logFailedAttempt(err.message || 'Unknown error occurred', 'other')
      setError('Registration failed. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div 
        className="max-w-2xl mx-auto bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Check className="mx-auto text-green-500 mb-4" size={64} />
        <h3 className="text-3xl font-sport text-green-700 mb-4">Registration Complete!</h3>
        <p className="text-lg text-gray-700 mb-4">
          Thank you for registering for the Tom Brake Memorial Golf Outing!
        </p>
        <p className="text-gray-600">
          A confirmation email has been sent with your registration details and payment instructions.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Captain Information */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-bold text-dark-steel mb-4">Team Captain Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name*"
            required
            value={captainInfo.firstName}
            onChange={(e) => setCaptainInfo({...captainInfo, firstName: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
          />
          <input
            type="text"
            placeholder="Last Name*"
            required
            value={captainInfo.lastName}
            onChange={(e) => setCaptainInfo({...captainInfo, lastName: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
          />
          <input
            type="email"
            placeholder="Email*"
            required
            value={captainInfo.email}
            onChange={(e) => setCaptainInfo({...captainInfo, email: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
          />
          <input
            type="tel"
            placeholder="Phone*"
            required
            value={captainInfo.phone}
            onChange={(e) => setCaptainInfo({...captainInfo, phone: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
          />
          <input
            type="text"
            placeholder="Company (Optional)"
            value={captainInfo.company}
            onChange={(e) => setCaptainInfo({...captainInfo, company: e.target.value})}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue md:col-span-2"
          />
        </div>
      </div>

      {/* Number of Players - Redesigned */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
        <h3 className="text-2xl font-bold text-dark-steel mb-6 text-center">Select Your Team Size</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(num => (
            <motion.button
              key={num}
              type="button"
              onClick={() => setNumPlayers(num)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-6 rounded-xl font-bold transition-all border-2 ${
                numPlayers === num 
                  ? 'bg-gradient-to-br from-steel-blue to-dark-steel text-white border-steel-blue shadow-xl' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-steel-blue'
              }`}
            >
              <div className="text-3xl mb-2">{num === 1 ? '🏌️' : num === 2 ? '🏌️🏌️' : num === 3 ? '🏌️🏌️🏌️' : '🏌️🏌️🏌️🏌️'}</div>
              <div className="text-2xl font-sport mb-1">{num}</div>
              <div className="text-sm">{num === 1 ? 'Golfer' : 'Golfers'}</div>
              <div className={`text-xs mt-2 ${numPlayers === num ? 'text-ice-blue' : 'text-gray-500'}`}>
                ${isEarlyBird ? (num === 1 ? 140 : num === 2 ? 260 : num === 3 ? 390 : 520) : 
                   (num === 1 ? 160 : num === 2 ? 320 : num === 3 ? 480 : 640)}
              </div>
              {numPlayers === num && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-championship-gold text-dark-steel rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Pricing Display */}
        <div className="bg-white rounded-lg p-4 border-2 border-championship-gold">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Selected Package:</p>
              <p className="text-lg font-semibold text-dark-steel">
                {numPlayers} {numPlayers === 1 ? 'Golfer' : 'Golfers'} Registration
              </p>
            </div>
            <div className="text-right">
              {isEarlyBird && (
                <p className="text-sm text-championship-gold font-semibold line-through">
                  ${numPlayers * 160}
                </p>
              )}
              <p className="text-3xl font-bold text-steel-blue">
                ${getTeamPrice()}
              </p>
              {isEarlyBird && (
                <p className="text-xs text-championship-gold font-semibold">
                  Save ${(numPlayers * 160) - getTeamPrice()}!
                </p>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          <span className="font-semibold">Note:</span> Teams can have 1-4 players. 
          We'll pair smaller groups with others to form complete foursomes.
        </p>
      </div>

      {/* Player Information - Redesigned */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h3 className="text-2xl font-bold text-dark-steel mb-6 text-center">Player Information</h3>
        
        <AnimatePresence mode="wait">
          <div className="space-y-6">
            {Array.from({ length: numPlayers }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 hover:border-steel-blue transition-colors"
              >
                <div className="absolute -top-3 left-4 bg-steel-blue text-white px-3 py-1 rounded-full text-sm font-bold">
                  Golfer {index + 1}
                </div>
                
                {/* Same as Team Captain checkbox - show for all players if captain info is filled */}
                {captainInfo.firstName && captainInfo.lastName && (
                  <div className="mt-2 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            handlePlayerChange(index, 'firstName', captainInfo.firstName)
                            handlePlayerChange(index, 'lastName', captainInfo.lastName)
                            handlePlayerChange(index, 'email', captainInfo.email)
                          } else {
                            handlePlayerChange(index, 'firstName', '')
                            handlePlayerChange(index, 'lastName', '')
                            handlePlayerChange(index, 'email', '')
                          }
                        }}
                        checked={players[index].firstName === captainInfo.firstName && 
                                players[index].lastName === captainInfo.lastName &&
                                players[index].email === captainInfo.email}
                        className="w-4 h-4 text-steel-blue"
                      />
                      <span className="text-sm font-semibold text-steel-blue">Same as Team Captain</span>
                    </label>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <input
                  type="text"
                  placeholder="First Name*"
                  required
                  value={players[index].firstName}
                  onChange={(e) => handlePlayerChange(index, 'firstName', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
                />
                <input
                  type="text"
                  placeholder="Last Name*"
                  required
                  value={players[index].lastName}
                  onChange={(e) => handlePlayerChange(index, 'lastName', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
                />
                <input
                  type="text"
                  placeholder="Nickname (Optional)"
                  value={players[index].nickname}
                  onChange={(e) => handlePlayerChange(index, 'nickname', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
                />
                <select
                  value={players[index].shirtSize}
                  onChange={(e) => handlePlayerChange(index, 'shirtSize', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
                >
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                  <option value="XL">X-Large</option>
                  <option value="2XL">2X-Large</option>
                  <option value="3XL">3X-Large</option>
                </select>
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={players[index].email}
                  onChange={(e) => handlePlayerChange(index, 'email', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={players[index].sendConfirmation}
                    onChange={(e) => handlePlayerChange(index, 'sendConfirmation', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Send confirmation to this player</span>
                </label>
              </div>
              
              {/* Mulligans for this player */}
              <div className="mt-3 flex items-center space-x-4">
                <span className="font-semibold">Mulligans ($10 each, max 4):</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleMulliganChange(`player${index + 1}`, -1)}
                    className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-bold text-xl w-8 text-center">
                    {mulligans[`player${index + 1}` as keyof typeof mulligans]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMulliganChange(`player${index + 1}`, 1)}
                    className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </AnimatePresence>
      </div>

      {/* Add-Ons */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-bold text-dark-steel mb-4">Enhance Your Experience</h3>
        
        <div className="space-y-4">
          {/* Featured Hole Sponsorship */}
          <div className="bg-yellow-50 border-2 border-championship-gold rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⛳</span>
                  <h4 className="font-bold text-lg text-dark-steel">Hole Sponsorship – $100</h4>
                  <span className="bg-championship-gold text-dark-steel text-xs font-bold px-2 py-1 rounded-full uppercase">Popular!</span>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  Put your business front and center with custom signage on the course. Every golfer will see your support for Wings of Steel while playing their round.
                </p>
                <p className="text-xs text-green-700 font-semibold mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Tax Deductible • High Visibility • Support Youth Hockey
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={addOns.sponsorHole}
                  onChange={(e) => setAddOns({...addOns, sponsorHole: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-championship-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-championship-gold"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">{addOns.sponsorHole ? 'Added!' : 'Add'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Extra Dinner Guests</h4>
              <p className="text-sm text-gray-600">$50 per guest</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAddOns({...addOns, dinnerGuests: Math.max(0, addOns.dinnerGuests - 1)})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
              >
                <Minus size={20} />
              </button>
              <span className="font-bold text-xl w-8 text-center">{addOns.dinnerGuests}</span>
              <button
                type="button"
                onClick={() => setAddOns({...addOns, dinnerGuests: addOns.dinnerGuests + 1})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">50/50 Raffle Tickets</h4>
              <p className="text-sm text-gray-600">$20 for 10 tickets</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAddOns({...addOns, raffleTickets: Math.max(0, addOns.raffleTickets - 1)})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
              >
                <Minus size={20} />
              </button>
              <span className="font-bold text-xl w-8 text-center">{addOns.raffleTickets}</span>
              <button
                type="button"
                onClick={() => setAddOns({...addOns, raffleTickets: addOns.raffleTickets + 1})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">"Beat the Pro" Challenge</h4>
              <p className="text-sm text-gray-600">$20 per attempt</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAddOns({...addOns, beatThePro: Math.max(0, addOns.beatThePro - 1)})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
              >
                <Minus size={20} />
              </button>
              <span className="font-bold text-xl w-8 text-center">{addOns.beatThePro}</span>
              <button
                type="button"
                onClick={() => setAddOns({...addOns, beatThePro: addOns.beatThePro + 1})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Skins Game Entry</h4>
              <p className="text-sm text-gray-600">$25 per player</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAddOns({...addOns, skinsGame: Math.max(0, addOns.skinsGame - 1)})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
              >
                <Minus size={20} />
              </button>
              <span className="font-bold text-xl w-8 text-center">{addOns.skinsGame}</span>
              <button
                type="button"
                onClick={() => setAddOns({...addOns, skinsGame: Math.min(numPlayers, addOns.skinsGame + 1)})}
                className="bg-gray-300 hover:bg-gray-400 p-1 rounded"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gradient-to-r from-steel-blue to-dark-steel text-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <ShoppingCart className="mr-2" /> Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{numPlayers} Player{numPlayers > 1 ? 's' : ''} Registration</span>
            <span>${getTeamPrice()}</span>
          </div>
          {Object.values(mulligans).reduce((sum, count) => sum + count, 0) > 0 && (
            <div className="flex justify-between">
              <span>Mulligans ({Object.values(mulligans).reduce((sum, count) => sum + count, 0)} × $10)</span>
              <span>${Object.values(mulligans).reduce((sum, count) => sum + count, 0) * 10}</span>
            </div>
          )}
          {addOns.dinnerGuests > 0 && (
            <div className="flex justify-between">
              <span>Extra Dinner Guests ({addOns.dinnerGuests} × $50)</span>
              <span>${addOns.dinnerGuests * 50}</span>
            </div>
          )}
          {addOns.raffleTickets > 0 && (
            <div className="flex justify-between">
              <span>Raffle Tickets ({addOns.raffleTickets} × $20)</span>
              <span>${addOns.raffleTickets * 20}</span>
            </div>
          )}
          {addOns.beatThePro > 0 && (
            <div className="flex justify-between">
              <span>Beat the Pro ({addOns.beatThePro} × $20)</span>
              <span>${addOns.beatThePro * 20}</span>
            </div>
          )}
          {addOns.skinsGame > 0 && (
            <div className="flex justify-between">
              <span>Skins Game ({addOns.skinsGame} × $25)</span>
              <span>${addOns.skinsGame * 25}</span>
            </div>
          )}
          {addOns.sponsorHole && (
            <div className="flex justify-between">
              <span>Hole Sponsorship</span>
              <span>$100</span>
            </div>
          )}
          <div className="border-t pt-2 mt-4">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-white/20 rounded p-3">
          <p className="text-sm flex items-start">
            <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
            Payment instructions will be provided in your confirmation email. 
            We accept checks, credit cards, and online payments.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-championship-gold hover:bg-yellow-500 text-dark-steel font-bold py-4 rounded-lg text-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Complete Registration - $${calculateTotal()}`}
      </button>
    </form>
  )
}

export default GolfRegistrationForm