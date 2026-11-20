import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSize} shrink-0`}
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="10" fill="#176B45" />
        {/* House Roof Silhouette */}
        <path
          d="M8.5 18.5L20 9L31.5 18.5"
          stroke="#FFFDF8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Plate Circle */}
        <circle cx="20" cy="24" r="7.5" fill="#FFFDF8" />
        <circle cx="20" cy="24" r="4.8" stroke="#36A66A" strokeWidth="1.5" />
        {/* Spoon Accent */}
        <path
          d="M20 20.5V27.5"
          stroke="#FFAA45"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="21" r="1.4" fill="#FFAA45" />
      </svg>
      {showText && (
        <span className={`font-display font-bold tracking-tight text-[#176B45] ${textSize}`}>
          Hostel<span className="text-[#252525]">Bites</span>
        </span>
      )}
    </span>
  );
};

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#176B45]/10 via-[#FFFDF8] to-[#FFAA45]/15 text-[#176B45] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 mb-1.5 opacity-70" />
        <span className="text-xs font-medium text-[#252525]/70 line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
