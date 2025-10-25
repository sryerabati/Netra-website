import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/DjangoAuthContext';
import { djangoApi, User, Scan } from '../services/djangoApi';
import { LogOut, Upload, Eye, Users, Stethoscope, AlertCircle, CheckCircle, History, Calendar, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NurseDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [leftEyeFile, setLeftEyeFile] = useState<File | null>(null);
  const [rightEyeFile, setRightEyeFile] = useState<File | null>(null);
  const [patientAge, setPatientAge] = useState('');
  const [diabetesDuration, setDiabetesDuration] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatientsAndDoctors();
    if (activeTab === 'history') {
      fetchScans();
    }
  }, [activeTab]);

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsData, doctorsData] = await Promise.all([
        djangoApi.getUsersByRole('patient'),
        djangoApi.getUsersByRole('doctor'),
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchScans = async () => {
    setLoading(true);
    try {
      const scansData = await djangoApi.getNurseScans();
      setScans(scansData);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedPatient || !selectedDoctor) {
      setError('Please select both patient and doctor');
      return;
    }

    if (!leftEyeFile && !rightEyeFile) {
      setError('Please upload at least one eye scan');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('patient_id', selectedPatient);
      formData.append('doctor_id', selectedDoctor);
      if (patientAge) formData.append('patient_age', patientAge);
      if (diabetesDuration) formData.append('patient_diabetes_duration', diabetesDuration);
      if (leftEyeFile) formData.append('left_eye', leftEyeFile);
      if (rightEyeFile) formData.append('right_eye', rightEyeFile);

      await djangoApi.uploadScan(formData);

      setSuccess('Scan uploaded and analyzed successfully!');
      setSelectedPatient('');
      setSelectedDoctor('');
      setLeftEyeFile(null);
      setRightEyeFile(null);
      setPatientAge('');
      setDiabetesDuration('');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload scan');
    } finally {
      setUploading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Netra</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Nurse Portal</p>
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
            Nurse Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload patient scans and manage submission history
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload Scan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
            }`}
          >
            <History className="w-5 h-5" />
            My Submissions ({scans.length})
          </button>
        </div>

        {activeTab === 'upload' ? (
          <>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {success}
              </motion.div>
            )}

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

            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Select Patient
                    </label>
                    <select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Stethoscope className="w-4 h-4 inline mr-2" />
                      Assign Doctor
                    </label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Patient Age (optional)
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      min="0"
                      max="120"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Diabetes Duration (optional)
                    </label>
                    <input
                      type="number"
                      value={diabetesDuration}
                      onChange={(e) => setDiabetesDuration(e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Years"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Left Eye Scan
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLeftEyeFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="left-eye"
                      />
                      <label
                        htmlFor="left-eye"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors bg-gray-50 dark:bg-gray-700/50"
                      >
                        {leftEyeFile ? (
                          <div className="text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-600" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{leftEyeFile.name}</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Right Eye Scan
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setRightEyeFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="right-eye"
                      />
                      <label
                        htmlFor="right-eye"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors bg-gray-50 dark:bg-gray-700/50"
                      >
                        {rightEyeFile ? (
                          <div className="text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-600" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{rightEyeFile.name}</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Uploading and Analyzing...' : 'Upload & Analyze Scan'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : scans.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No submissions yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Scans you upload will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scans.map((scan) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
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
                        <UserIcon className="w-4 h-4" />
                        <span>Patient: {scan.patient?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Stethoscope className="w-4 h-4" />
                        <span>Dr. {scan.doctor?.full_name}</span>
                      </div>
                      {(scan.left_eye_prediction || scan.right_eye_prediction) && (
                        <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg space-y-1">
                          {scan.left_eye_prediction && (
                            <p className="text-xs text-emerald-900 dark:text-emerald-300">
                              <span className="font-medium">L:</span> {scan.left_eye_prediction}
                            </p>
                          )}
                          {scan.right_eye_prediction && (
                            <p className="text-xs text-emerald-900 dark:text-emerald-300">
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
          </div>
        )}
      </main>
    </div>
  );
}
