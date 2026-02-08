import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isValidParticipationCode } from '../config'

export default function AuthGate() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('paoir_authenticated') === '1') {
      navigate('/diagnosis', { replace: true })
    } else {
      setChecking(false)
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    const nick = nickname.trim()
    const trimmed = code.trim()
    if (!nick) {
      setError('닉네임을 입력해 주세요.')
      return
    }
    if (!trimmed) {
      setError('참여 코드를 입력해 주세요.')
      return
    }
    if (!isValidParticipationCode(trimmed)) {
      setError('유효하지 않은 참여 코드입니다. 연구소에 문의하세요.')
      return
    }
    setError('')
    sessionStorage.setItem('paoir_authenticated', '1')
    sessionStorage.setItem('paoir_nickname', nick)
    sessionStorage.setItem('paoir_participation_code', trimmed)
    navigate('/diagnosis')
  }

  if (checking) {
    return (
      <div className="auth-gate">
        <div className="auth-card">
          <p className="auth-loading">로딩 중...</p>
        </div>
        <style>{`
          .auth-gate { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0e17; }
          .auth-card { background: rgba(15,23,42,0.5); padding: 2rem; border-radius: 16px; }
          .auth-loading { color: rgba(248,250,252,0.7); }
        `}</style>
      </div>
    )
  }

  return (
    <div className="auth-gate">
      <div className="auth-card">
        <img src="/logo.png" alt="PAIOR(파이오르)" className="auth-logo" />
        <h1 className="auth-title">PAIOR(파이오르) Lab</h1>
        <p className="auth-subtitle">인적 자성 및 역동 분석 시스템</p>
        <p className="auth-notice">본 진단은 인가된 연구 참여자에게만 제공됩니다. 부여받은 코드와 닉네임을 입력하십시오.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              setError('')
            }}
            placeholder="닉네임 입력"
            className="auth-input"
            autoComplete="off"
            autoFocus
          />
          <div className="auth-code-wrap">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              placeholder="참여 코드 (PAIOR700~777)"
              className="auth-input"
              autoComplete="off"
            />
            <p className="auth-code-hint">인증코드: <strong>PAIOR700</strong></p>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button
            type="submit"
            className="auth-btn"
            disabled={!nickname.trim() || !isValidParticipationCode(code.trim())}
          >
            진단 시작하기
          </button>
        </form>
      </div>

      <style>{`
        .auth-gate {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(180deg, #0a0c14 0%, #0d1117 30%, #161b22 70%, #0a0c14 100%);
          background-attachment: fixed;
        }

        .auth-card {
          background: rgba(13, 17, 23, 0.92);
          border: 1px solid rgba(48, 54, 61, 0.6);
          border-radius: 24px;
          padding: 2.5rem 3rem;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.03);
        }

        .auth-logo {
          width: 220px;
          height: auto;
          margin: 0 auto 1.5rem;
          display: block;
          filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgba(248, 250, 252, 0.95);
          margin-bottom: 0.25rem;
          letter-spacing: 0.05em;
        }
        .auth-subtitle {
          font-size: 0.9rem;
          color: rgba(148, 163, 184, 0.9);
          margin-bottom: 0.5rem;
          letter-spacing: 0.02em;
        }

        .auth-notice {
          font-size: 0.85rem;
          color: rgba(148, 163, 184, 0.85);
          margin-bottom: 2rem;
          letter-spacing: 0.01em;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .auth-code-wrap { position: relative; }
        .auth-code-hint {
          font-size: 0.8rem;
          color: #fbbf24;
          margin-top: 0.4rem;
          margin-bottom: 0;
        }
        .auth-code-hint strong { font-weight: 700; }

        .auth-input {
          width: 100%;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.9);
          color: #f8fafc;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .auth-input::placeholder {
          color: rgba(148, 163, 184, 0.45);
        }

        .auth-input:focus {
          border-color: rgba(59, 130, 246, 0.6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .auth-error {
          color: #f87171;
          font-size: 0.9rem;
          margin: 0;
        }

        .auth-btn {
          padding: 1rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #1e40af, #1d4ed8);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);
        }

        .auth-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          background: #374151;
        }

        .auth-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.4);
        }

        .auth-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  )
}
