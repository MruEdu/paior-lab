import { useMemo } from 'react'

/**
 * AOIR 레이더 차트
 * 원점수(raw) vs 실질 에너지(effective) 시각화
 */
export default function RadarChart({ data, size = 200 }) {
  const center = size / 2
  const radius = center - 24
  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / 4
    return ['A', 'O', 'I', 'R'].map((k, i) => {
      const d = data?.find((x) => x.factor === k)
      const rawVal = d ? d.raw : 0
      const effVal = d ? d.effective : 0
      const angle = -Math.PI / 2 + i * angleStep
      return {
        factor: k,
        label: d?.label || k,
        raw: rawVal,
        effective: effVal,
        rawScore: d?.rawScore ?? Math.round((rawVal / 100) * 50),
        effectiveScore: d?.effectiveScore ?? Math.round((effVal / 100) * 50),
        rawX: center + radius * (rawVal / 100) * Math.cos(angle),
        rawY: center + radius * (rawVal / 100) * Math.sin(angle),
        effX: center + radius * (effVal / 100) * Math.cos(angle),
        effY: center + radius * (effVal / 100) * Math.sin(angle),
        labelX: center + (radius + 20) * Math.cos(angle),
        labelY: center + (radius + 20) * Math.sin(angle)
      }
    })
  }, [data, radius, center])

  const rawPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.rawX} ${p.rawY}`).join(' ') + ' Z'
  const effPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.effX} ${p.effY}`).join(' ') + ' Z'

  const gridPath = useMemo(() => {
    const levels = [0.25, 0.5, 0.75, 1]
    return levels.map((level) => {
      const pts = points.map((p, i) => {
        const angle = -Math.PI / 2 + i * (2 * Math.PI) / 4
        const x = center + radius * level * Math.cos(angle)
        const y = center + radius * level * Math.sin(angle)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      return pts.join(' ') + ' Z'
    })
  }, [points, radius, center])

  if (!data?.length) return null

  return (
    <div className="radar-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 그리드 */}
        {gridPath.map((path, i) => (
          <path key={i} d={path} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        ))}
        {/* 축 */}
        {points.map((p, i) => (
          <line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(-Math.PI / 2 + i * (2 * Math.PI) / 4)}
            y2={center + radius * Math.sin(-Math.PI / 2 + i * (2 * Math.PI) / 4)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {/* 원점수 영역 */}
        <path d={rawPath} fill="rgba(37, 99, 235, 0.15)" stroke="#2563eb" strokeWidth="1.5" />
        {/* 실질 에너지 영역 */}
        <path d={effPath} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
        {/* 라벨 */}
        {points.map((p) => (
          <g key={p.factor}>
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill="#1e293b"
            >
              {p.label}
            </text>
            <text
              x={p.labelX}
              y={p.labelY + 12}
              textAnchor="middle"
              fontSize="9"
              fill="#64748b"
            >
              {p.rawScore}→{p.effectiveScore}점
            </text>
          </g>
        ))}
      </svg>
      <div className="radar-legend">
        <span><i style={{ color: '#2563eb' }}>■</i> 원점수</span>
        <span><i style={{ color: '#10b981' }}>■</i> 실질 에너지</span>
      </div>
      <style>{`
        .radar-chart { text-align: center; margin: 1rem 0; }
        .radar-legend { font-size: 0.75rem; color: var(--paoir-text-muted); margin-top: 0.5rem; }
        .radar-legend span { margin: 0 0.5rem; }
      `}</style>
    </div>
  )
}
