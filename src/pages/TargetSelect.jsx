import { useNavigate } from 'react-router-dom'
import { TARGET_OPTIONS } from '../data/questions'

export default function TargetSelect() {
  const navigate = useNavigate()

  const handleSelect = (target) => {
    sessionStorage.setItem('paoir_target', target)
    navigate('/survey')
  }


  return (
    <div className="target-select">
      <header className="header">
        <img src="/logo.png" alt="PAIOR(파이오르)" className="target-logo" />
        <h1>PAIOR(파이오르) Lab</h1>
        <p className="subtitle">P + AIOR · 학습 멘탈 정밀 진단</p>
        <p className="intro">
          <strong>PAIOR(파이오르) = P</strong> (9가지 심리 역동) + <strong>AIOR</strong> (4가지 기질 엔진)<br />
          심리 측정 연구 기반으로 당신의 기질 엔진(Action, Inquiry, Order, Relation)과 심리 역동을 분석합니다.
        </p>
      </header>

      <section className="target-section">
        <h2>당신은 누구인가요?</h2>
        <p className="guide">진단에 맞는 대상 그룹을 선택해 주세요.</p>
        
        <div className="target-grid">
          {TARGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="target-card"
              onClick={() => handleSelect(opt.value)}
            >
              <span className="target-label">{opt.label}</span>
              <span className="target-desc">{opt.description}</span>
            </button>
          ))}
        </div>

        <div className="notice">
          <p>※ 초등·중고등 선택 시 보호자 동의가 필요합니다.</p>
          <p>※ 이름은 수집하지 않으며, 이메일만 고유 식별값으로 사용합니다.</p>
        </div>
      </section>

      <style>{`
        .target-select {
          min-height: 100vh;
          padding: 3rem 1.5rem;
          max-width: 720px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem 1rem;
          border-bottom: 1px solid var(--paoir-border);
        }

        .target-logo {
          width: 200px;
          height: auto;
          margin: 0 auto 1.5rem;
          display: block;
        }

        .header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--paoir-secondary);
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1rem;
          color: var(--paoir-primary);
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .intro {
          font-size: 0.95rem;
          color: var(--paoir-text);
          line-height: 1.8;
          max-width: 520px;
          margin: 0 auto;
        }

        .target-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .guide {
          color: var(--paoir-text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .target-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .target-card {
          background: var(--paoir-card);
          border: 2px solid var(--paoir-border);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .target-card:hover {
          border-color: var(--paoir-primary);
          background: #eff6ff;
          transform: translateY(-2px);
        }

        .target-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--paoir-secondary);
        }

        .target-desc {
          font-size: 0.8rem;
          color: var(--paoir-text-muted);
        }

        .notice {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 1rem;
          font-size: 0.8rem;
          color: var(--paoir-text-muted);
        }

        .notice p {
          margin-bottom: 0.25rem;
        }

        @media (max-width: 480px) {
          .target-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
