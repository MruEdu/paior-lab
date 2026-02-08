# PAIOR Vercel 배포 가이드 (터미널 없이)

**박사님이 터미널을 사용하지 않고, Vercel 대시보드에서 GitHub 저장소만 연결하면 바로 배포됩니다.**

---

## 전제 조건

- 코드가 **GitHub 저장소**에 올라가 있어야 합니다.
- (처음 한 번만) GitHub에 코드를 올리는 방법은 아래 **방법 A** 또는 **방법 B** 중 선택하세요.

---

## 방법 A: GitHub Desktop으로 코드 올리기 (추천, 터미널 없음)

1. **GitHub Desktop** 다운로드: https://desktop.github.com
2. 설치 후 GitHub 계정으로 로그인
3. **File** → **Add Local Repository** → PAIOR 프로젝트 폴더 선택
4. "This directory does not appear to be a Git repository" 경고가 나오면 **Create a repository** 클릭
5. **Repository name**: `paoir-diagnostic` (또는 원하는 이름)
6. **Publish repository** 클릭 → GitHub에 업로드 완료

---

## 방법 B: GitHub 웹에서 새 저장소 만들기

1. **GitHub** (https://github.com) 접속 → 로그인
2. **+** → **New repository** 클릭
3. **Repository name** 입력 (예: `paoir-diagnostic`) → **Create repository**
4. 생성된 페이지에서 **"uploading an existing file"** 링크 클릭
5. PAIOR 프로젝트 폴더의 **필요한 파일만** 끌어다 놓기
   - `src`, `public`, `index.html`, `package.json`, `vite.config.js`, `vercel.json` 등
   - `node_modules`, `.env`는 제외 (용량·보안)
6. **Commit changes** 클릭

> ⚠️ `.env`, `credentials.json`, `*.db`는 **절대** 업로드하지 마세요.

---

## Vercel 배포 (3단계, 모두 웹에서)

### 1단계: Vercel 접속

1. **https://vercel.com** 접속
2. **Sign Up** → **Continue with GitHub** 선택 (GitHub 계정으로 로그인)

### 2단계: 프로젝트 Import

1. **Add New** → **Project** 클릭
2. **Import Git Repository**에서 GitHub 저장소 목록이 표시됩니다
3. `paoir-diagnostic` (또는 올려둔 저장소 이름) 선택
4. **Import** 클릭

### 3단계: 배포

1. **Configure Project** 화면에서 아래만 확인:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
2. **Deploy** 클릭

**1~2분 후** 배포가 완료됩니다.

---

## 배포 URL 확인

배포 완료 후 예시 주소:

```
https://paoir-diagnostic-xxxxx.vercel.app
```

이 주소를 참여자에게 전달하면 됩니다.

---

## 자동 재배포

GitHub 저장소에 코드가 **push**될 때마다 Vercel이 자동으로 새로 배포합니다.

- GitHub Desktop에서 **Push origin** 클릭 → 자동 재배포
- 또는 터미널에서 `git push` → 자동 재배포

---

## vercel.json 설정 (이미 적용됨)

프로젝트에 `vercel.json`이 포함되어 있어, SPA 라우팅이 자동으로 동작합니다.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 참여 코드

- **PAIOR700** ~ **PAIOR777** (78개) 사용 가능
- 대소문자 구분 없음 (paior700, PAIOR700 등 모두 허용)

---

## 아키텍처 안내 (중요)

| 서비스 | 역할 | 배포 위치 |
|--------|------|-----------|
| **프론트엔드** (Vite/React) | 진단 UI, 결과 표시 | **Vercel** |
| **백엔드** (Express) | API, DB, 구글 시트 연동 | **별도 필요** (Railway, Render 등) |
| **구글 시트** | 진단 결과 저장 | API 인증 후 자동 연동 |

Vercel은 **프론트엔드만** 배포합니다. `/api/submit` 등의 API는 **서버(Express)** 에서 동작하므로, 백엔드를 별도로 배포해야 합니다.

---

## 구글 시트 API 연동 (환경변수)

백엔드를 Railway·Render 등에 배포할 때, **구글 시트 전송**이 끊기지 않도록 아래를 설정하세요.

### 1. Google Cloud 콘솔

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **API 및 서비스** → **사용자 인증 정보** → **서비스 계정** 생성
3. **키** → **키 추가** → **JSON** 다운로드
4. 다운로드한 JSON 파일 내용을 **환경변수**로 넣는 방법:
   - **방법 A**: `credentials.json`으로 저장 후 `GOOGLE_CREDENTIALS_PATH`로 경로 지정 (로컬/서버)
   - **방법 B**: JSON 전체를 `GOOGLE_CREDENTIALS_JSON` 환경변수에 넣기 (Railway/Render 등에서 권장)

### 2. 백엔드 환경변수 (Railway / Render 예시)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `GOOGLE_CREDENTIALS_PATH` | credentials.json 경로 | `./credentials.json` |
| `GOOGLE_CREDENTIALS_JSON` | (선택) JSON 전체 문자열 | `{"type":"service_account",...}` |
| `GOOGLE_SHEET_NAME` | 시트 탭 이름 | `Sheet1` (기본값) |
| `PORT` | 서버 포트 | `3001` |

### 3. 구글 시트 공유

1. 구글 시트 열기
2. **공유** → 서비스 계정 이메일(`xxx@xxx.iam.gserviceaccount.com`)에 **편집자** 권한 부여

### 4. 프론트엔드 API URL 설정

배포된 백엔드 주소(예: `https://paoir-api.railway.app`)가 있다면, 프론트엔드에서 해당 URL로 API 요청이 가도록 `vite.config.js`의 `proxy` 또는 `VITE_API_URL` 환경변수를 설정하세요.

---

## 요약

| 단계 | 내용 |
|------|------|
| 1 | GitHub에 코드 업로드 (Desktop 또는 웹) |
| 2 | Vercel.com → Add New → Project → GitHub 저장소 선택 |
| 3 | Deploy 클릭 |
| 4 | (선택) 백엔드·구글 시트 연동 시 Railway/Render 배포 + 환경변수 설정 |

**터미널 명령 없이** Vercel 배포는 위 1~3단계만 따라하시면 됩니다.
