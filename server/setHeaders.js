/**
 * PAIOR 구글 시트 헤더 자동 생성
 * 실행: node server/setHeaders.js
 *
 * 권한 오류 시: credentials.json의 client_email을 시트에 '편집자'로 공유
 */

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { EXPECTED_HEADERS, colToLetter } from './sheetConfig.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SPREADSHEET_ID = '1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY'
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1'

async function setHeaders() {
  const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || join(__dirname, 'credentials.json')

  if (!existsSync(credentialsPath)) {
    console.error('[오류] credentials.json이 없습니다.')
    console.log('  → Google Cloud Console에서 서비스 계정 JSON 키를 다운로드 후 server/credentials.json으로 저장하세요.')
    process.exit(1)
  }

  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'))
  const serviceAccountEmail = credentials.client_email

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  const sheets = google.sheets({ version: 'v4', auth })

  console.log('[시도] 구글 시트 쓰기 중...')
  console.log(`  시트 URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`)
  console.log(`  시트 탭: ${SHEET_NAME}`)

  const lastCol = colToLetter(EXPECTED_HEADERS.length)

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:${lastCol}1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [EXPECTED_HEADERS] }
    })
    console.log('[완료] PAIOR 헤더가 생성되었습니다.')
    console.log(`  시트: ${SHEET_NAME}, 행 1`)
    console.log(`  컬럼: ${EXPECTED_HEADERS.join(', ')}`)
  } catch (err) {
    if (err.code === 403 || err.message?.includes('permission') || err.message?.includes('PERMISSION_DENIED')) {
      console.error('[권한 오류] 시트에 쓰기 권한이 없습니다.')
      console.log('')
      console.log('1. 아래 URL의 시트가 맞는지 확인하세요:')
      console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`)
      console.log('')
      console.log('2. 시트 공유: 우측 상단 "공유" → 아래 이메일 "편집자"로 추가')
      console.log(`   ${serviceAccountEmail}`)
      console.log('')
      console.log('3. 시트 탭 이름이 "Sheet1"이 아닌 경우 .env에 GOOGLE_SHEET_NAME=실제탭이름 설정')
    } else {
      console.error('[오류]', err.message)
    }
    process.exit(1)
  }
}

setHeaders()
