import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  // Classic Style: Sharp corners, Serif font, Uppercase, Tracking
  const baseStyles = "px-8 py-3 font-serif uppercase tracking-[0.15em] text-xs font-bold transition-all duration-500 border relative overflow-hidden group";
  
  const variants = {
    // Solid Gold with hover effect
    primary: "bg-gold-600 border-gold-400 text-onyx-900 hover:bg-gold-500 hover:border-gold-300 shadow-[0_0_15px_rgba(212,165,35,0.3)]",
    // Ghost/Outline style for classic feel
    secondary: "bg-transparent border-gold-700 text-gold-500 hover:border-gold-400 hover:text-gold-300 hover:bg-gold-900/20",
    danger: "bg-red-950/30 border-red-900 text-red-400 hover:bg-red-900/50"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Decorative inner line for primary buttons */}
      {variant === 'primary' && (
        <span className="absolute inset-1 border border-gold-800/30 pointer-events-none"></span>
      )}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            PROCESSING
          </>
        ) : children}
      </span>
    </button>
  );
};

export default Button;