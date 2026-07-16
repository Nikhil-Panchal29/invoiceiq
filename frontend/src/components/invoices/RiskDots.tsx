import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types/invoice';

export interface RiskDotsProps {
  risk: RiskLevel;
}

export const RiskDots: React.FC<RiskDotsProps> = ({ risk }) => {
  const dotsCount = risk === 'high' ? 3 : risk === 'medium' ? 2 : 1;
  const colorClass =
    risk === 'high' ? 'bg-[#4B1426]' : risk === 'medium' ? 'bg-[#43637E]' : 'bg-[#558467]';

  return (
    <div className="flex items-center space-x-1" aria-label={`Risk level: ${risk}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-300',
            i < dotsCount ? colorClass : 'bg-[#EFEABB]/50'
          )}
        />
      ))}
    </div>
  );
};
