import { FiMenu, FiMoon, FiSun, FiBell } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Navbar({ setMobileOpen }: NavbarProps) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className={`sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiMenu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Welcome back! 👋</h2>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <FiSun className="w-5 h-5 text-yellow-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
