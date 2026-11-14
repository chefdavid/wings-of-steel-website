import { useEffect, useState } from 'react';
import { Download, RefreshCw, Pencil, Trash2 } from 'lucide-react';

interface AlumniRegistration {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  shirt_size: string;
  years_played: string;
  created_at: string;
}

type Draft = Pick<AlumniRegistration, 'full_name' | 'phone' | 'email' | 'shirt_size' | 'years_played'>;

// Same list the sign-up form offers. Keep in step with AlumniGame.tsx and the
// two alumni-game functions.
const SIZE_ORDER = ['Youth S', 'Youth M', 'Youth L', 'Youth XL', 'Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Adult 2XL', 'Adult 3XL'];

// The table is closed to the browser's public key, so reads and writes go
// through this function. It only exists on Netlify, not under `npm run dev`.
const ENDPOINT = '/.netlify/functions/alumni-game-list';

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

const fieldClass =
  'w-full min-w-[7rem] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-steel-blue focus:outline-none focus:ring-2 focus:ring-steel-blue';

const AlumniGameAdmin = () => {
  const [rows, setRows] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(ENDPOINT);
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

  const send = async (payload: Record<string, string>) => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result) throw new Error(result?.error || 'That did not save. Please try again.');
    return result;
  };

  const startEdit = (row: AlumniRegistration) => {
    setError('');
    setDeletingId(null);
    setEditingId(row.id);
    setDraft({
      full_name: row.full_name,
      phone: row.phone,
      email: row.email,
      shirt_size: row.shirt_size,
      years_played: row.years_played,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!editingId || !draft) return;
    setBusy(true);
    setError('');
    try {
      const result = await send({ action: 'update', id: editingId, ...draft });
      setRows((prev) => prev.map((r) => (r.id === editingId ? result.registration : r)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async (id: string) => {
    setBusy(true);
    setError('');
    try {
      await send({ action: 'delete', id });
      setRows((prev) => prev.filter((r) => r.id !== id));
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not delete. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const setField = (field: keyof Draft, value: string) =>
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));

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
              <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-900">
            {rows.map((r) => {
              const signedUp = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              if (editingId === r.id && draft) {
                return (
                  <tr key={r.id} className="bg-blue-50">
                    <td className="px-3 py-2">
                      <input aria-label="Name" value={draft.full_name} maxLength={120} onChange={(e) => setField('full_name', e.target.value)} className={fieldClass} />
                    </td>
                    <td className="px-3 py-2">
                      <input aria-label="Phone" type="tel" value={draft.phone} maxLength={40} onChange={(e) => setField('phone', e.target.value)} className={fieldClass} />
                    </td>
                    <td className="px-3 py-2">
                      <input aria-label="Email" type="email" value={draft.email} maxLength={200} onChange={(e) => setField('email', e.target.value)} className={fieldClass} />
                    </td>
                    <td className="px-3 py-2">
                      <select aria-label="Shirt size" value={draft.shirt_size} onChange={(e) => setField('shirt_size', e.target.value)} className={fieldClass}>
                        {SIZE_ORDER.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input aria-label="Years played" value={draft.years_played} maxLength={120} onChange={(e) => setField('years_played', e.target.value)} className={fieldClass} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">{signedUp}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <button onClick={saveEdit} disabled={busy} className="rounded-md bg-steel-blue px-3 py-1.5 font-semibold text-white hover:bg-dark-steel disabled:opacity-60">
                        {busy ? 'Saving' : 'Save'}
                      </button>
                      <button onClick={cancelEdit} disabled={busy} className="ml-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60">
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
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
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{signedUp}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {deletingId === r.id ? (
                      <>
                        <span className="mr-2 font-semibold text-red-800">Delete {r.full_name}?</span>
                        <button onClick={() => confirmDelete(r.id)} disabled={busy} className="rounded-md bg-red-700 px-3 py-1.5 font-semibold text-white hover:bg-red-800 disabled:opacity-60">
                          {busy ? 'Deleting' : 'Yes, delete'}
                        </button>
                        <button onClick={() => setDeletingId(null)} disabled={busy} className="ml-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60">
                          Keep
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(r)} className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 font-semibold text-gray-800 hover:bg-gray-50">
                          <Pencil size={14} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            cancelEdit();
                            setError('');
                            setDeletingId(r.id);
                          }}
                          className="ml-2 inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-800 hover:bg-red-50"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-700">
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
