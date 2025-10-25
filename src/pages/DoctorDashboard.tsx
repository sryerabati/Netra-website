import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/DjangoAuthContext';
import { djangoApi, Scan } from '../services/djangoApi';
import { LogOut, Eye, Filter, Calendar, User, FileText, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorDashboard() {
  const { user, signOut } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, urgent: 0 });
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scansData, statsData] = await Promise.all([
        djangoApi.getAllScans(filter === 'urgent' ? 'urgent' : undefined, filter === 'pending' ? 'pending' : undefined),
        djangoApi.getScanStats(),
      ]);
      setScans(scansData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedScan || !noteText.trim()) return;

    setAddingNote(true);
    try {
      await djangoApi.addDoctorNote(selectedScan.id, noteText);
      setNoteText('');
      await fetchData();
      const updatedScan = await djangoApi.getScanDetail(selectedScan.id);
      setSelectedScan(updatedScan);
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateScan = async (priority?: string, status?: string) => {
    if (!selectedScan) return;

    try {
      await djangoApi.updateScan(selectedScan.id, priority, status);
      await fetchData();
      const updatedScan = await djangoApi.getScanDetail(selectedScan.id);
      setSelectedScan(updatedScan);
    } catch (error) {
      console.error('Error updating scan:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Netra</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Doctor Portal</p>
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
            Doctor Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review scans and manage patient cases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Scans</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Urgent Cases</p>
            <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
            }`}
          >
            <Filter className="w-4 h-4" />
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'urgent'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
            }`}
          >
            Urgent ({stats.urgent})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No scans found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No scans match the current filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scans.map((scan) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                onClick={() => setSelectedScan(scan)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                </div>

                {scan.images.length > 0 && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img
                      src={scan.images[0].image_url}
                      alt="Retinal scan"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Patient: {scan.patient?.full_name}</span>
                  </div>
                  {(scan.left_eye_prediction || scan.right_eye_prediction) && (
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-1">
                      {scan.left_eye_prediction && (
                        <p className="text-xs text-purple-900 dark:text-purple-300">
                          <span className="font-medium">L:</span> {scan.left_eye_prediction}
                        </p>
                      )}
                      {scan.right_eye_prediction && (
                        <p className="text-xs text-purple-900 dark:text-purple-300">
                          <span className="font-medium">R:</span> {scan.right_eye_prediction}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Scan Review
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Patient: {selectedScan.patient?.full_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={selectedScan.priority}
                      onChange={(e) => handleUpdateScan(e.target.value, undefined)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedScan.status}
                      onChange={(e) => handleUpdateScan(undefined, e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {selectedScan.images.map((image) => (
                  <div key={image.id} className="rounded-xl overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={`${image.eye_side} eye`}
                      className="w-full h-auto"
                    />
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 capitalize">
                      {image.eye_side} Eye
                    </p>
                  </div>
                ))}

                {(selectedScan.left_eye_prediction || selectedScan.right_eye_prediction) && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">
                      AI Analysis
                    </h4>
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

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Add Note
                  </h4>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={4}
                    placeholder="Enter your clinical notes here..."
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={addingNote || !noteText.trim()}
                    className="mt-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>

                {selectedScan.doctor_notes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Previous Notes
                    </h4>
                    <div className="space-y-3">
                      {selectedScan.doctor_notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                        >
                          <p className="text-gray-700 dark:text-gray-300">{note.note_text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
