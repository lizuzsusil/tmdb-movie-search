export function Rating({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={className}>
      <span aria-hidden="true">★ </span>
      {value.toFixed(1)}
      <span className="sr-only"> out of 10</span>
    </span>
  );
}
