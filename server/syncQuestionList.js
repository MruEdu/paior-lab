/**
 * 문항일람표 구글 시트 동기화
 * 실행: node server/syncQuestionList.js
 *
 * 문항 번호, 문항 내용, 측정 요인을 추출하여 '문항일람표' 탭에 저장
 */

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getQuestions } from '../src/data/questions.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SPREADSHEET_ID = '1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY'
const SHEET_TITLE = '문항일람표'

// 측정 요인 라벨 (구글 시트 A_action 등과 동일)
const FACTOR_LABELS = {
  A: 'A_실행',
  O: 'O_질서',
  I: 'I_탐구',
  R: 'R_관계',
  고군분투: 'P1_고군분투',
  반항: 'P2_반항',
  완벽: 'P3_완벽',
  외고집: 'P4_외고집',
  잡념: 'P5_잡념',
  만족: 'P6_만족',
  적당: 'P7_적당',
  의존: 'P8_의존',
  싫증: 'P9_싫증'
}

function getCategoryLabel(q) {
  if (q.type === 'V') return 'V_타당도'
  if (q.type === 'AIOR') return FACTOR_LABELS[q.factor] || q.factor
  if (q.type === 'P') return FACTOR_LABELS[q.factor] || q.factor
  return ''
}

async function syncQuestionList() {
  const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || join(__dirname, 'credentials.json')
  if (!existsSync(credentialsPath)) {
    console.error('[오류] credentials.json이 없습니다.')
    process.exit(1)
  }

  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'))
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  const sheets = google.sheets({ version: 'v4', auth })

  // getQuestions로 설문 노출 순서대로 문항 추출 (중고등 기준)
  const questions = getQuestions('중고등')

  const rows = [
    ['문항번호', '문항내용', '측정요인'],
    ...questions.map((q, i) => [
      i + 1,
      q.text || '',
      getCategoryLabel(q)
    ])
  ]

  console.log(`[추출] 총 ${questions.length}개 문항 (문항번호 1~${questions.length})`)
  console.log(`  시트 URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`)

  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
    const existingSheet = res.data.sheets?.find(
      (s) => s.properties?.title === SHEET_TITLE
    )

    if (!existingSheet) {
      console.log(`[추가] '${SHEET_TITLE}' 탭 생성 중...`)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: SHEET_TITLE }
              }
            }
          ]
        }
      })
    }

    const lastRow = rows.length
    const lastCol = 3 // A, B, C
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_TITLE}!A1:C${lastRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows }
    })

    console.log(`[완료] '${SHEET_TITLE}' 탭에 문항일람표가 저장되었습니다.`)
    console.log(`  → 구글 시트 하단 탭에서 '${SHEET_TITLE}'을 클릭해 확인하세요.`)
  } catch (err) {
    if (err.code === 403 || err.message?.includes('PERMISSION_DENIED')) {
      console.error('[권한 오류] 시트에 쓰기 권한이 없습니다.')
      console.log(`  → credentials.json의 client_email을 시트에 '편집자'로 공유하세요.`)
    } else {
      console.error('[오류]', err.message)
    }
    process.exit(1)
  }
}

syncQuestionList()
