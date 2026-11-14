import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react'

// 25th Anniversary Alumni Game. Facts below come from the event poster
// (public/images/alumni-game-poster.jpg) and the schedule revised 2026-11-13.
// The rink address was checked against flyerstrainingcenter.com on 2026-11-14.
const RINK_NAME = 'Flyers Training Center'
const RINK_ADDRESS = '601 Laurel Oak Rd, Voorhees, NJ 08043'
const POSTER = '/images/alumni-game-poster.jpg'
const POSTER_ALT =
  'Wings of Steel 25th Anniversary Alumni Game poster. Saturday, February 20th, 2:00 PM at Flyers Training Center. Honoring Tom Brake and all of our players who are no longer with us.'

// Keep in step with SHIRT_SIZES in netlify/functions/alumni-game-register.js.
const SHIRT_SIZES = ['Youth S', 'Youth M', 'Youth L', 'Youth XL', 'Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult 2XL', 'Adult 3XL']

const EMPTY_FORM = { fullName: '', phone: '', email: '', shirtSize: '', yearsPlayed: '', website: '' }

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:border-steel-blue focus:outline-none focus:ring-2 focus:ring-steel-blue'
const labelClass = 'mb-1 block text-sm font-semibold text-gray-800'

const AlumniGame = () => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.title = '25th Anniversary Alumni Game | Wings of Steel Sled Hockey'
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        'Wings of Steel 25th Anniversary Alumni Game: Saturday, February 20, 2027 at 2:00 PM, Flyers Training Center, Voorhees NJ. All players past and present are invited. Register here.'
      )
    // The home page banner links straight to the form; the router does not
    // scroll to a hash by itself.
    if (window.location.hash === '#register') {
      document.getElementById('register')?.scrollIntoView()
    }
  }, [])

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setMessage('')
    try {
      const response = await fetch('/.netlify/functions/alumni-game-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'We could not save your sign-up. Please try again.')
      }
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'We could not save your sign-up. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel to-steel-gray">
      <section className="px-4 pb-16 pt-10">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <img
              src={POSTER}
              alt={POSTER_ALT}
              width={1199}
              height={1312}
              className="h-auto w-full rounded-2xl shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white"
          >
            <p className="mb-2 font-sport text-lg uppercase tracking-widest text-yellow-400">
              A celebration of 25 years of the Wings of Steel
            </p>
            <h1 className="mb-4 font-sport text-5xl leading-none tracking-wide md:text-6xl">
              25th Anniversary <span className="text-yellow-400">Alumni Game</span>
            </h1>
            <p className="mb-6 text-lg text-gray-200">
              All players, past and present, who have ever played for the Wings of Steel are invited to lace up and
              take the ice. A fun-filled game for the love of the game.
            </p>

            <dl className="mb-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: <Calendar size={20} />, label: 'Date', value: 'Saturday, February 20, 2027' },
                { icon: <Clock size={20} />, label: 'Time', value: '2:00 PM' },
                { icon: <MapPin size={20} />, label: 'Rink', value: RINK_NAME },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-steel-blue/30 bg-dark-steel/60 p-4">
                  <dt className="flex items-center gap-2 font-sport text-sm uppercase tracking-wider text-ice-blue">
                    {item.icon}
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-bold text-white">{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mb-6 text-gray-200">
              {RINK_NAME}, {RINK_ADDRESS}.{' '}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${RINK_NAME}, ${RINK_ADDRESS}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-yellow-400 underline underline-offset-2 hover:text-yellow-300"
              >
                Get directions<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>

            <div className="mb-8 rounded-xl border border-red-500/50 bg-dark-steel/60 p-5">
              <p className="font-sport text-2xl tracking-wide text-white">Honoring Tom Brake</p>
              <p className="text-gray-200">and all of our players who are no longer with us.</p>
            </div>

            {/* The site theme is dark-first, so a light card must set its own
                text colour and colour scheme or its fields render dark-on-dark. */}
            <div
              id="register"
              className="scroll-mt-24 rounded-2xl bg-white p-6 text-gray-900 shadow-2xl md:p-8"
              style={{ colorScheme: 'light' }}
            >
              {status === 'done' ? (
                <div role="status" className="text-center">
                  <CheckCircle className="mx-auto mb-3 text-green-600" size={44} aria-hidden="true" />
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">You're signed up</h2>
                  <p className="text-gray-700">
                    Thanks, {form.fullName.trim().split(/\s+/)[0]}. We sent a confirmation to {form.email}. See you on
                    the ice on February 20.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(EMPTY_FORM)
                      setStatus('idle')
                    }}
                    className="mt-5 font-semibold text-steel-blue underline underline-offset-2"
                  >
                    Sign up another player
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Register to play</h2>

                  <div>
                    <label htmlFor="ag-name" className={labelClass}>Name</label>
                    <input id="ag-name" name="fullName" type="text" autoComplete="name" required maxLength={120} value={form.fullName} onChange={update} className={inputClass} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="ag-phone" className={labelClass}>Phone</label>
                      <input id="ag-phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} value={form.phone} onChange={update} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="ag-email" className={labelClass}>Email</label>
                      <input id="ag-email" name="email" type="email" autoComplete="email" required maxLength={200} value={form.email} onChange={update} className={inputClass} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="ag-shirt" className={labelClass}>Shirt size</label>
                      <select id="ag-shirt" name="shirtSize" required value={form.shirtSize} onChange={update} className={inputClass}>
                        <option value="" disabled>Choose a size</option>
                        {SHIRT_SIZES.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ag-years" className={labelClass}>Years you played</label>
                      <input id="ag-years" name="yearsPlayed" type="text" required maxLength={120} placeholder="2008 to 2015" value={form.yearsPlayed} onChange={update} className={inputClass} />
                    </div>
                  </div>

                  {/* Spam trap: hidden from people, filled in by bots. */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="ag-website">Website</label>
                    <input id="ag-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} />
                  </div>

                  {status === 'error' && (
                    <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">
                      <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                      {message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="rounded-full bg-red-700 px-8 py-4 font-sport text-xl tracking-wider text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending' : 'Register'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default AlumniGame
