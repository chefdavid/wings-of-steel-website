import { useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface AlumniRegistration {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  shirt_size: string;
  years_played: string;
  created_at: string;
}

// Same order the sign-up form offers them in.
const SIZE_ORDER = ['Youth S', 'Youth M', 'Youth L', 'Youth XL', 'Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult 2XL', 'Adult 3XL'];

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

const AlumniGameAdmin = () => {
  const [rows, setRows] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      // The table is closed to the browser's public key, so the list comes
      // through a function. It only exists on Netlify, not under `npm run dev`.
      const response = await fetch('/.netlify/functions/alumni-game-list');
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.registrations) {
        throw new Error(result?.error || 'Could not load the sign-ups.');
      }
      setRows(result.registrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the sign-ups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sizeCounts = SIZE_ORDER.map((size) => ({
    size,
    count: rows.filter((r) => r.shirt_size === size).length,
  })).filter((s) => s.count > 0);

  const exportCsv = () => {
    const lines = [
      ['Name', 'Phone', 'Email', 'Shirt size', 'Years played', 'Signed up'].map(csvCell).join(','),
      ...rows.map((r) =>
        [r.full_name, r.phone, r.email, r.shirt_size, r.years_played, new Date(r.created_at).toLocaleString('en-US')]
          .map(csvCell)
          .join(',')
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alumni-game-sign-ups.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-gray-700">25th Anniversary Alumni Game · Saturday, February 20, 2027 · 2:00 PM</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {loading ? 'Loading' : `${rows.length} signed up`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-steel-blue px-4 py-2 font-semibold text-white hover:bg-dark-steel disabled:opacity-60"
          >
            <Download size={16} aria-hidden="true" />
            Download list
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 font-medium text-red-800">{error}</p>
      )}

      {sizeCounts.length > 0 && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Shirts to order</h3>
          <div className="flex flex-wrap gap-2">
            {sizeCounts.map((s) => (
              <span key={s.size} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800">
                {s.size}: {s.count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {['Name', 'Phone', 'Email', 'Shirt size', 'Years played', 'Signed up'].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-900">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-semibold">{r.full_name}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <a href={`tel:${r.phone}`} className="text-blue-700 underline">{r.phone}</a>
                </td>
                <td className="px-4 py-3">
                  <a href={`mailto:${r.email}`} className="text-blue-700 underline">{r.email}</a>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{r.shirt_size}</td>
                <td className="px-4 py-3">{r.years_played}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-700">
                  No one has signed up yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlumniGameAdmin;
