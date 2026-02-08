/**
 * PAIOR 구글 시트 접근 점검
 * 실행: node server/checkSheetsAccess.js
 *
 * - 시트 ID 확인
 * - API 활성화 여부
 * - 권한 점검
 */

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SPREADSHEET_ID = '1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY'

// API 활성화 링크
const API_LINKS = {
  sheets: 'https://console.cloud.google.com/apis/library/sheets.googleapis.com',
  drive: 'https://console.cloud.google.com/apis/library/drive.googleapis.com'
}

async function check() {
  console.log('=== PAIOR 구글 시트 접근 점검 ===\n')
  console.log('1. 시트 ID:', SPREADSHEET_ID)
  console.log('   URL: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit\n')

  const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || join(__dirname, 'credentials.json')
  if (!existsSync(credentialsPath)) {
    console.error('[오류] credentials.json 없음')
    process.exit(1)
  }

  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'))
  console.log('2. 서비스 계정:', credentials.client_email)

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
  })

  const sheets = google.sheets({ version: 'v4', auth })

  // 1단계: metadata 읽기 시도 (API 활성화 + 읽기 권한 확인)
  console.log('\n3. 시트 접근 시도 중...\n')
  let res
  try {
    res = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'properties.title,sheets.properties.title'
    })
    console.log('[성공] 시트 접근 가능')
    console.log('   제목:', res.data.properties?.title || '(없음)')
    const sheetTitles = res.data.sheets?.map(s => s.properties?.title).filter(Boolean)
    if (sheetTitles?.length) {
      console.log('   시트 탭:', sheetTitles.join(', '))
      console.log('\n   ※ 첫 번째 탭이 "Sheet1"이 아니면 .env에 GOOGLE_SHEET_NAME=실제탭이름 설정')
    }
  } catch (err) {
    const msg = err.message || ''
    console.error('[실패]', msg)

    if (msg.includes('Google Sheets API has not been used') || msg.includes('not been enabled') || msg.includes('Access Not Configured')) {
      const projectId = credentials.project_id || 'PROJECT_ID'
      const directLink = `https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=${projectId}`
      console.log('\n→ Google Sheets API가 이 프로젝트에서 활성화되지 않았습니다.')
      console.log('\n[해결] 아래 링크에서 "사용" 클릭:')
      console.log('  ' + directLink)
    } else if (err.code === 403 || msg.includes('PERMISSION_DENIED') || msg.includes('permission')) {
      console.log('\n→ 시트 공유가 필요합니다.')
      console.log('\n[해결] 시트 공유:')
      console.log('  1. 시트 열기 → 우측 상단 "공유"')
      console.log('  2. 아래 이메일을 "편집자"로 추가:')
      console.log('     ' + credentials.client_email)
    } else {
      console.log('\n원본 오류:', err)
    }
    process.exit(1)
  }

  // 2단계: 쓰기 시도 (A2 셀에 테스트 - 헤더 덮어쓰지 않음)
  try {
    const firstSheet = res?.data?.sheets?.[0]?.properties?.title || 'Sheet1'
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${firstSheet}!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['PAIOR 점검 성공']] }
    })
    console.log('\n[성공] 쓰기 권한 확인됨')
    console.log('\n=== 점검 완료. npm run sheets:headers 실행 가능 ===')
  } catch (err) {
    const msg = err.message || ''
    if (msg.includes('Unable to parse range') || msg.includes('Sheet1')) {
      console.log('\n→ 시트 탭 이름 확인 필요. .env에 GOOGLE_SHEET_NAME=실제탭이름 설정')
    } else {
      console.error('\n[쓰기 실패]', msg)
    }
    process.exit(1)
  }
}

check()
