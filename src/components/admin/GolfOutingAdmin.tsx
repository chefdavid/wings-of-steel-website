import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Download, DollarSign, Users, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

interface Registration {
  id: string
  captain_info: {
    firstName: string
    lastName: string
    email: string
    phone: string
    company?: string
  }
  players: Array<{
    firstName: string
    lastName: string
    nickname?: string
    email?: string
    shirtSize: string
  }>
  mulligans: Record<string, number>
  add_ons: {
    dinnerGuests: number
    raffleTickets: number
    sponsorHole: boolean
    beatThePro: number
    skinsGame: number
  }
  total_amount: number
  is_early_bird: boolean
  payment_status: string
  payment_method?: string
  payment_date?: string
  registration_date: string
  confirmation_sent: boolean
}

const GolfOutingAdmin = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalPlayers: 0,
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0
  })
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    console.log('Fetching registrations...')
    try {
      const { data, error } = await supabase
        .from('golf_registrations')
        .select('*')
        .order('registration_date', { ascending: false })

      if (error) throw error

      console.log('Fetched registrations count:', data?.length)
      setRegistrations(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Registration[]) => {
    const stats = data.reduce((acc, reg) => {
      acc.totalRegistrations++
      acc.totalPlayers += reg.players.length
      acc.totalRevenue += Number(reg.total_amount)
      
      if (reg.payment_status === 'completed') {
        acc.paidAmount += Number(reg.total_amount)
      } else {
        acc.pendingAmount += Number(reg.total_amount)
      }
      
      return acc
    }, {
      totalRegistrations: 0,
      totalPlayers: 0,
      totalRevenue: 0,
      paidAmount: 0,
      pendingAmount: 0
    })
    
    setStats(stats)
  }

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('golf_registrations')
        .update({
          payment_status: status,
          payment_date: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error

      await fetchRegistrations()
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }

  const [deleting, setDeleting] = useState(false)

  const deleteRegistration = async (id: string) => {
    console.log('Delete button clicked for:', id)
    const confirmed = window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')
    console.log('Confirm result:', confirmed)

    if (!confirmed) {
      return
    }

    setDeleting(true)
    try {
      console.log('Attempting to delete from golf_registrations:', id)
      const { error, count } = await supabase
        .from('golf_registrations')
        .delete({ count: 'exact' })
        .eq('id', id)

      console.log('Delete response - error:', error, 'count:', count)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Verify the record was actually deleted
      const { data: checkData } = await supabase
        .from('golf_registrations')
        .select('id')
        .eq('id', id)
        .single()

      if (checkData) {
        console.error('Record still exists after delete - RLS policy may be blocking')
        throw new Error('Delete failed - record still exists. Check Supabase RLS policies.')
      }

      console.log('Delete verified successful')
      setSelectedRegistration(null)
      await fetchRegistrations()
      alert('Registration deleted successfully')
    } catch (error: any) {
      console.error('Error deleting registration:', error)
      alert('Failed to delete registration: ' + (error.message || 'Unknown error'))
    } finally {
      setDeleting(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Registration Date', 'Captain Name', 'Company', 'Email', 'Phone', 'Players', 'Total Amount', 'Payment Status']
    const rows = registrations.map(reg => [
      new Date(reg.registration_date).toLocaleDateString(),
      `${reg.captain_info.firstName} ${reg.captain_info.lastName}`,
      reg.captain_info.company || '',
      reg.captain_info.email,
      reg.captain_info.phone,
      reg.players.map(p => `${p.firstName} ${p.lastName}`).join('; '),
      reg.total_amount,
      reg.payment_status
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `golf-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true
    if (filter === 'paid') return reg.payment_status === 'completed'
    if (filter === 'pending') return reg.payment_status === 'pending'
    return true
  })

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-dark-steel">Golf Outing Registrations</h1>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition"
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Teams</p>
                <p className="text-2xl font-bold text-dark-steel">{stats.totalRegistrations}</p>
              </div>
              <Users className="text-steel-blue" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Players</p>
                <p className="text-2xl font-bold text-dark-steel">{stats.totalPlayers}</p>
              </div>
              <Users className="text-ice-blue" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-dark-steel">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="text-championship-gold" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Paid</p>
                <p className="text-2xl font-bold text-green-600">${stats.paidAmount.toFixed(2)}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-orange-600">${stats.pendingAmount.toFixed(2)}</p>
              </div>
              <Clock className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all' 
                ? 'bg-steel-blue text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({registrations.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'paid' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Paid ({registrations.filter(r => r.payment_status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'pending' 
                ? 'bg-orange-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pending ({registrations.filter(r => r.payment_status === 'pending').length})
          </button>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Captain
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Players
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(reg.registration_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reg.captain_info.firstName} {reg.captain_info.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{reg.captain_info.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reg.captain_info.company || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reg.players.length}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${reg.total_amount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reg.payment_status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {reg.payment_status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedRegistration(reg)}
                      className="text-steel-blue hover:text-dark-steel mr-3"
                    >
                      View
                    </button>
                    {reg.payment_status === 'pending' && (
                      <button
                        onClick={() => updatePaymentStatus(reg.id, 'completed')}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => deleteRegistration(reg.id)}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      title="Delete registration"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No registrations found
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-dark-steel">Registration Details</h2>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-3">Captain Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {selectedRegistration.captain_info.firstName} {selectedRegistration.captain_info.lastName}</p>
                  <p><span className="font-semibold">Email:</span> {selectedRegistration.captain_info.email}</p>
                  <p><span className="font-semibold">Phone:</span> {selectedRegistration.captain_info.phone}</p>
                  <p><span className="font-semibold">Company:</span> {selectedRegistration.captain_info.company || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">Registration Info</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Date:</span> {new Date(selectedRegistration.registration_date).toLocaleString()}</p>
                  <p><span className="font-semibold">Total:</span> ${selectedRegistration.total_amount}</p>
                  <p><span className="font-semibold">Early Bird:</span> {selectedRegistration.is_early_bird ? 'Yes' : 'No'}</p>
                  <p><span className="font-semibold">Confirmation Sent:</span> {selectedRegistration.confirmation_sent ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-lg mb-3">Players</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Nickname</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Shirt Size</th>
                    <th className="px-3 py-2 text-left">Mulligans</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedRegistration.players.map((player, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{player.firstName} {player.lastName}</td>
                      <td className="px-3 py-2">{player.nickname || '-'}</td>
                      <td className="px-3 py-2">{player.email || '-'}</td>
                      <td className="px-3 py-2">{player.shirtSize}</td>
                      <td className="px-3 py-2">{selectedRegistration.mulligans[`player${idx + 1}`] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(selectedRegistration.add_ons.dinnerGuests > 0 || 
              selectedRegistration.add_ons.raffleTickets > 0 ||
              selectedRegistration.add_ons.sponsorHole ||
              selectedRegistration.add_ons.beatThePro > 0 ||
              selectedRegistration.add_ons.skinsGame > 0) && (
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">Add-Ons</h3>
                <div className="space-y-1 text-sm">
                  {selectedRegistration.add_ons.dinnerGuests > 0 && (
                    <p>• {selectedRegistration.add_ons.dinnerGuests} Extra Dinner Guest(s)</p>
                  )}
                  {selectedRegistration.add_ons.raffleTickets > 0 && (
                    <p>• {selectedRegistration.add_ons.raffleTickets} Raffle Ticket Bundle(s)</p>
                  )}
                  {selectedRegistration.add_ons.sponsorHole && (
                    <p>• Hole Sponsorship</p>
                  )}
                  {selectedRegistration.add_ons.beatThePro > 0 && (
                    <p>• {selectedRegistration.add_ons.beatThePro} Beat the Pro Attempt(s)</p>
                  )}
                  {selectedRegistration.add_ons.skinsGame > 0 && (
                    <p>• {selectedRegistration.add_ons.skinsGame} Skins Game Entry(s)</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => deleteRegistration(selectedRegistration.id)}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <div className="flex space-x-3">
                {selectedRegistration.payment_status === 'pending' && (
                  <button
                    onClick={() => {
                      updatePaymentStatus(selectedRegistration.id, 'completed')
                      setSelectedRegistration(null)
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GolfOutingAdmin