/**
 * 요인별문항리뷰 구글 시트 동기화
 * 실행: node server/syncFactorReview.js
 *
 * 문항을 요인별로 묶어 나열. 박사님이 C열(문항내용) 수정 시 pull 명령으로 코드 반영 가능
 */

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getQuestions } from '../src/data/questions.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SPREADSHEET_ID = '1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY'
const SHEET_TITLE = '요인별문항리뷰'

const FACTOR_LABELS = {
  A: 'A_추진력', O: 'O_질서', I: 'I_탐구', R: 'R_관계',
  고군분투: 'P1_고군분투', 반항: 'P2_반항', 완벽: 'P3_완벽', 외고집: 'P4_외고집',
  잡념: 'P5_잡념', 만족: 'P6_만족', 적당: 'P7_적당', 의존: 'P8_의존', 싫증: 'P9_싫증'
}

// 요인별 배경색 (요인 구분용)
const FACTOR_COLORS = {
  'A_추진력': { r: 0.87, g: 0.92, b: 1 },     // 연한 블루
  'O_질서': { r: 0.85, g: 0.95, b: 1 },
  'I_탐구': { r: 0.9, g: 0.95, b: 1 },
  'R_관계': { r: 0.88, g: 0.93, b: 1 },
  'P1_고군분투': { r: 1, g: 0.95, b: 0.9 },
  'P2_반항': { r: 1, g: 0.93, b: 0.88 },
  'P3_완벽': { r: 1, g: 0.96, b: 0.9 },
  'P4_외고집': { r: 1, g: 0.94, b: 0.88 },
  'P5_잡념': { r: 1, g: 0.95, b: 0.9 },
  'P6_만족': { r: 1, g: 0.96, b: 0.88 },
  'P7_적당': { r: 1, g: 0.95, b: 0.9 },
  'P8_의존': { r: 1, g: 0.93, b: 0.88 },
  'P9_싫증': { r: 1, g: 0.94, b: 0.88 },
  'V_타당도': { r: 0.95, g: 0.98, b: 0.95 }
}

function toRgbHex(c) {
  const r = Math.round((c.r || 0) * 255)
  const g = Math.round((c.g || 0) * 255)
  const b = Math.round((c.b || 0) * 255)
  return { red: r / 255, green: g / 255, blue: b / 255 }
}

function getFactorLabel(q) {
  if (q.type === 'V') return 'V_타당도'
  if (q.type === 'AIOR') return FACTOR_LABELS[q.factor] || q.factor
  return FACTOR_LABELS[q.factor] || q.factor
}

async function syncFactorReview() {
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

  const questions = getQuestions('중고등')
  const factorOrder = ['A_추진력', 'O_질서', 'I_탐구', 'R_관계', 'P1_고군분투', 'P2_반항', 'P3_완벽', 'P4_외고집', 'P5_잡념', 'P6_만족', 'P7_적당', 'P8_의존', 'P9_싫증', 'V_타당도']

  const byFactor = {}
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const fl = getFactorLabel(q)
    if (!byFactor[fl]) byFactor[fl] = []
    byFactor[fl].push({ surveyNo: i + 1, id: q.id, text: q.text || '' })
  }

  const rows = [['요인', '번호', '문항내용', '수정제안']]
  const rowFactorMap = []
  for (const factor of factorOrder) {
    const items = byFactor[factor] || []
    for (const it of items) {
      rows.push([factor, it.surveyNo, it.text, ''])
      rowFactorMap.push(factor)
    }
  }

  try {
    let res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
    let existingSheet = res.data.sheets?.find((s) => s.properties?.title === SHEET_TITLE)

    if (!existingSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: SHEET_TITLE } } }]
        }
      })
      res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
      existingSheet = res.data.sheets?.find((s) => s.properties?.title === SHEET_TITLE)
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_TITLE}!A1:D${rows.length}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows }
    })

    const targetSheetId = existingSheet?.properties?.sheetId

    if (targetSheetId != null) {
      const requests = []
      let prevFactor = null
      let startRow = 1

      for (let r = 1; r < rowFactorMap.length + 1; r++) {
        const factor = rowFactorMap[r - 1]
        if (factor && prevFactor !== factor) {
          if (prevFactor != null) {
            const color = FACTOR_COLORS[prevFactor] || { r: 1, g: 1, b: 1 }
            const rgb = toRgbHex(color)
            requests.push({
              repeatCell: {
                range: {
                  sheetId: targetSheetId,
                  startRowIndex: startRow,
                  endRowIndex: r,
                  startColumnIndex: 0,
                  endColumnIndex: 4
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: rgb
                  }
                },
                fields: 'userEnteredFormat.backgroundColor'
              }
            })
          }
          startRow = r
          prevFactor = factor
        }
      }
      if (prevFactor != null) {
        const color = FACTOR_COLORS[prevFactor] || { r: 1, g: 1, b: 1 }
        const rgb = toRgbHex(color)
        requests.push({
          repeatCell: {
            range: {
              sheetId: targetSheetId,
              startRowIndex: startRow,
              endRowIndex: rowFactorMap.length + 1,
              startColumnIndex: 0,
              endColumnIndex: 4
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: rgb
              }
            },
            fields: 'userEnteredFormat.backgroundColor'
          }
        })
      }

      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: { requests }
        })
      }
    }

    console.log(`[완료] '${SHEET_TITLE}' 탭 동기화 완료 (134문항, 요인별 색상 적용)`)
    console.log(`  → C열(문항내용) 수정 후: npm run sheets:pull-questions 로 코드 반영`)
  } catch (err) {
    if (err.code === 403 || err.message?.includes('PERMISSION_DENIED')) {
      console.error('[권한 오류] 시트에 쓰기 권한이 없습니다.')
    } else {
      console.error('[오류]', err.message)
    }
    process.exit(1)
  }
}

syncFactorReview()
