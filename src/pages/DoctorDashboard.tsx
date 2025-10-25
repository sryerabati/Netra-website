import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Scan, ScanImage, DoctorNote, Profile } from '../lib/supabase';
import { LogOut, Eye, AlertTriangle, FileText, User, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScanWithDetails extends Scan {
  scan_images: ScanImage[];
  doctor_notes: DoctorNote[];
  patient?: Profile;
}

export default function DoctorDashboard() {
  const { profile, signOut } = useAuth();
  const [scans, setScans] = useState<ScanWithDetails[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanWithDetails | null>(null);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchScans();
  }, [profile, filter]);

  const fetchScans = async () => {
    if (!profile) return;

    let query = supabase
      .from('scans')
      .select(`
        *,
        scan_images(*),
        doctor_notes(*)
      `)
      .eq('doctor_id', profile.id)
      .order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('status', 'pending');
    } else if (filter === 'urgent') {
      query = query.eq('priority', 'urgent');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scans:', error);
    } else {
      const scansWithPatients = await Promise.all(
        (data || []).map(async (scan) => {
          const { data: patient } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', scan.patient_id)
            .maybeSingle();
          return { ...scan, patient };
        })
      );
      setScans(scansWithPatients);
    }
    setLoading(false);
  };

  const updateScanStatus = async (scanId: string, status: 'pending' | 'reviewed' | 'completed') => {
    const { error } = await supabase
      .from('scans')
      .update({ status })
      .eq('id', scanId);

    if (error) {
      console.error('Error updating scan:', error);
    } else {
      fetchScans();
      if (selectedScan?.id === scanId) {
        setSelectedScan({ ...selectedScan, status });
      }
    }
  };

  const updatePriority = async (scanId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const { error } = await supabase
      .from('scans')
      .update({ priority })
      .eq('id', scanId);

    if (error) {
      console.error('Error updating priority:', error);
    } else {
      fetchScans();
      if (selectedScan?.id === scanId) {
        setSelectedScan({ ...selectedScan, priority });
      }
    }
  };

  const addNote = async () => {
    if (!selectedScan || !noteText.trim() || !profile) return;

    setAddingNote(true);
    const { data, error } = await supabase
      .from('doctor_notes')
      .insert({
        scan_id: selectedScan.id,
        doctor_id: profile.id,
        note_text: noteText.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error);
    } else {
      setSelectedScan({
        ...selectedScan,
        doctor_notes: [...selectedScan.doctor_notes, data],
      });
      setNoteText('');
      fetchScans();
    }
    setAddingNote(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 border-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20 border-green-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'reviewed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const filteredScans = scans;
  const urgentCount = scans.filter(s => s.priority === 'urgent').length;
  const pendingCount = scans.filter(s => s.status === 'pending').length;

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
                <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.full_name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{profile?.role}</p>
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
            Patient Scans
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage patient retinal screenings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('all')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white border-transparent shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            <Eye className="w-8 h-8 mb-2" />
            <div className="text-2xl font-bold">{scans.length}</div>
            <div className="text-sm opacity-90">All Scans</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('pending')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              filter === 'pending'
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white border-transparent shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            <FileText className="w-8 h-8 mb-2" />
            <div className="text-2xl font-bold">{pendingCount}</div>
            <div className="text-sm opacity-90">Pending Review</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('urgent')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              filter === 'urgent'
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white border-transparent shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            <AlertTriangle className="w-8 h-8 mb-2" />
            <div className="text-2xl font-bold">{urgentCount}</div>
            <div className="text-sm opacity-90">Urgent Cases</div>
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No scans found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'No scans assigned to you yet' : `No ${filter} scans`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScans.map((scan) => (
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(scan.priority)}`}>
                        {scan.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                        {scan.status}
                      </span>
                    </div>
                  </div>
                </div>

                {scan.scan_images.length > 0 && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img
                      src={scan.scan_images[0].image_url}
                      alt="Retinal scan"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{scan.patient?.full_name || 'Unknown Patient'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                  </div>
                  {scan.ai_prediction && (
                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="line-clamp-1">{scan.ai_prediction}</span>
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
              className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedScan.patient?.full_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedScan.created_at).toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <select
                      value={selectedScan.status}
                      onChange={(e) => updateScanStatus(selectedScan.id, e.target.value as any)}
                      className="px-3 py-1 rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select
                      value={selectedScan.priority}
                      onChange={(e) => updatePriority(selectedScan.id, e.target.value as any)}
                      className="px-3 py-1 rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedScan.scan_images.map((image) => (
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
                </div>

                {selectedScan.ai_prediction && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      AI Analysis
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedScan.ai_prediction}</p>
                    {selectedScan.ai_confidence && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Confidence: {(selectedScan.ai_confidence * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Doctor's Notes
                  </h4>
                  <div className="space-y-3 mb-4">
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
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && addNote()}
                    />
                    <button
                      onClick={addNote}
                      disabled={addingNote || !noteText.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingNote ? 'Adding...' : 'Add Note'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
