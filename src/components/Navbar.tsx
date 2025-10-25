import { motion } from 'framer-motion';
import { Moon, Sun, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/30 dark:bg-white/5 rounded-2xl border border-white/20 dark:border-white/10 px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-light-accent dark:text-dark-accent" />
              <span className="text-xl font-semibold text-light-text dark:text-dark-text">
                Netra
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#home"
                className="text-sm font-medium text-light-text/70 dark:text-dark-text/70 hover:text-light-accent dark:hover:text-dark-accent transition-colors"
              >
                Home
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-light-text/70 dark:text-dark-text/70 hover:text-light-accent dark:hover:text-dark-accent transition-colors"
              >
                About
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-light-text/70 dark:text-dark-text/70 hover:text-light-accent dark:hover:text-dark-accent transition-colors"
              >
                How It Works
              </a>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl backdrop-blur-xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 border border-white/30 dark:border-white/10"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-light-text" />
              ) : (
                <Sun className="w-5 h-5 text-dark-text" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
