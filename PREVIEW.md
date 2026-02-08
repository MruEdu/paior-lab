# PAIOR 진단 플랫폼 - 미리보기 가이드

## 방법 1: 프론트엔드만 실행 (가장 간단)

**서버 없이** 화면 흐름을 확인할 수 있습니다. API 호출 실패 시 로컬에서 결과를 생성합니다.

```powershell
cd e:\PAOIR_Project
npm install --ignore-scripts
npm run dev
```

브라우저에서 **http://localhost:5173** 접속

- ✅ 대상 선택, 134문항 설문, 인구학적 정보 입력, 결과 페이지 모두 동작
- ⚠️ DB 저장·Google Sheets 전송은 안 됨 (API 서버 미실행)

---

## 방법 2: 전체 서버 실행 (DB + API)

**better-sqlite3** 설치를 위해 다음 중 하나가 필요합니다.

### A. Python 설치 후

1. [Python 3.x](https://www.python.org/downloads/) 설치 (설치 시 "Add to PATH" 체크)
2. Visual Studio Build Tools 설치 (선택):
   ```powershell
   npm install -g windows-build-tools
   ```
3. 패키지 설치 및 실행:
   ```powershell
   cd e:\PAOIR_Project
   npm install
   npm run dev:all
   ```

### B. WSL(Windows Subsystem for Linux) 사용

Linux 환경에서는 better-sqlite3가 보통 문제없이 설치됩니다.

```bash
cd /mnt/e/PAOIR_Project
npm install
npm run dev:all
```

---

## 실행 후 화면 흐름

1. **대상 선택** (/) → 초등/중고등/대학생/성인
2. **보호자 동의** (초·중고등 선택 시)
3. **134문항 설문** → 리커트 5점
4. **인구학적 특성** → 이메일, 성별, 지역, 학년/전공/직업, 고민, 동의
5. **결과** → AOIR 레이더, P-역동, 분석 리포트

---

## 포트

- **프론트엔드**: http://localhost:5173
- **API 서버**: http://localhost:3001
