import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Scan, ScanImage, DoctorNote, Profile } from '../lib/supabase';
import { LogOut, Eye, Calendar, User, FileText, TrendingUp, UserPlus, Stethoscope, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanWithDetails extends Scan {
  scan_images: ScanImage[];
  doctor_notes: DoctorNote[];
  doctor?: Profile;
}

interface Subscription {
  id: string;
  doctor_id: string;
  is_active: boolean;
  doctor?: Profile;
}

export default function PatientDashboard() {
  const { profile, signOut } = useAuth();
  const [scans, setScans] = useState<ScanWithDetails[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanWithDetails | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    const [scansRes, subscriptionsRes, doctorsRes] = await Promise.all([
      supabase
        .from('scans')
        .select(`*, scan_images(*), doctor_notes(*)`)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('patient_doctor_subscriptions')
        .select('*')
        .eq('patient_id', profile.id)
        .eq('is_active', true),
      supabase.from('profiles').select('*').eq('role', 'doctor')
    ]);

    if (scansRes.data) {
      const scansWithDoctors = await Promise.all(
        scansRes.data.map(async (scan) => {
          const { data: doctor } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', scan.doctor_id)
            .maybeSingle();
          return { ...scan, doctor };
        })
      );
      setScans(scansWithDoctors);
    }

    if (subscriptionsRes.data) {
      const subsWithDoctors = await Promise.all(
        subscriptionsRes.data.map(async (sub) => {
          const { data: doctor } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sub.doctor_id)
            .maybeSingle();
          return { ...sub, doctor };
        })
      );
      setSubscriptions(subsWithDoctors);
    }

    if (doctorsRes.data) {
      setDoctors(doctorsRes.data);
    }

    setLoading(false);
  };

  const subscribeToDoctor = async (doctorId: string) => {
    if (!profile) return;
    setSubscribing(true);

    const { error } = await supabase
      .from('patient_doctor_subscriptions')
      .insert({
        patient_id: profile.id,
        doctor_id: doctorId,
        is_active: true
      });

    if (!error) {
      await fetchData();
      setShowDoctorModal(false);
    }
    setSubscribing(false);
  };

  const unsubscribeFromDoctor = async (subscriptionId: string) => {
    const { error } = await supabase
      .from('patient_doctor_subscriptions')
      .update({ is_active: false })
      .eq('id', subscriptionId);

    if (!error) {
      await fetchData();
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

  const subscribedDoctorIds = subscriptions.map(s => s.doctor_id);
  const availableDoctors = doctors.filter(d => !subscribedDoctorIds.includes(d.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Netra</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Patient Portal</p>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your doctors and view scan history
            </p>
          </div>
          <button
            onClick={() => setShowDoctorModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-medium shadow-lg transition-all flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Doctor
          </button>
        </div>

        {subscriptions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              My Doctors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Dr. {sub.doctor?.full_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sub.doctor?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => unsubscribeFromDoctor(sub.id)}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            My Scans
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No scans yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your retinal scans will appear here once they're uploaded by a nurse
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

                {scan.scan_images.length > 0 && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img
                      src={scan.scan_images[0].image_url}
                      alt="Retinal scan"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                {scan.ai_prediction && (
                  <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        AI Analysis
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{scan.ai_prediction}</p>
                    {scan.ai_confidence && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Confidence: {(scan.ai_confidence * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Dr. {scan.doctor?.full_name || 'Unassigned'}</span>
                  </div>
                  {scan.doctor_notes.length > 0 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <FileText className="w-4 h-4" />
                      <span>{scan.doctor_notes.length}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showDoctorModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDoctorModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Subscribe to a Doctor
                </h3>

                {availableDoctors.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    You're already subscribed to all available doctors
                  </p>
                ) : (
                  <div className="space-y-4">
                    {availableDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Dr. {doctor.full_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {doctor.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => subscribeToDoctor(doctor.id)}
                          disabled={subscribing}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Subscribe
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="mt-6 w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-all"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    Scan Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedScan.created_at).toLocaleString()}
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

                {selectedScan.ai_prediction && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
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

                {selectedScan.doctor_notes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Doctor's Notes
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
