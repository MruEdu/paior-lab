import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuestions, LIKERT_OPTIONS } from '../data/questions'

export default function Survey() {
  const navigate = useNavigate()
  const [target, setTarget] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showConsent, setShowConsent] = useState(false)
  const [consentAgreed, setConsentAgreed] = useState(false)

  useEffect(() => {
    const t = sessionStorage.getItem('paoir_target')
    if (!t) {
      navigate('/diagnosis')
      return
    }
    setTarget(t)
    setQuestions(getQuestions(t))
  }, [navigate])

  const needConsent = target === '초등' || target === '중고등'
  const showConsentCheck = needConsent && currentIndex === 0 && !showConsent

  const handleConsentNext = () => {
    if (!consentAgreed && needConsent) return
    setShowConsent(true)
  }

  const currentQ = questions[currentIndex]
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const advanceToNext = (newAnswers) => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      sessionStorage.setItem('paoir_answers', JSON.stringify(newAnswers))
      sessionStorage.setItem('paoir_target', target)
      navigate('/info')
    }
  }

  const handleSelect = (value) => {
    const questionId = currentQ?.id
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    advanceToNext(newAnswers)
  }

  if (!questions.length) return <div className="loading">로딩 중...</div>

  // 보호자 동의 화면
  if (showConsentCheck) {
    return (
      <div className="survey-page">
        <div className="survey-card consent-card">
          <h2>보호자 동의</h2>
          <p className="consent-text">
            만 14세 미만의 경우 보호자 동의가 필요합니다.<br />
            본인은 보호자의 동의를 받았음을 확인합니다.
          </p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
            />
            <span>보호자 동의를 받았습니다</span>
          </label>
          <button
            className="btn-primary"
            onClick={handleConsentNext}
            disabled={!consentAgreed}
          >
            다음
          </button>
        </div>
        <style>{surveyStyles}</style>
      </div>
    )
  }

  return (
    <div className="survey-page">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="survey-card">
        <div className="question-meta">
          <span>문항 {currentIndex + 1} / {questions.length}</span>
          {currentQ?.type === 'AIOR' && (
            <span className="factor-badge">{currentQ.factor} 엔진</span>
          )}
        </div>

        <p className="question-text">{currentQ?.text}</p>

        <div className="options">
          {LIKERT_OPTIONS.map((opt) => (
            <label key={opt.value} className="option-label">
              <input
                type="radio"
                name={`q-${currentQ?.id}`}
                value={opt.value}
                checked={answers[currentQ?.id] === opt.value}
                onChange={() => handleSelect(opt.value)}
              />
              <span className="option-text">{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="nav-buttons">
          <button
            className="btn-prev"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            이전
          </button>
        </div>
      </div>

      <style>{surveyStyles}</style>
    </div>
  )
}

const surveyStyles = `
  .survey-page {
    min-height: 100vh;
    padding: 2rem 1rem;
    max-width: 560px;
    margin: 0 auto;
  }

  .loading {
    text-align: center;
    padding: 4rem;
    color: var(--paoir-text-muted);
  }

  .progress-bar {
    height: 6px;
    background: var(--paoir-border);
    border-radius: 3px;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--paoir-primary);
    transition: width 0.3s;
  }

  .survey-card {
    background: var(--paoir-card);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  }

  .consent-card {
    max-width: 400px;
    margin: 0 auto;
  }

  .consent-card h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .consent-text {
    margin-bottom: 1.5rem;
    color: var(--paoir-text-muted);
    font-size: 0.95rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    cursor: pointer;
  }

  .checkbox-label input {
    width: 18px;
    height: 18px;
  }

  .question-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    color: var(--paoir-text-muted);
  }

  .factor-badge {
    background: #e0e7ff;
    color: var(--paoir-primary);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .question-text {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
    line-height: 1.7;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 2px solid var(--paoir-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-label:hover {
    border-color: var(--paoir-primary);
    background: #f8fafc;
  }

  .option-label:has(input:checked) {
    border-color: var(--paoir-primary);
    background: #eff6ff;
  }

  .option-label input {
    width: 20px;
    height: 20px;
  }

  .nav-buttons {
    margin-top: 2rem;
  }

  .btn-prev {
    background: var(--paoir-border);
    color: var(--paoir-text);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
  }

  .btn-prev:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--paoir-primary);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
  }

  .btn-primary:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`
