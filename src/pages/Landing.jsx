import { useNavigate } from 'react-router-dom'

const OPEN_CHAT_URL = 'https://open.kakao.com/o/sqiu2yfi'

export default function Landing() {
  const navigate = useNavigate()

  const goToDiagnose = () => navigate('/diagnose')
  const goToConsult = () => window.open(OPEN_CHAT_URL, '_blank')

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing-page">
      {/* 2월 한정 이벤트 슬림 배너 */}
      <div className="event-banner">
        <span className="event-text">
          📢 2월 한 달간 출시 기념 <strong>무료</strong> 개방! 인증코드 <strong className="event-code">PAIOR700</strong>을 입력하세요.
        </span>
        <button type="button" className="event-banner-btn" onClick={goToDiagnose}>
          진단 시작하기
        </button>
      </div>

      {/* 상단 네비게이션 */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <span className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            학습멘탈연구소
          </span>
          <div className="nav-links">
            <button type="button" className="nav-link" onClick={() => scrollTo('about-lab')}>연구소 소개</button>
            <button type="button" className="nav-link" onClick={() => scrollTo('about-paior')}>PAIOR 소개</button>
            <button type="button" className="nav-link" onClick={() => scrollTo('book')}>도서 소개</button>
            <button type="button" className="nav-link" onClick={() => scrollTo('consult')}>문의하기</button>
            <button type="button" className="nav-btn-consult" onClick={goToConsult}>1:1 전문가 상담 및 강의 문의</button>
            <button type="button" className="nav-btn-diagnose" onClick={goToDiagnose}>진단하기</button>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-headline">
            학습 멘탈 정밀 진단, PAIOR(파이오르) Lab
          </h1>
          <p className="hero-subheadline">
            공부가 어려운 이유는 의지가 부족해서가 아니라, 내 마음의 <strong className="highlight-engine">'기질 엔진'</strong>을 사용하는 법을 모르기 때문입니다. <strong className="highlight-paior">PAIOR(파이오르)</strong>는 4가지 기질 엔진과 9가지 심리 역동을 분석하여, 당신만의 가장 효율적인 학습 경로를 찾아드립니다.
          </p>
          <p className="hero-value">
            지금 바로 18년 노하우가 담긴 정밀 진단을 <strong>무료</strong>로 체험해보세요. (정가 55,000원 → 2월 한정 0원)
          </p>
          <div className="hero-event-box">
            <span className="hero-event-text">📢 2월 한 달간 출시 기념 <strong>무료</strong> 개방! 인증코드 <strong className="event-code-inline">PAIOR700</strong>을 입력하세요.</span>
          </div>
          <button type="button" className="hero-cta" onClick={goToDiagnose}>
            나의 학습 멘탈 확인하기
          </button>
        </div>
      </section>

      {/* 카드 그리드 - 연구소 소개 / PAIOR 소개 */}
      <div className="cards-grid">
        <section id="about-lab" className="card-section">
          <div className="card">
            <h2 className="section-title">연구소 소개</h2>
            <p className="section-text">
              학습멘탈연구소는 학습자의 기질(AIOR)과 심리 역동(P)을 과학적으로 분석하여
              개인화된 학습 설계도를 제시하는 연구 기관입니다.
            </p>
          </div>
        </section>
        <section id="about-paior" className="card-section">
          <div className="card">
            <h2 className="section-title">PAIOR 소개</h2>
            <div className="aior-factors">
              <p className="factor-item"><span className="factor-a">A</span>ction (추진력): 생각을 즉시 실행으로 옮기는 폭발적인 에너지</p>
              <p className="factor-item"><span className="factor-i">I</span>nquiry (탐구심): 지식의 원리를 깊이 있게 파고드는 몰입의 힘</p>
              <p className="factor-item"><span className="factor-o">O</span>rder (질서): 체계적인 계획과 규칙으로 완성도를 높이는 힘</p>
              <p className="factor-item"><span className="factor-r">R</span>elationship (관계): 함께 공감하고 소통하며 성장하는 조화의 에너지</p>
            </div>
          </div>
        </section>
      </div>

      {/* 도서 홍보 */}
      <section id="book" className="section section-book">
        <div className="section-inner book-inner">
          <div className="book-image-wrap">
            <img src="/boock2.jpg" alt="기적의 학습 멘탈 수업" className="book-image" />
          </div>
          <div className="book-text">
            <h2 className="book-title">그랜드 마스터 저자: 기적의 학습 멘탈 수업</h2>
            <p className="book-desc">10대들의 공부 엔진에 불을 지피는 단단한 학습 멘탈 만들기</p>
            <button type="button" className="book-cta" onClick={goToDiagnose}>
              나의 학습 멘탈 확인하기
            </button>
          </div>
        </div>
      </section>

      {/* QR 상담 섹션 */}
      <section id="consult" className="section section-qr">
        <div className="qr-card">
          <h2 className="qr-title">1:1 전문가 상담 및 강의 문의</h2>
          <p className="qr-desc">스마트폰으로 QR을 스캔하여 바로 상담하세요</p>
          <a href={OPEN_CHAT_URL} target="_blank" rel="noopener noreferrer" className="qr-link">
            <img src="/qr.jpg" alt="카카오 오픈채팅 QR 코드" className="qr-image" />
          </a>
          <button type="button" className="consult-btn" onClick={goToConsult}>
            1:1 전문가 상담 및 강의 문의
          </button>
        </div>
      </section>

      {/* 플로팅 버튼 */}
      <button type="button" className="floating-cta" onClick={goToDiagnose} aria-label="지금 진단하기">
        지금 진단하기
      </button>

      {/* 푸터 */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <button type="button" className="footer-consult-btn" onClick={goToConsult}>
            1:1 전문가 상담 및 강의 문의
          </button>
          <p className="footer-text">
            학습멘탈연구소 | Developed & Authorized by 학습멘탈연구소 | © 2026 All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: linear-gradient(180deg, #05070a 0%, #0a0c14 15%, #0d1117 40%, #0f172a 70%, #0a0c14 100%);
          background-attachment: fixed;
          color: #f8fafc;
        }

        .event-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 101;
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
          color: #1e293b;
          padding: 0.5rem 1rem;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
          animation: event-shine 3s ease-in-out infinite;
        }
        @keyframes event-shine {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        .event-text strong { font-weight: 800; }
        .event-code { font-weight: 800; background: rgba(30, 41, 59, 0.15); padding: 0.15rem 0.5rem; border-radius: 6px; }
        .event-banner-btn {
          padding: 0.35rem 0.9rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
          background: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .event-banner-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        }

        .landing-nav {
          position: fixed;
          top: 40px;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(5, 7, 10, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(48, 54, 61, 0.5);
        }

        .nav-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0.875rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .nav-brand {
          font-size: 1.1rem;
          font-weight: 700;
          color: rgba(248, 250, 252, 0.98);
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .nav-brand:hover { opacity: 0.9; }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .nav-link {
          padding: 0.4rem 0.9rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(203, 213, 225, 0.95);
          background: transparent;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.08);
        }

        .nav-btn-consult {
          padding: 0.45rem 1rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1d4ed8;
          background: rgba(29, 78, 216, 0.2);
          border: 1px solid rgba(29, 78, 216, 0.4);
          border-radius: 8px;
          transition: background 0.2s, border-color 0.2s;
        }
        .nav-btn-consult:hover {
          background: rgba(29, 78, 216, 0.3);
          border-color: rgba(29, 78, 216, 0.6);
        }

        .nav-btn-diagnose {
          padding: 0.5rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #1e40af, #1d4ed8);
          border-radius: 10px;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
        }
        .nav-btn-diagnose:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.45);
          transform: translateY(-1px);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8rem 1.5rem 4rem;
          text-align: center;
        }

        .hero-content {
          max-width: 720px;
        }

        .hero-headline {
          font-size: 2rem;
          font-weight: 700;
          color: rgba(248, 250, 252, 0.98);
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
          line-height: 1.35;
        }

        .hero-subheadline {
          font-size: 1.05rem;
          color: rgba(148, 163, 184, 0.92);
          line-height: 1.9;
          margin-bottom: 1.25rem;
          letter-spacing: 0.02em;
        }

        .hero-value {
          font-size: 1rem;
          color: rgba(203, 213, 225, 0.95);
          line-height: 1.7;
          margin-bottom: 1.25rem;
          letter-spacing: 0.02em;
        }
        .hero-value strong { color: #fbbf24; font-weight: 700; }

        .hero-event-box {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%);
          border: 1px solid rgba(251, 191, 36, 0.5);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          color: rgba(248, 250, 252, 0.95);
          font-size: 0.95rem;
          font-weight: 500;
        }
        .event-code-inline { color: #fbbf24; font-weight: 800; }

        .hero-cta {
          padding: 1.25rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(29, 78, 216, 0.4);
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
        }
        .hero-cta:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          box-shadow: 0 12px 32px rgba(29, 78, 216, 0.5);
          transform: translateY(-2px);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          max-width: 960px;
          margin: 0 auto;
          padding: 0 1.5rem 4rem;
        }

        .card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(48, 54, 61, 0.5);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .card:hover {
          border-color: rgba(29, 78, 216, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .section-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: rgba(248, 250, 252, 0.98);
          margin-bottom: 0.75rem;
          letter-spacing: 0.02em;
        }

        .section-text {
          font-size: 0.95rem;
          color: rgba(148, 163, 184, 0.9);
          line-height: 1.85;
          letter-spacing: 0.02em;
        }

        .hero-subheadline .highlight-engine { color: #38bdf8; font-weight: 700; }
        .hero-subheadline .highlight-paior { color: #60a5fa; font-weight: 700; }

        .aior-factors { display: flex; flex-direction: column; gap: 0.75rem; }
        .factor-item {
          font-size: 0.95rem;
          color: rgba(148, 163, 184, 0.9);
          line-height: 1.6;
          letter-spacing: 0.02em;
        }
        .factor-a { color: #ef4444; font-weight: 800; font-size: 1.1em; }
        .factor-i { color: #3b82f6; font-weight: 800; font-size: 1.1em; }
        .factor-o { color: #eab308; font-weight: 800; font-size: 1.1em; }
        .factor-r { color: #22c55e; font-weight: 800; font-size: 1.1em; }

        .section-book {
          padding: 4rem 1.5rem;
        }

        .book-inner {
          display: flex;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .book-image-wrap {
          flex-shrink: 0;
        }

        .book-image {
          max-width: 280px;
          width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
        }

        .book-text {
          flex: 1;
          min-width: 260px;
        }

        .book-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: rgba(248, 250, 252, 0.98);
          margin-bottom: 0.75rem;
          letter-spacing: 0.02em;
          line-height: 1.4;
        }

        .book-desc {
          font-size: 1rem;
          color: rgba(148, 163, 184, 0.9);
          line-height: 1.8;
          margin-bottom: 1.5rem;
          letter-spacing: 0.02em;
        }

        .book-cta {
          padding: 0.9rem 1.75rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #1e40af, #1d4ed8);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
        }
        .book-cta:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.45);
          transform: translateY(-1px);
        }

        .section-qr {
          padding: 4rem 1.5rem 5rem;
        }

        .qr-card {
          max-width: 400px;
          margin: 0 auto;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(48, 54, 61, 0.5);
          border-radius: 16px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        }

        .qr-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: rgba(248, 250, 252, 0.98);
          margin-bottom: 0.5rem;
        }

        .qr-desc {
          font-size: 0.95rem;
          color: rgba(148, 163, 184, 0.9);
          margin-bottom: 1.5rem;
          letter-spacing: 0.02em;
        }

        .qr-link {
          display: inline-block;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .qr-link:hover { opacity: 0.9; }

        .qr-image {
          width: 160px;
          height: 160px;
          object-fit: contain;
          border-radius: 12px;
        }

        .consult-btn {
          display: block;
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.9rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #1e40af, #1d4ed8);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
        }
        .consult-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.45);
          transform: translateY(-1px);
        }

        .floating-cta {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 90;
          padding: 0.75rem 1.25rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #1e40af, #1d4ed8);
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.5);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .floating-cta:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 28px rgba(29, 78, 216, 0.6);
        }
        .floating-cta:active { transform: scale(0.98); }

        .landing-footer {
          padding: 2rem 1.5rem;
          text-align: center;
          border-top: 1px solid rgba(48, 54, 61, 0.5);
        }

        .footer-inner {
          max-width: 640px;
          margin: 0 auto;
        }

        .footer-consult-btn {
          display: inline-block;
          margin-bottom: 1rem;
          padding: 0.6rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #1e40af, #1d4ed8);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
        }
        .footer-consult-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.45);
          transform: translateY(-1px);
        }

        .footer-text {
          font-size: 0.85rem;
          color: rgba(148, 163, 184, 0.75);
          letter-spacing: 0.02em;
        }

        @media (max-width: 768px) {
          .hero-headline { font-size: 1.6rem; }
          .cards-grid {
            grid-template-columns: 1fr;
          }
          .book-inner {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .book-image { max-width: 240px; }
          .nav-links { gap: 0.35rem; }
        }

        @media (max-width: 480px) {
          .hero-headline { font-size: 1.4rem; }
          .nav-links { width: 100%; justify-content: flex-end; }
        }
      `}</style>
    </div>
  )
}
