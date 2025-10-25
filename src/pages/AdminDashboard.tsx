import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/DjangoAuthContext';
import { djangoApi, Scan } from '../services/djangoApi';
import { LogOut, Eye, Trash2, Users, Activity, AlertCircle, Calendar, User as UserIcon, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scansData, statsData] = await Promise.all([
        djangoApi.getAdminScans(),
        djangoApi.getAdminStats(),
      ]);
      setScans(scansData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (scanId: number) => {
    if (!confirm('Are you sure you want to delete this scan? This action cannot be undone.')) {
      return;
    }

    try {
      await djangoApi.deleteScan(scanId);
      setSuccess('Scan deleted successfully');
      setScans(scans.filter(s => s.id !== scanId));
      if (selectedScan?.id === scanId) {
        setSelectedScan(null);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scan');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'reviewed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-zinc-800 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Netra</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hello Admin!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all scans across the system
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_scans}</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_scans}</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgent_scans}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-500 border-t-transparent"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No scans in the system
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All scans will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {scans.map((scan) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedScan(scan)}
                  className={`backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border transition-all cursor-pointer ${
                    selectedScan?.id === scan.id
                      ? 'border-slate-500 shadow-lg'
                      : 'border-gray-200/50 dark:border-gray-700/50 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(scan.priority)}`}>
                        {scan.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                        {scan.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(scan.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {scan.images.length > 0 && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      <img
                        src={scan.images[0].image_url}
                        alt="Retinal scan"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <UserIcon className="w-4 h-4" />
                      <span>Patient: {scan.patient?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Stethoscope className="w-4 h-4" />
                      <span>Dr. {scan.doctor?.full_name}</span>
                    </div>
                    {(scan.left_eye_prediction || scan.right_eye_prediction) && (
                      <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg space-y-1">
                        {scan.left_eye_prediction && (
                          <p className="text-xs text-slate-900 dark:text-slate-300">
                            <span className="font-medium">L:</span> {scan.left_eye_prediction}
                          </p>
                        )}
                        {scan.right_eye_prediction && (
                          <p className="text-xs text-slate-900 dark:text-slate-300">
                            <span className="font-medium">R:</span> {scan.right_eye_prediction}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedScan && (
              <div className="lg:col-span-1">
                <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-6 border border-gray-200/50 dark:border-gray-700/50 sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scan Details</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Patient</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedScan.patient?.full_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Doctor</p>
                      <p className="font-medium text-gray-900 dark:text-white">Dr. {selectedScan.doctor?.full_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Uploaded By</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedScan.nurse?.full_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedScan.created_at).toLocaleString()}
                      </p>
                    </div>

                    {(selectedScan.left_eye_prediction || selectedScan.right_eye_prediction) && (
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-300 mb-3">AI Analysis</h4>
                        <div className="space-y-2">
                          {selectedScan.left_eye_prediction && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">Left Eye: </span>
                              <span className="text-gray-700 dark:text-gray-300">{selectedScan.left_eye_prediction}</span>
                            </div>
                          )}
                          {selectedScan.right_eye_prediction && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">Right Eye: </span>
                              <span className="text-gray-700 dark:text-gray-300">{selectedScan.right_eye_prediction}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleDeleteScan(selectedScan.id)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Scan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
