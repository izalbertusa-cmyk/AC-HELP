import type { ReactNode, CSSProperties } from 'react';

export function Card({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`card${className ? ' ' + className : ''}`} style={style}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="section-label" style={style}>
      {children}
    </div>
  );
}
