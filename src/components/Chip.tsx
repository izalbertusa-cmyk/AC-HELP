import type { ReactNode } from 'react';

export function Chip({
  active,
  onClick,
  children,
  dashed,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      className={`chip${active ? ' chip-active' : ''}${dashed ? ' chip-dashed' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
