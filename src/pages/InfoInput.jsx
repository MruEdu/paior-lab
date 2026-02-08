import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateReport } from '../lib/analysisEngine'

const REGIONS = ['서울', '경기', '인천', '강원', '충청', '전라', '경상', '제주']

const CONCERNS = [
  { value: '학업성적', label: '학업/성적' },
  { value: '진로취업', label: '진로/취업' },
  { value: '대인관계', label: '대인관계' },
  { value: '경제적문제', label: '경제적 문제' },
  { value: '심리적불안', label: '심리적 불안' },
  { value: '기타', label: '기타' }
]

function getDetailOptions(target) {
  switch (target) {
    case '초등':
      return [
        { value: '1학년', label: '1학년' },
        { value: '2학년', label: '2학년' },
        { value: '3학년', label: '3학년' },
        { value: '4학년', label: '4학년' },
        { value: '5학년', label: '5학년' },
        { value: '6학년', label: '6학년' }
      ]
    case '중고등':
      return [
        { value: '중1', label: '중1' },
        { value: '중2', label: '중2' },
        { value: '중3', label: '중3' },
        { value: '고1', label: '고1' },
        { value: '고2', label: '고2' },
        { value: '고3', label: '고3' }
      ]
    case '대학생':
    case '대학생(대학/대학원)':
      return [
        { value: '인문', label: '인문' },
        { value: '사회', label: '사회' },
        { value: '자연', label: '자연' },
        { value: '공학', label: '공학' },
        { value: '예체능', label: '예체능' },
        { value: '의약', label: '의약' },
        { value: '기타', label: '기타' }
      ]
    case '성인':
    case '성인/일반':
      return [
        { value: '직장인', label: '직장인' },
        { value: '자영업', label: '자영업' },
        { value: '구직중', label: '구직 중' },
        { value: '취업준비생', label: '취업 준비생' },
        { value: '전업주부', label: '전업 주부' },
        { value: '프리랜서', label: '프리랜서' },
        { value: '기타', label: '기타' }
      ]
    default:
      return []
  }
}

function getDetailLabel(target) {
  switch (target) {
    case '초등': return '현재 학년'
    case '중고등': return '현재 학년'
    case '대학생':
    case '대학생(대학/대학원)': return '전공 계열'
    case '성인':
    case '성인/일반': return '현재 직업 상태'
    default: return '세부 정보'
  }
}

export default function InfoInput() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [gender, setGender] = useState('')
  const [region, setRegion] = useState('')
  const [detail, setDetail] = useState('')
  const [concern, setConcern] = useState('')
  const [target, setTarget] = useState('')

  useEffect(() => {
    const answers = sessionStorage.getItem('paoir_answers')
    const t = sessionStorage.getItem('paoir_target')
    if (!answers || !t) {
      navigate('/diagnosis')
      return
    }
    setTarget(t)
    setDetail('')
  }, [navigate])

  const validateEmail = (e) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(e)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      alert('올바른 이메일 주소를 입력해 주세요.')
      return
    }
    if (!agreePrivacy) {
      alert('개인정보 수집 및 이용에 동의해 주세요.')
      return
    }

    const answers = JSON.parse(sessionStorage.getItem('paoir_answers') || '{}')
    const nickname = sessionStorage.getItem('paoir_nickname') || ''
    const participationCode = sessionStorage.getItem('paoir_participation_code') || ''
    const payload = {
      email,
      nickname,
      participationCode,
      target,
      gender,
      region,
      detail,
      concern,
      answers,
      agreedAt: new Date().toISOString()
    }

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem('paoir_result', JSON.stringify(data.result))
        sessionStorage.setItem('paoir_email', email)
        navigate('/result')
      } else {
        alert(data.error || '제출에 실패했습니다.')
      }
    } catch (err) {
      console.error(err)
      const result = generateLocalResult(answers)
      sessionStorage.setItem('paoir_result', JSON.stringify(result))
      sessionStorage.setItem('paoir_email', email)
      navigate('/result')
    }
  }

  function generateLocalResult(answers) {
    return generateReport(answers, target)
  }

  const detailOptions = getDetailOptions(target)

  return (
    <div className="info-page">
      <div className="info-card">
        <h1>인구학적 특성</h1>
        <p className="intro">134개 문항이 완료되었습니다. 정확한 분석을 위해 아래 정보를 입력해 주세요. <strong>이름은 수집하지 않습니다.</strong></p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>이메일 (고유 식별값) *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="field">
            <label>성별</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="남성"
                  checked={gender === '남성'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>남성</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="여성"
                  checked={gender === '여성'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>여성</span>
              </label>
            </div>
          </div>

          <div className="field">
            <label>거주 지역</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">선택</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {detailOptions.length > 0 && (
            <div className="field">
              <label>{getDetailLabel(target)}</label>
              <select value={detail} onChange={(e) => setDetail(e.target.value)}>
                <option value="">선택</option>
                {detailOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label>현재 가장 큰 고민 (1순위)</label>
            <select value={concern} onChange={(e) => setConcern(e.target.value)}>
              <option value="">선택</option>
              {CONCERNS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
              />
              <span>위 입력 정보는 PAIOR(파이오르) 통계 분석 및 리포트 생성을 위해서만 활용됩니다. *</span>
            </label>
          </div>

          <button type="submit" className="btn-submit">
            결과 확인
          </button>
        </form>
      </div>

      <style>{`
        .info-page {
          min-height: 100vh;
          padding: 2rem 1rem;
          max-width: 480px;
          margin: 0 auto;
        }

        .info-card {
          background: var(--paoir-card);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .info-card h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .intro {
          color: var(--paoir-text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .field {
          margin-bottom: 1.25rem;
        }

        .field label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .field input[type="email"],
        .field select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--paoir-border);
          border-radius: 8px;
          font-size: 1rem;
        }

        .field input[type="email"]:focus,
        .field select:focus {
          outline: none;
          border-color: var(--paoir-primary);
        }

        .radio-group {
          display: flex;
          gap: 1.5rem;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 400;
        }

        .radio-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--paoir-primary);
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 400;
          font-size: 0.9rem;
        }

        .checkbox-label input {
          margin-top: 0.25rem;
          width: 18px;
          height: 18px;
          accent-color: var(--paoir-primary);
        }

        .btn-submit {
          width: 100%;
          background: var(--paoir-primary);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          margin-top: 1rem;
        }

        .btn-submit:hover {
          background: var(--paoir-primary-dark);
        }
      `}</style>
    </div>
  )
}
