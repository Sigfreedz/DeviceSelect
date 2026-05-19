import React from 'react';
import styles from './DashboardCharts.module.css';

export interface ChartPoint {
  label: string;
  value: number;
  color?: string;
}

const defaultColors = ['#8b5cf6', '#a855f7', '#22c55e', '#f59e0b', '#06b6d4', '#ef4444'];

const safeNumber = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export const StackedShareChart: React.FC<{
  title: string;
  points: ChartPoint[];
  meta?: string;
}> = ({ title, points, meta }) => {
  const normalizedPoints = points.map((point, index) => ({
    ...point,
    value: safeNumber(point.value),
    color: point.color ?? defaultColors[index % defaultColors.length]
  }));
  const total = normalizedPoints.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
      <div className={styles.stackTrack} role="img" aria-label={`${title} distribution`}>
        {normalizedPoints.map(point => {
          const width = total > 0 ? `${(point.value / total) * 100}%` : '0%';
          return (
            <span
              key={point.label}
              className={styles.stackSegment}
              style={{ width, background: point.color }}
              title={`${point.label}: ${point.value}`}
            />
          );
        })}
      </div>
      <div className={styles.legend}>
        {normalizedPoints.map(point => (
          <p key={point.label} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: point.color }} />
            <span>{`${point.label}: ${point.value}`}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export const ProgressRing: React.FC<{
  title: string;
  current: number;
  total: number;
  color?: string;
  subtitle?: string;
}> = ({ title, current, total, color = '#8b5cf6', subtitle }) => {
  const safeCurrent = Math.max(0, current);
  const safeTotal = Math.max(0, total);
  const ratio = safeTotal > 0 ? Math.min(1, safeCurrent / safeTotal) : 0;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        {subtitle && <span className={styles.meta}>{subtitle}</span>}
      </div>
      <div className={styles.ringWrap}>
        <svg className={styles.ringSvg} viewBox="0 0 84 84" role="img" aria-label={`${title}: ${safeCurrent} of ${safeTotal}`}>
          <circle className={styles.ringTrack} cx="42" cy="42" r={radius} />
          <circle
            className={styles.ringFill}
            cx="42"
            cy="42"
            r={radius}
            style={{
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: dashOffset
            }}
          />
        </svg>
        <p className={styles.ringLabel}>{`${safeCurrent}/${safeTotal}`}</p>
      </div>
    </div>
  );
};

export const BarListChart: React.FC<{
  title: string;
  points: ChartPoint[];
  maxValue?: number;
}> = ({ title, points, maxValue }) => {
  const normalizedPoints = points.map((point, index) => ({
    ...point,
    value: safeNumber(point.value),
    color: point.color ?? defaultColors[index % defaultColors.length]
  }));
  const computedMaxValue = maxValue ?? Math.max(0, ...normalizedPoints.map(point => point.value));

  return (
    <div className={styles.panel}>
      <p className={styles.title}>{title}</p>
      <div className={styles.barList}>
        {normalizedPoints.map(point => {
          const width = computedMaxValue > 0 ? Math.round((point.value / computedMaxValue) * 100) : 0;
          const clampedWidth = point.value > 0 ? Math.min(100, Math.max(8, width)) : 0;
          return (
            <div key={point.label} className={styles.barRow}>
              <div className={styles.barTop}>
                <p className={styles.barLabel} title={point.label}>{point.label}</p>
                <p className={styles.barValue}>{point.value}</p>
              </div>
              <div className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: `${clampedWidth}%`, background: point.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TrendSparkBars: React.FC<{
  title: string;
  points: ChartPoint[];
  color?: string;
}> = ({ title, points, color = '#8b5cf6' }) => {
  const normalizedPoints = points.map(point => ({
    ...point,
    value: safeNumber(point.value)
  }));
  const maxValue = Math.max(0, ...normalizedPoints.map(point => point.value));

  return (
    <div className={styles.panel}>
      <p className={styles.title}>{title}</p>
      <div className={styles.spark} role="img" aria-label={title}>
        {normalizedPoints.map(point => {
          const barHeight = maxValue > 0 ? Math.max(8, Math.round((point.value / maxValue) * 60)) : 8;
          return (
            <div key={point.label} className={styles.sparkBarWrap} title={`${point.label}: ${point.value}`}>
              <span className={styles.sparkBar} style={{ height: `${barHeight}px`, background: color }} />
              <span className={styles.sparkLabel}>{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
