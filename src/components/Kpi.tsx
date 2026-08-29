interface Props {
  label: string;
  value: string | number;
  sub?: string;
}

export function Kpi({ label, value, sub }: Props) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
