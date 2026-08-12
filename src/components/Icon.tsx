interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ name, size = 20, filled = false, color, style, className }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded${className ? ' ' + className : ''}`}
      style={{
        fontSize: size,
        color,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
        lineHeight: 1,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
