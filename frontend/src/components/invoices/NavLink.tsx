import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, isActive, onClick }) => (
  <Link
    to={href}
    onClick={onClick}
    className={cn(
      'flex items-center px-3 py-2 text-sm font-medium transition-all duration-150 rounded-md relative group',
      isActive
        ? 'text-white bg-[#321E48]'
        : 'text-[#43637E] hover:text-[#78A4CB] hover:bg-[#EAE0CF]'
    )}
  >
    <span className={cn('mr-2', isActive ? 'text-[#78A4CB]' : 'text-[#43637E] group-hover:text-[#78A4CB]')}>
      {icon}
    </span>
    {label}
  </Link>
);
