import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import html2pdf from 'html2pdf.js'
import NightingaleRoseChart from '../components/NightingaleRoseChart'
import { AIOR_LABELS, P_LABELS, P_ORDER, getScoreGrade, getScoreGradeDisplay } from '../lib/analysisEngine'

// **bold** → <strong>
function renderBold(text) {
  if (!text) return ''
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p
  )
}

/** 리포트 내 '귀하'/'사용자'를 [닉네임] 님으로 치환 */
function personalizeWithNickname(text, nickname) {
  if (!text) return ''
  if (!nickname) return text
  const honorific = `${nickname} 님`
  return text
    .replace(/귀하의/g, `${honorific}의`)
    .replace(/귀하가/g, `${honorific}이`)
    .replace(/귀하를/g, `${honorific}을`)
    .replace(/귀하와/g, `${honorific}과`)
    .replace(/귀하/g, honorific)
    .replace(/사용자/g, honorific)
}

export default function Result() {
  const navigate = useNavigate()
  const reportRef = useRef(null)
  const [result, setResult] = useState(null)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState('')
  const [satisfaction, setSatisfaction] = useState(null)
  const [satisfactionSubmitted, setSatisfactionSubmitted] = useState(false)

  useEffect(() => {
    const r = sessionStorage.getItem('paoir_result')
    const e = sessionStorage.getItem('paoir_email')
    if (!r) {
      navigate('/diagnosis')
      return
    }
    setResult(JSON.parse(r))
    setEmail(e || '')
  }, [navigate])

  const nickname = sessionStorage.getItem('paoir_nickname') || ''
  const participationCode = sessionStorage.getItem('paoir_participation_code') || ''

  if (!result) return <div className="loading">로딩 중...</div>

  const efficiency = result.efficiency || {
    effective: result.aoir,
    effectiveSum: Object.values(result.aoir || {}).reduce((a, b) => a + b, 0),
    efficiencyIndex: result.p ? (Object.values(result.aoir || {}).reduce((a, b) => a + b, 0) / (Object.values(result.p).reduce((a, b) => a + b, 0) * 0.1 || 1)).toFixed(1) : '-'
  }
  const pReport = result.pReport || {}
  const keyFactors = result.keyFactors || []
  const narrative = result.narrative || {}

  const { aoir, p, aoirGrades, pGrades, type, summary } = result
  const grades = aoirGrades || {}
  const pG = pGrades || {}
  const typeName = result.typeName || type || '분석 결과'

  const handleDownloadPdf = () => {
    if (!reportRef.current) return
    const opt = {
      margin: 12,
      filename: `PAIOR_진단결과_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(reportRef.current).save()
  }

  const handleSubmitRating = async (score) => {
    if (satisfactionSubmitted || !nickname || !participationCode) return
    setSatisfaction(score)
    try {
      const res = await fetch('/api/submit-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, participationCode, score })
      })
      const data = await res.json()
      if (data.success) setSatisfactionSubmitted(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendEmail = async () => {
    if (!reportRef.current || !email) return
    setSending(true)
    setSendStatus('')
    try {
      const opt = {
        margin: 12,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      const pdfBlob = await html2pdf().set(opt).from(reportRef.current).outputPdf('blob')
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve((reader.result || '').split(',')[1])
        reader.onerror = () => reject(new Error('PDF 변환 실패'))
        reader.readAsDataURL(pdfBlob)
      })
      const res = await fetch('/api/send-result-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pdfBase64: base64 })
      })
      const data = await res.json()
      if (data.success) {
        setSendStatus('success')
      } else {
        setSendStatus(data.error || '전송 실패')
      }
    } catch (err) {
      setSendStatus(err.message || '전송 중 오류가 발생했습니다.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="result-page">
      <div className="result-card" ref={reportRef}>
        <header className="report-header">
          <img src="/logo.png" alt="PAIOR(파이오르)" className="report-logo" />
          <div className="report-header-text">
            <h1>PAIOR(파이오르) 진단 결과</h1>
            <p className="email-note">결과를 PDF로 다운로드하거나 이메일({email})로 전송할 수 있습니다.</p>
          </div>
        </header>

        {/* ─── 1. 기질(AIOR) 페르소나 해석 ─── */}
        <section className="section-aoir">
          <p className="grand-master-badge">Analyzed by PAIOR Grand Master</p>
          <h2>1. 기질(AIOR) 해석</h2>
          <p className="type-result">
            {narrative.typeLabel || `[${Object.entries(aoir || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k]) => AIOR_LABELS[k]).join(', ')}형]`} <em>&#39;{typeName}&#39;</em> 입니다.
          </p>
          {narrative.aoirText && (
            <p className="narrative-text">{renderBold(personalizeWithNickname(narrative.aoirText, nickname))}</p>
          )}
          <div className="chart-section aoir-chart">
            <NightingaleRoseChart variant="aoir" aoir={aoir} p={null} aoirGrades={grades} size={260} />
            {narrative.chartText && (
              <p className="narrative-text chart-desc">{renderBold(personalizeWithNickname(narrative.chartText, nickname))}</p>
            )}
            <div className="aoir-detail">
              {['A', 'I', 'O', 'R'].map((k) => {
                const score = aoir?.[k] ?? 0
                const grade = grades[k] || getScoreGrade(score)
                const displayGrade = getScoreGradeDisplay(score)
                return (
                  <div key={k} className="aoir-row">
                    <span>{AIOR_LABELS[k]}</span>
                    <span className="scores">
                      {score}점 <span className={`grade grade-${grade}`}>({displayGrade})</span> → 실질 {Math.round(efficiency?.effective?.[k] ?? score)}점
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── 2. 심리 역동(P1~P9) 현재 상태 해석 ─── */}
        <section className="section-p">
          <h2>2. 심리 역동(P1~P9) 해석</h2>
          <div className="chart-section p-chart">
            <NightingaleRoseChart variant="p" aoir={null} p={p} pGrades={pG} size={260} />
          </div>
          {narrative.pBlock && (
            <p className="narrative-text p-block">{renderBold(personalizeWithNickname(narrative.pBlock, nickname))}</p>
          )}
          <div className="p-grid">
            {(P_ORDER || Object.keys(P_LABELS)).filter((k) => p?.[k] != null).map((k) => {
              const v = p[k]
              const grade = pG[k] || getScoreGrade(v)
              const displayGrade = getScoreGradeDisplay(v)
              return (
                <div key={k} className={`p-item ${keyFactors?.includes(k) ? 'key-factor' : ''} grade-${grade}`}>
                  <span className="label">{P_LABELS[k]}</span>
                  <span className="value">{v}점 <span className={`grade grade-${grade}`}>({displayGrade})</span></span>
                  {keyFactors?.includes(k) && <span className="badge">주요 관찰</span>}
                </div>
              )
            })}
          </div>
          {keyFactors?.length > 0 && (
            <p className="insight">주요 관찰 역동: {keyFactors.map((k) => P_LABELS[k]).join(', ')}</p>
          )}
          {pReport && !pReport._isPeaceful && Object.keys(pReport).filter((k) => !k.startsWith('_')).length > 0 && (
            <div className="p-report">
              <h3>역동별 해석</h3>
              {Object.entries(pReport)
                .filter(([k]) => !k.startsWith('_'))
                .map(([factor, data]) => (
                  <div key={factor} className={`p-report-item ${data.isKey ? 'key' : ''}`}>
                    <strong>{P_LABELS[factor]}</strong> ({data.value}점)
                    {data.isKey && <span className="tag">주요</span>}
                    <p>{personalizeWithNickname(data.text, nickname)}</p>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* ─── 3. [닉네임] 님을 위한 종합 소견 ─── */}
        <section className="section-summary">
          <h2>3. {nickname ? `${nickname} 님을 위한 종합 소견` : '종합 소견'}</h2>
          <p className="summary-text">{personalizeWithNickname(summary, nickname)}</p>
          {narrative.closing && (
            <p className="narrative-text closing">{personalizeWithNickname(narrative.closing, nickname)}</p>
          )}
        </section>

        <div className="result-actions">
          <button type="button" className="btn-download" onClick={handleDownloadPdf}>
            PDF 다운로드
          </button>
          <button
            type="button"
            className="btn-send-email"
            onClick={handleSendEmail}
            disabled={sending}
          >
            {sending ? '전송 중...' : '이메일로 전송'}
          </button>
          {sendStatus === 'success' && <span className="send-success">이메일이 전송되었습니다.</span>}
          {sendStatus && sendStatus !== 'success' && <span className="send-error">{sendStatus}</span>}
        </div>
        <button className="btn-restart" onClick={() => navigate('/diagnosis')}>
          처음으로
        </button>

        <section className="satisfaction-section">
          <p className="satisfaction-question">오늘의 진단이 얼마나 도움이 되셨나요?</p>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${satisfaction >= star ? 'selected' : ''} ${satisfactionSubmitted ? 'disabled' : ''}`}
                onClick={() => handleSubmitRating(star)}
                disabled={satisfactionSubmitted}
                aria-label={`${star}점`}
              >
                ★
              </button>
            ))}
          </div>
          {satisfactionSubmitted && (
            <p className="satisfaction-thanks">소중한 의견 감사합니다.</p>
          )}
        </section>

        <footer className="result-footer">© 2026 PAIOR Lab. All rights reserved.</footer>
      </div>

      <style>{`
        .result-page {
          min-height: 100vh;
          padding: 2rem 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .loading {
          text-align: center;
          padding: 4rem;
        }

        .result-card {
          background: var(--paoir-card);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .report-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--paoir-border);
        }
        .report-logo {
          width: 100px;
          height: auto;
          flex-shrink: 0;
        }
        .report-header-text { flex: 1; }
        .result-card h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .email-note { font-size: 0.9rem; color: var(--paoir-text-muted); margin-bottom: 0; }
        @media print {
          .report-header { print-color-adjust: exact; }
          .report-logo { width: 72px; }
        }

        .section-aoir, .section-p, .section-summary {
          margin-bottom: 2rem;
        }

        .section-aoir h2 { color: #1d4ed8; }
        .section-p h2 { color: #c2410c; }
        .section-summary h2 { color: var(--paoir-secondary); }

        .result-card h2 { font-size: 1.1rem; margin-bottom: 0.75rem; }

        .type-result {
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          color: var(--paoir-primary);
        }
        .type-result em { font-style: normal; color: var(--paoir-text); }

        .narrative-text {
          font-size: 0.95rem;
          line-height: 1.8;
          margin-bottom: 1.25rem;
          color: var(--paoir-text);
        }
        .narrative-text.chart-desc { margin-top: 0.5rem; }
        .narrative-text.p-block {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--paoir-border);
        }
        .narrative-text.closing {
          font-size: 0.85rem;
          color: var(--paoir-text-muted);
          margin-top: 1rem;
        }

        .chart-section { margin: 1.5rem 0; }
        .aoir-chart { border-left: 4px solid #1d4ed8; padding-left: 1rem; }
        .p-chart { border-left: 4px solid #c2410c; padding-left: 1rem; }

        .aoir-detail { margin-top: 1rem; font-size: 0.9rem; }
        .aoir-row {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
        }
        .aoir-row .scores { color: var(--paoir-text-muted); }
        .grade-high { color: #1d4ed8; font-weight: 600; }
        .grade-보통 { color: #64748b; }
        .grade-middle { color: #64748b; }
        .grade-낮음 { color: #94a3b8; }
        .grade-low { color: #94a3b8; }
        .p-item.grade-높음 { border-color: #ea580c; }
        .p-item.grade-high { border-color: #ea580c; }

        .p-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin: 1rem 0;
        }
        .p-item {
          background: #fff7ed;
          padding: 0.5rem;
          border-radius: 6px;
          text-align: center;
          position: relative;
        }
        .p-item.key-factor { border: 2px solid #c2410c; }
        .p-item .label { font-size: 0.85rem; display: block; }
        .p-item .value { font-weight: 600; color: #c2410c; }
        .p-item .badge {
          font-size: 0.65rem;
          background: #ea580c;
          color: white;
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          margin-left: 0.25rem;
        }

        .insight {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          color: #c2410c;
          font-weight: 500;
        }

        .p-report {
          margin-top: 1rem;
          border-top: 1px solid var(--paoir-border);
          padding-top: 1rem;
        }
        .p-report h3 { font-size: 0.95rem; margin-bottom: 0.75rem; }
        .p-report-item {
          padding: 0.75rem;
          background: #fff7ed;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .p-report-item.key { border-left: 4px solid #ea580c; }
        .p-report-item .tag { font-size: 0.7rem; margin-left: 0.5rem; color: #ea580c; }
        .p-report-item p { margin: 0.5rem 0 0; line-height: 1.6; color: var(--paoir-text-muted); }

        .summary-text {
          font-size: 0.95rem;
          line-height: 1.8;
          color: var(--paoir-text);
        }

        .satisfaction-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          border-top: 1px solid var(--paoir-border);
        }
        .satisfaction-question {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--paoir-text);
        }
        .star-rating {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .star-btn {
          font-size: 2rem;
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #cbd5e1;
          transition: color 0.2s, transform 0.1s;
        }
        .star-btn:hover:not(.disabled) {
          color: #fbbf24;
          transform: scale(1.1);
        }
        .star-btn.selected {
          color: #f59e0b;
        }
        .star-btn.disabled {
          cursor: default;
        }
        .satisfaction-thanks {
          font-size: 0.9rem;
          color: #059669;
          margin-top: 0.75rem;
          font-weight: 500;
        }
        @media print {
          .satisfaction-section { display: none; }
        }

        .result-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
          margin-top: 1.5rem;
        }
        .btn-download, .btn-send-email {
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-download {
          background: #1d4ed8;
          color: white;
          border: none;
        }
        .btn-download:hover { background: #2563eb; }
        .btn-send-email {
          background: #059669;
          color: white;
          border: none;
        }
        .btn-send-email:hover:not(:disabled) { background: #047857; }
        .btn-send-email:disabled { opacity: 0.7; cursor: not-allowed; }
        .send-success { color: #059669; font-size: 0.9rem; }
        .send-error { color: #dc2626; font-size: 0.9rem; }

        .btn-restart {
          width: 100%;
          background: var(--paoir-secondary);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }
        .grand-master-badge {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          color: var(--paoir-text-muted);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          opacity: 0.85;
        }
        .result-footer {
          text-align: center;
          font-size: 0.75rem;
          color: var(--paoir-text-muted);
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--paoir-border);
        }
      `}</style>
    </div>
  )
}
