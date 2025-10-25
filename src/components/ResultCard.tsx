import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Activity, Eye } from 'lucide-react';
import { useState } from 'react';

interface ResultCardProps {
  prediction: string;
  confidence: number;
  onReset: () => void;
}

export const ResultCard = ({ prediction, confidence, onReset }: ResultCardProps) => {
  const [showHeatmap, setShowHeatmap] = useState(false);

  const isHealthy = prediction.toLowerCase().includes('no') ||
                    prediction.toLowerCase().includes('normal') ||
                    prediction.toLowerCase().includes('healthy');

  const getSeverityColor = () => {
    if (isHealthy) return 'text-green-500';
    if (confidence > 0.8) return 'text-red-500';
    if (confidence > 0.5) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getSeverityBg = () => {
    if (isHealthy) return 'from-green-500/20 to-green-600/20';
    if (confidence > 0.8) return 'from-red-500/20 to-red-600/20';
    if (confidence > 0.5) return 'from-orange-500/20 to-orange-600/20';
    return 'from-yellow-500/20 to-yellow-600/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className="backdrop-blur-xl bg-white/30 dark:bg-white/5 rounded-3xl border border-white/20 dark:border-white/10 p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${getSeverityBg()}`}>
              {isHealthy ? (
                <CheckCircle className={`w-8 h-8 ${getSeverityColor()}`} />
              ) : (
                <AlertCircle className={`w-8 h-8 ${getSeverityColor()}`} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
                Analysis Complete
              </h3>
              <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                AI-powered detection results
              </p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium rounded-xl backdrop-blur-xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 border border-white/30 dark:border-white/10 text-light-text dark:text-dark-text"
          >
            New Analysis
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                Prediction
              </span>
              <span className={`text-lg font-semibold ${getSeverityColor()}`}>
                {prediction}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                Confidence Score
              </span>
              <span className="text-lg font-semibold text-light-text dark:text-dark-text">
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div className="relative w-full h-4 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className={`h-full bg-gradient-to-r ${getSeverityBg().replace('/20', '/60')}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-light-text/50 dark:text-dark-text/50">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 dark:border-white/10">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="flex items-center gap-2 text-sm font-medium text-light-accent dark:text-dark-accent hover:text-light-accent-hover dark:hover:text-dark-accent/80 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showHeatmap ? 'Hide' : 'Show'} Attention Heatmap
            </button>

            {showHeatmap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-2xl bg-white/20 dark:bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2 text-sm text-light-text/60 dark:text-dark-text/60">
                  <Activity className="w-4 h-4" />
                  <span>Heatmap visualization would appear here when integrated with backend</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white/20 dark:bg-white/10 border border-white/10">
            <p className="text-xs text-light-text/60 dark:text-dark-text/60 leading-relaxed">
              <strong className="text-light-text dark:text-dark-text">Medical Disclaimer:</strong> This analysis is generated by an AI model and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for proper evaluation and diagnosis.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
