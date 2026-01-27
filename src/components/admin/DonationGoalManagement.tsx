import { useState, useEffect } from 'react';
import { useDonationGoals } from '../../hooks/useDonationGoals';
import { Plus, Edit, Trash2, X, Save, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

const DonationGoalManagement = () => {
  const { goals, progress, loading, refetch } = useDonationGoals();
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goal_type: 'monthly' as 'monthly' | 'annual' | 'campaign',
    goal_name: '',
    target_amount: '',
    start_date: '',
    end_date: '',
    is_active: true,
    description: '',
  });

  const handleCreate = async () => {
    try {
      // Use admin client for admin operations (bypasses RLS)
      // If admin client is not available, fall back to regular client
      const dbClient = supabaseAdmin || supabase;
      console.log('🔐 Using client:', supabaseAdmin ? 'Admin (service role)' : 'Regular (anon key)');
      const { error } = await dbClient
        .from('donation_goals')
        .insert({
          goal_type: formData.goal_type,
          goal_name: formData.goal_name,
          target_amount: parseFloat(formData.target_amount),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          is_active: formData.is_active,
          description: formData.description || null,
        });

      if (error) throw error;

      setIsCreating(false);
      setFormData({
        goal_type: 'monthly',
        goal_name: '',
        target_amount: '',
        start_date: '',
        end_date: '',
        is_active: true,
        description: '',
      });
      refetch();
    } catch (error: any) {
      alert('Error creating goal: ' + error.message);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      // Use admin client for admin operations (bypasses RLS)
      const dbClient = supabaseAdmin || supabase;
      const { error } = await dbClient
        .from('donation_goals')
        .update({
          goal_type: formData.goal_type,
          goal_name: formData.goal_name,
          target_amount: parseFloat(formData.target_amount),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          is_active: formData.is_active,
          description: formData.description || null,
        })
        .eq('id', id);

      if (error) throw error;

      setEditingGoal(null);
      setFormData({
        goal_type: 'monthly',
        goal_name: '',
        target_amount: '',
        start_date: '',
        end_date: '',
        is_active: true,
        description: '',
      });
      refetch();
    } catch (error: any) {
      alert('Error updating goal: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      // Use admin client for admin operations (bypasses RLS)
      const dbClient = supabaseAdmin || supabase;
      const { error } = await dbClient
        .from('donation_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      refetch();
    } catch (error: any) {
      alert('Error deleting goal: ' + error.message);
    }
  };

  const startEdit = (goal: any) => {
    setEditingGoal(goal.id);
    setFormData({
      goal_type: goal.goal_type,
      goal_name: goal.goal_name,
      target_amount: goal.target_amount.toString(),
      start_date: goal.start_date.split('T')[0],
      end_date: goal.end_date ? goal.end_date.split('T')[0] : '',
      is_active: goal.is_active,
      description: goal.description || '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressForGoal = (goalId: string) => {
    return progress.find(p => p.goal_id === goalId);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-dark-steel">Donation Goal Management</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition-colors"
          >
            <Plus size={20} />
            Create Goal
          </button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingGoal) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-steel">
                {isCreating ? 'Create New Goal' : 'Edit Goal'}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingGoal(null);
                  setFormData({
                    goal_type: 'monthly',
                    goal_name: '',
                    target_amount: '',
                    start_date: '',
                    end_date: '',
                    is_active: true,
                    description: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
                <select
                  value={formData.goal_type}
                  onChange={(e) => setFormData({ ...formData, goal_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                  <option value="campaign">Campaign</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={formData.goal_name}
                  onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                  placeholder="e.g., December Fundraiser"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  placeholder="5000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Optional description for this goal..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-blue focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (isCreating) {
                    handleCreate();
                  } else if (editingGoal) {
                    handleUpdate(editingGoal);
                  }
                }}
                className="flex items-center gap-2 bg-steel-blue text-white px-4 py-2 rounded-lg hover:bg-dark-steel transition-colors"
              >
                <Save size={18} />
                {isCreating ? 'Create Goal' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingGoal(null);
                  setFormData({
                    goal_type: 'monthly',
                    goal_name: '',
                    target_amount: '',
                    start_date: '',
                    end_date: '',
                    is_active: true,
                    description: '',
                  });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {goals.map((goal) => {
                  const progressData = getProgressForGoal(goal.id);
                  return (
                    <tr key={goal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          goal.goal_type === 'campaign'
                            ? 'bg-purple-100 text-purple-800'
                            : goal.goal_type === 'monthly'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {goal.goal_type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{goal.goal_name}</div>
                        {goal.description && (
                          <div className="text-sm text-gray-500">{goal.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(goal.target_amount)}
                      </td>
                      <td className="px-4 py-4">
                        {progressData ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(progressData.current_amount)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({progressData.percentage_complete.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${Math.min(progressData.percentage_complete, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No progress yet</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{new Date(goal.start_date).toLocaleDateString()}</div>
                        {goal.end_date && (
                          <div className="text-xs text-gray-500">
                            to {new Date(goal.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          goal.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => startEdit(goal)}
                          className="text-steel-blue hover:text-dark-steel mr-3"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {goals.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No goals found. Create your first goal to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationGoalManagement;

