import React, { useState } from 'react';
import { getCompanyInitials } from '../services/companyLogoService';

interface CompanyLogoProps {
  companyName: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Production-ready Company Logo Component
 * Strict adherence to Section 9, 10, 11, 12, 13:
 * - 56px x 56px container, white background, #E5E5E5 border, overflow hidden
 * - 36px x 36px contain logo, object-fit contain
 * - Accessible alt text: `${companyName} logo`
 * - Automatic onError fallback to clean initials, layout stays intact, zero broken image icons
 */
export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  companyName,
  logoUrl,
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);

  // Container sizing
  let containerDimensions = 'w-14 h-14 min-w-[56px] min-h-[56px]'; // 56px x 56px standard
  let logoDimensions = 'w-9 h-9 max-w-[36px] max-h-[36px]'; // 36px x 36px
  let fontClass = 'text-sm';

  if (size === 'sm') {
    containerDimensions = 'w-10 h-10 min-w-[40px] min-h-[40px]';
    logoDimensions = 'w-6 h-6 max-w-[24px] max-h-[24px]';
    fontClass = 'text-xs';
  } else if (size === 'lg') {
    containerDimensions = 'w-20 h-20 min-w-[80px] min-h-[80px]';
    logoDimensions = 'w-14 h-14 max-w-[56px] max-h-[56px]';
    fontClass = 'text-lg';
  }

  const initials = getCompanyInitials(companyName);
  const showLogo = Boolean(logoUrl && !hasError);

  return (
    <div
      className={`company-logo-container flex items-center justify-center border border-[#E5E5E5] bg-white overflow-hidden flex-shrink-0 select-none ${containerDimensions} ${className}`}
      title={companyName}
      aria-label={`${companyName} logo`}
    >
      {showLogo ? (
        <img
          src={logoUrl!}
          alt={`${companyName} logo`}
          className={`company-logo object-contain transition-opacity duration-200 ${logoDimensions}`}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className={`company-logo-fallback w-full h-full flex items-center justify-center font-bold tracking-tight text-[#1F1F1F] bg-[#FFF4CC]/50 ${fontClass}`}
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
    </div>
  );
};
