import { useMemo } from 'react'

/**
 * PAIOR 나이팅게일 로즈 차트
 * variant='aoir': 기질 4요인(A-O-I-R) - 블루 계열, 등급별 색상 농도
 * variant='p': 심리 9요인(P1~P9) - 웜톤, 등급별 색상 농도
 * 등급: 높음(≥40) 강조색, 보통(25~39) 중간, 낮음(≤24) 연한색
 */
const AIOR_LABELS = { A: '추진력', O: '질서', I: '탐구', R: '관계' }
const P_LABELS = {
  고군분투: 'P1', 반항: 'P2', 완벽: 'P3', 외고집: 'P4', 잡념: 'P5',
  만족: 'P6', 적당: 'P7', 의존: 'P8', 싫증: 'P9'
}
const P_ORDER = ['고군분투', '반항', '완벽', '외고집', '잡념', '만족', '적당', '의존', '싫증']

// 블루 계열 - 등급별 농도 (높음:강조, 보통:중간, 낮음:연함)
const AIOR_COLORS_BY_GRADE = {
  높음: { fill: 'rgba(37, 99, 235, 0.7)', stroke: '#1d4ed8' },
  high: { fill: 'rgba(37, 99, 235, 0.7)', stroke: '#1d4ed8' },
  보통: { fill: 'rgba(37, 99, 235, 0.5)', stroke: '#3b82f6' },
  middle: { fill: 'rgba(37, 99, 235, 0.5)', stroke: '#3b82f6' },
  낮음: { fill: 'rgba(37, 99, 235, 0.3)', stroke: '#93c5fd' },
  low: { fill: 'rgba(37, 99, 235, 0.3)', stroke: '#93c5fd' }
}

const AIOR_COLORS = { fill: 'rgba(37, 99, 235, 0.55)', stroke: '#1d4ed8' }

// 따뜻한 계열 - 등급별 농도
const P_COLORS_BY_GRADE = {
  높음: { fill: 'rgba(234, 88, 12, 0.65)', stroke: '#c2410c' },
  high: { fill: 'rgba(234, 88, 12, 0.65)', stroke: '#c2410c' },
  보통: { fill: 'rgba(234, 88, 12, 0.45)', stroke: '#ea580c' },
  middle: { fill: 'rgba(234, 88, 12, 0.45)', stroke: '#ea580c' },
  낮음: { fill: 'rgba(234, 88, 12, 0.28)', stroke: '#fdba74' },
  low: { fill: 'rgba(234, 88, 12, 0.28)', stroke: '#fdba74' }
}

const P_COLORS = [
  { fill: 'rgba(234, 88, 12, 0.5)', stroke: '#c2410c' },   // 오렌지
  { fill: 'rgba(245, 158, 11, 0.5)', stroke: '#d97706' },   // 앰버
  { fill: 'rgba(249, 115, 22, 0.5)', stroke: '#ea580c' },  // 오렌지-500
  { fill: 'rgba(234, 88, 12, 0.45)', stroke: '#c2410c' },
  { fill: 'rgba(251, 146, 60, 0.5)', stroke: '#ea580c' }, // 오렌지-400
  { fill: 'rgba(245, 158, 11, 0.45)', stroke: '#d97706' },
  { fill: 'rgba(251, 191, 36, 0.5)', stroke: '#f59e0b' }, // 앰버-400
  { fill: 'rgba(249, 115, 22, 0.45)', stroke: '#ea580c' },
  { fill: 'rgba(251, 146, 60, 0.45)', stroke: '#f97316' }
]

export default function NightingaleRoseChart({ variant = 'aoir', aoir, p, aoirGrades = {}, pGrades = {}, size = 260 }) {
  const center = size / 2
  const maxRadius = center - 28
  const maxScore = 50

  const { sections, angleStep } = useMemo(() => {
    if (variant === 'aoir') {
      const order = ['A', 'I', 'O', 'R']
      const step = (2 * Math.PI) / 4
      const result = order.map((k, i) => {
        const angle = -Math.PI / 2 + i * step
        const score = aoir?.[k] ?? 0
        const r = maxRadius * (score / maxScore)
        const grade = aoirGrades[k] || (score >= 40 ? '높음' : score >= 25 ? '보통' : '낮음')
        const colors = AIOR_COLORS_BY_GRADE[grade] || AIOR_COLORS
        return {
          key: k,
          label: AIOR_LABELS[k],
          shortLabel: k,
          score,
          angle,
          radius: Math.max(r, 4),
          colors: colors.fill ? colors : AIOR_COLORS
        }
      })
      return { sections: result, angleStep: step }
    }

    // variant === 'p'
    const step = (2 * Math.PI) / 9
    const result = P_ORDER.map((factor, i) => {
      const angle = -Math.PI / 2 + i * step
      const score = p?.[factor] ?? 0
      const r = maxRadius * (score / maxScore)
      const grade = pGrades[factor] || (score >= 40 ? '높음' : score >= 25 ? '보통' : '낮음')
      const colors = P_COLORS_BY_GRADE[grade] || P_COLORS[i % P_COLORS.length]
      return {
        key: factor,
        label: P_LABELS[factor],
        shortLabel: P_LABELS[factor],
        score,
        angle,
        radius: Math.max(r, 4),
        colors: colors.fill ? colors : P_COLORS[i % P_COLORS.length]
      }
    })
    return { sections: result, angleStep: step }
  }, [variant, aoir, p, aoirGrades, pGrades, maxRadius])

  const getSectorPath = (startAngle, radius) => {
    const r = Math.max(radius, 2)
    const x1 = center + r * Math.cos(startAngle)
    const y1 = center + r * Math.sin(startAngle)
    const endAngle = startAngle + angleStep
    const x2 = center + r * Math.cos(endAngle)
    const y2 = center + r * Math.sin(endAngle)
    const largeArc = angleStep > Math.PI ? 1 : 0
    return `M ${center} ${center} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  const getLabelPos = (angle) => {
    const r = maxRadius + 16
    return {
      x: center + r * Math.cos(angle + angleStep / 2),
      y: center + r * Math.sin(angle + angleStep / 2)
    }
  }

  const isEmpty = variant === 'aoir'
    ? !aoir || Object.values(aoir).every((v) => !v)
    : !p || Object.values(p).every((v) => !v)
  if (isEmpty) return null

  const title = variant === 'aoir' ? '기질 4요인 (AIOR)' : '심리 9요인 (P1~P9)'

  return (
    <div className={`nightingale-rose nightingale-${variant}`}>
      <h4 className="chart-title">{title}</h4>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {sections.map((s) => (
          <path
            key={s.key}
            d={getSectorPath(s.angle, s.radius)}
            fill={s.colors.fill}
            stroke={s.colors.stroke}
            strokeWidth="1"
          />
        ))}
        {sections.map((s) => {
          const pos = getLabelPos(s.angle)
          return (
            <text
              key={`lbl-${s.key}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="500"
              fill="#334155"
            >
              {s.shortLabel}
            </text>
          )
        })}
      </svg>
      <div className="rose-legend">
        {variant === 'aoir' ? (
          <span><i style={{ color: '#1d4ed8' }}>■</i> 추진력·탐구·질서·관계 (블루)</span>
        ) : (
          <span><i style={{ color: '#ea580c' }}>■</i> P1~P9 심리 역동 (웜톤)</span>
        )}
      </div>
      <style>{`
        .nightingale-rose { text-align: center; margin: 1rem 0; }
        .nightingale-rose .chart-title { font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 600; }
        .nightingale-aoir .chart-title { color: #1d4ed8; }
        .nightingale-p .chart-title { color: #c2410c; }
        .rose-legend { font-size: 0.75rem; color: var(--paoir-text-muted); margin-top: 0.5rem; }
      `}</style>
    </div>
  )
}
