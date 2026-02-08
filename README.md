# PAIOR 진단 플랫폼

현용찬(2022) 연구 기반의 학습 멘탈 정밀 진단 플랫폼입니다.

## 화면 흐름

1. **대상 선택** - 초등 / 중·고등 / 대학생 / 성인
2. **134문항 설문** - AOIR 40 + P 90 + V 4 (리커트 5점 척도)
3. **이메일/동의/인구학적 정보 입력** - 이메일(고유 ID), 개인정보 동의, 성별, 지역, 현재 상태

## 개인정보 정책

- **이메일**: 고유 식별값(ID)으로 사용
- **이름**: 수집하지 않음

## 실행 방법

### 빠른 미리보기 (프론트엔드만)

```powershell
cd e:\PAOIR_Project
npm install --ignore-scripts   # Python 없이 설치
npm run dev
```

또는 **`미리보기_실행.bat`** 더블클릭

→ 브라우저에서 **http://localhost:5173** 접속 (설문·결과 화면 모두 동작)

### 전체 실행 (DB + API 서버)

```powershell
npm install
npm run dev:all                # 프론트 + API 동시 실행
```

> DB 사용 시: `npm install better-sqlite3` (Python·빌드 도구 필요). 미설치 시 Mock 모드로 동작.

또는 별도 터미널에서:
- `npm run server`  (포트 3001)
- `npm run dev`     (포트 5173)

## 기술 스택

- **프론트엔드**: React, Vite, React Router
- **백엔드**: Node.js, Express
- **DB**: SQLite (better-sqlite3) 또는 Mock 모드
- **Google Sheets**: 실시간 데이터 전송

## Google Sheets 연동

1. [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
2. Google Sheets API 활성화
3. 서비스 계정 생성 → JSON 키 다운로드
4. `server/credentials.json`으로 저장
5. `.env` 파일 생성 (`.env.example` 참고):
   - `GOOGLE_SPREADSHEET_ID`: 시트 URL의 스프레드시트 ID
   - `GOOGLE_SHEET_NAME`: 시트 탭 이름 (기본: Sheet1)
6. Google 시트를 서비스 계정 이메일에 **편집자** 권한 부여
7. 시트 1행에 헤더: `이메일 | 대상 | AOIR점수 | P점수 | 해석문구 | 지역 | 성별`

## 문항 구성

- **AOIR 기질 엔진 (40문항)**: 실행(A), 질서(O), 탐구(I), 관계(R) - 교차 배치
- **P 심리 역동 (90문항)**: 고군분투, 반항, 완벽, 외고집, 잡념, 만족, 적당, 의존, 싫증 - 요인별 10문항
- **V 타당도 (4문항)**: 30, 60, 90, 120번 지점에 함정 문항으로 숨김

## 이론적 근거

- **AOIR**: 아이젠크, 매슬로우, 배런코언(패턴 시커), 로저스
- **P**: 다이안 히콕스 저성취 모델
- **데이터**: 현용찬(2022) 1,645건 상담 호소문제 텍스트 마이닝
