export function EuFlag({ className }: { className?: string }) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const cx = 240 + 70 * Math.cos(angle);
    const cy = 160 + 70 * Math.sin(angle);
    return <circle key={i} cx={cx} cy={cy} r="6" fill="#FFD700" />;
  });
  return (
    <svg viewBox="0 0 480 320" className={className} role="img" aria-label="Zastava Europske unije">
      <rect width="480" height="320" fill="#003399" />
      {stars}
    </svg>
  );
}
