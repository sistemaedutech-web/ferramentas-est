import React, { useState } from 'react';
import { SchoolCrest } from './SchoolCrest';

export const OFFICIAL_LOGO_URL = 'https://esantateresinha.com.br/assets/logo-est.png';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [errorLevel, setErrorLevel] = useState<number>(0);

  // Height mappings for consistent alignment
  const heightClasses = {
    sm: 'h-8 max-w-[120px]',
    md: 'h-10 max-w-[150px]',
    lg: 'h-14 max-w-[200px]',
    xl: 'h-20 max-w-[280px]',
  };

  const crestSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  } as const;

  // Level 0: Try live remote URL https://esantateresinha.com.br/assets/logo-est.png
  // Level 1: Try cached local /logo-est.png
  // Level 2: Fall back to vector SchoolCrest
  if (errorLevel >= 2) {
    return <SchoolCrest size={crestSizes[size]} className={className} />;
  }

  const src = errorLevel === 0 ? OFFICIAL_LOGO_URL : '/logo-est.png';

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src={src}
        alt="Logotipo Oficial da Escola Santa Teresinha"
        className={`${heightClasses[size]} w-auto object-contain shrink-0 transition-opacity`}
        referrerPolicy="no-referrer"
        onError={() => setErrorLevel((prev) => prev + 1)}
      />
      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight">
            Escola Santa Teresinha
          </span>
          <span className="text-[10px] sm:text-xs text-blue-900 font-semibold tracking-tight">
            Portal do Professor & Funcionários
          </span>
        </div>
      )}
    </div>
  );
};
