import { motion } from 'framer-motion';
import { Github, Mail, AlertTriangle } from 'lucide-react';

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-20 px-6 py-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/30 dark:bg-white/5 rounded-2xl border border-white/20 dark:border-white/10 p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-light-text dark:text-dark-text mb-1">
                  Medical Disclaimer
                </p>
                <p className="text-xs text-light-text/60 dark:text-dark-text/60 max-w-md">
                  Netra is not a medical diagnostic tool. This application is for educational and research purposes only. Always consult qualified healthcare professionals for medical advice.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl backdrop-blur-xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 border border-white/30 dark:border-white/10"
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5 text-light-text dark:text-dark-text" />
              </a>
              <a
                href="mailto:contact@netra.ai"
                className="p-3 rounded-xl backdrop-blur-xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 border border-white/30 dark:border-white/10"
                aria-label="Contact Email"
              >
                <Mail className="w-5 h-5 text-light-text dark:text-dark-text" />
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20 dark:border-white/10 text-center">
            <p className="text-xs text-light-text/50 dark:text-dark-text/50">
              © {new Date().getFullYear()} Netra. AI-Powered Retinal Analysis Platform.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
