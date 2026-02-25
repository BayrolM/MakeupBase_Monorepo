import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/theme-context';

interface ThemeToggleProps {
  inline?: boolean;
}

export function ThemeToggle({ inline = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (inline) {
    // Inline version for use within FloatingCart container or header
    return (
      <button
        onClick={toggleTheme}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 border backdrop-blur-sm"
        style={{
          backgroundColor: theme === 'dark' ? '#C87A88' : '#E7BFC5',
          borderColor: theme === 'dark' ? '#E7BFC5' : '#C87A88',
        }}
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          {/* Sol - visible en modo oscuro */}
          <Sun 
            className={`w-4 h-4 text-white absolute transition-all duration-300 ${
              theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 rotate-90 scale-75'
            }`}
          />
          
          {/* Luna - visible en modo claro */}
          <Moon 
            className={`w-4 h-4 absolute transition-all duration-300 ${
              theme === 'light' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-90 scale-75'
            }`}
            style={{ color: '#0B0B0B' }}
          />
        </div>
      </button>
    );
  }

  // Standalone fixed version for admin view
  return (
    <button
      onClick={toggleTheme}
      className="fixed z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 border-2 backdrop-blur-sm group"
      style={{
        top: '24px',
        right: '32px',
        backgroundColor: theme === 'dark' ? '#C87A88' : '#E7BFC5',
        borderColor: theme === 'dark' ? '#E7BFC5' : '#C87A88',
      }}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sol - visible en modo oscuro */}
        <Sun 
          className={`w-5 h-5 text-white absolute transition-all duration-300 ${
            theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
          }`}
        />
        
        {/* Luna - visible en modo claro */}
        <Moon 
          className={`w-5 h-5 absolute transition-all duration-300 ${
            theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
          }`}
          style={{ color: '#0B0B0B' }}
        />
      </div>
    </button>
  );
}