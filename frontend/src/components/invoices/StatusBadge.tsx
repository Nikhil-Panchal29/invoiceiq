import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'high-risk'
  | 'medium-risk'
  | 'low-risk'
  | string;

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  paid: {
    bg: 'bg-[#EAE0CF]',
    text: 'text-[#558467]',
    border: 'border-[#558467]/20',
    dot: 'bg-[#558467]',
  },
  'low-risk': {
    bg: 'bg-[#EAE0CF]',
    text: 'text-[#558467]',
    border: 'border-[#558467]/20',
    dot: 'bg-[#558467]',
  },
  pending: {
    bg: 'bg-[#EAE0CF]',
    text: 'text-[#78A4CB]',
    border: 'border-[#78A4CB]/20',
    dot: 'bg-[#78A4CB]',
  },
  'medium-risk': {
    bg: 'bg-[#EFEABB]/50',
    text: 'text-[#43637E]',
    border: 'border-[#43637E]/20',
    dot: 'bg-[#43637E]',
  },
  overdue: {
    bg: 'bg-[#EFEABB]/50',
    text: 'text-[#4B1426]',
    border: 'border-[#4B1426]/20',
    dot: 'bg-[#4B1426]',
  },
  'high-risk': {
    bg: 'bg-[#EFEABB]/50',
    text: 'text-[#4B1426]',
    border: 'border-[#4B1426]/20',
    dot: 'bg-[#4B1426]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const normalizedStatus = status.toLowerCase();
  const config = statusConfig[normalizedStatus] || {
    bg: 'bg-[#EFEABB]/30',
    text: 'text-[#43637E]',
    border: 'border-[#EFEABB]',
    dot: 'bg-[#43637E]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', config.dot)} />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};
