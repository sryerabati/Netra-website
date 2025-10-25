import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export const AnalyzeButton = ({ onClick, disabled, isLoading }: AnalyzeButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto mt-6"
    >
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        className={`relative w-full px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 overflow-hidden ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-white/20 dark:bg-white/5'
            : 'backdrop-blur-xl bg-gradient-to-r from-light-accent to-light-accent-hover dark:from-dark-accent dark:to-dark-accent/80 hover:shadow-2xl hover:shadow-light-accent/30 dark:hover:shadow-dark-accent/30'
        } text-white border border-white/20 dark:border-white/10`}
      >
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: '-100%' }}
          animate={{ x: disabled ? '-100%' : '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative flex items-center justify-center gap-3">
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>Analyze Image</span>
            </>
          )}
        </div>

        {!disabled && !isLoading && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
            }}
          />
        )}
      </motion.button>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 backdrop-blur-xl bg-white/20 dark:bg-white/5 rounded-xl p-4 border border-white/20 dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-light-text dark:text-dark-text">
              Processing...
            </span>
            <span className="text-sm text-light-text/60 dark:text-dark-text/60">
              AI Analysis in Progress
            </span>
          </div>
          <div className="w-full h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-light-accent to-light-accent-hover dark:from-dark-accent dark:to-dark-accent/80"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
