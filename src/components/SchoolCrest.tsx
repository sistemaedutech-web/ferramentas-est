import React from 'react';

interface SchoolCrestProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SchoolCrest: React.FC<SchoolCrestProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${sizeMap[size]} ${className} shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Brasão Escola Santa Teresinha"
    >
      {/* Shield Background */}
      <path
        d="M50 4L14 18V50C14 74 50 96 50 96C50 96 86 74 86 50V18L50 4Z"
        fill="#1E3A8A"
        stroke="#F59E0B"
        strokeWidth="3.5"
      />
      {/* Inner Accent Line */}
      <path
        d="M50 10L20 22V48C20 68 50 88 50 88C50 88 80 68 80 48V22L50 10Z"
        fill="#1E40AF"
        opacity="0.8"
      />
      
      {/* Open Book Motif */}
      <path
        d="M50 42C44 38 34 38 28 40V64C34 62 44 62 50 66C56 62 66 62 72 64V40C66 38 56 38 50 42Z"
        fill="#F8FAFC"
        stroke="#F59E0B"
        strokeWidth="2"
      />
      <path d="M50 42V66" stroke="#CBD5E1" strokeWidth="2" />
      <path d="M33 46H45M33 52H45M55 46H67M55 52H67" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Torch / Flame of Knowledge */}
      <path
        d="M50 20C47 25 45 27 45 30C45 33 47 35 50 35C53 35 55 33 55 30C55 27 53 25 50 20Z"
        fill="#F59E0B"
      />
      <path
        d="M50 24C49 26 48 28 48 30C48 31 49 32 50 32C51 32 52 31 52 30C52 28 51 26 50 24Z"
        fill="#FBBF24"
      />

      {/* Decorative Stars */}
      <circle cx="36" cy="30" r="1.5" fill="#F59E0B" />
      <circle cx="64" cy="30" r="1.5" fill="#F59E0B" />

      {/* Institutional Cross / Monogram Accent */}
      <path
        d="M48 72H52M50 70V74"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
