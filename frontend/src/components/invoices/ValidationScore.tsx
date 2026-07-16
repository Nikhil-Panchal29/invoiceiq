import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ValidationScoreProps {
  score: number;
}

export const ValidationScore: React.FC<ValidationScoreProps> = ({ score }) => {
  const colorClass =
    score >= 90 ? 'bg-[#558467]' : score >= 70 ? 'bg-[#78A4CB]' : 'bg-[#4B1426]';

  return (
    <div className="flex flex-col space-y-1 w-32">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-semibold text-[#43637E] uppercase tracking-wider">
          {score}% Confidence
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#EFEABB]/50 rounded-full overflow-hidden">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${score}%`,
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
          className={cn('h-full rounded-full', colorClass)}
        />
      </div>
    </div>
  );
};
