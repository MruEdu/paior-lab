# Google Sheets API 설정 가이드

## 1. API 활성화 (필수)

**Google Sheets API**가 활성화되어 있어야 합니다. 아래 링크에서 **"사용"** 버튼을 클릭하세요.

**직접 링크** (프로젝트에 맞춰 자동 연결):
- 프로젝트 ID: `gen-lang-client-0573119213` → https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=gen-lang-client-0573119213
- 프로젝트 번호: `731765479107` → https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=731765479107

또는 일반 링크에서 프로젝트 선택 후 활성화:
- https://console.cloud.google.com/apis/library/sheets.googleapis.com

---

## 2. 시트 공유

1. 구글 시트 열기: https://docs.google.com/spreadsheets/d/1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY/edit
2. 우측 상단 **"공유"** 클릭
3. 아래 이메일을 **편집자** 권한으로 추가:
   ```
   (credentials.json의 client_email 참조)
   ```

---

## 3. 점검 스크립트

```bash
node server/checkSheetsAccess.js
```

- 성공: 시트 접근 및 쓰기 권한 확인
- 실패: 오류 유형별 해결 방법 출력

---

## 4. 헤더 생성

```bash
npm run sheets:headers
```
