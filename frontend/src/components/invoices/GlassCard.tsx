import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  title?: string;
  headerAction?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  containerClassName,
  title,
  headerAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-br from-white/95 to-[#EAE0CF]/30 backdrop-blur-xl',
        'border border-[#EFEABB]',
        'shadow-lg shadow-[#17433F]/10',
        className
      )}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between p-6 pb-2 border-b border-[#EFEABB]">
          {title && <h3 className="text-lg font-semibold text-[#17433F]">{title}</h3>}
          {headerAction && <div className="flex items-center space-x-2">{headerAction}</div>}
        </div>
      )}
      <div className={cn('p-6', title && 'pt-4', containerClassName)}>{children}</div>
    </motion.div>
  );
};
