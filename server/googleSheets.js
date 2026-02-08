/**
 * Google Sheets API 연동
 * Zero-Config: 서버 시작/데이터 저장 시 헤더 자동 검증 및 갱신
 */

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { EXPECTED_HEADERS, colToLetter } from './sheetConfig.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function lastColumnLetter(n) {
  return colToLetter(n)
}

const SPREADSHEET_ID = '1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY'

/**
 * 시트 헤더가 AOIR+P9 구조와 일치하는지 검사 후, 불일치 시 자동 갱신
 * @returns {Promise<boolean>} 갱신 여부 (클라이언트 없으면 false)
 */
export async function ensureSheetHeaders() {
  const client = createSheetsClient()
  if (!client) return false

  const { sheets, spreadsheetId } = client
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1'

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:${colToLetter(EXPECTED_HEADERS.length)}1`
    })
    const current = res.data.values?.[0] || []

    const needsUpdate =
      current.length === 0 ||
      current[0] !== '닉네임' ||
      current.length !== EXPECTED_HEADERS.length ||
      current[2] !== 'A' ||
      current[EXPECTED_HEADERS.length - 1] !== '시간'

    if (needsUpdate) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:${colToLetter(EXPECTED_HEADERS.length)}1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [EXPECTED_HEADERS] }
      })
      console.log('[Sheets] 헤더 자동 갱신 완료 (PAIOR Lab 구조)')
      return true
    }
    return false
  } catch (err) {
    console.warn('[Sheets] 헤더 검사 실패:', err.message)
    return false
  }
}

export function createSheetsClient() {
  const spreadsheetId = SPREADSHEET_ID
  let credentials = null

  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
    } catch (e) {
      console.warn('[Google Sheets] GOOGLE_CREDENTIALS_JSON 파싱 실패')
      return null
    }
  } else {
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || join(__dirname, 'credentials.json')
    if (!existsSync(credentialsPath)) {
      console.warn('[Google Sheets] credentials.json 없음 - 시트 전송 건너뜀')
      return null
    }
    credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'))
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    const sheets = google.sheets({ version: 'v4', auth })
    return { sheets, spreadsheetId }
  } catch (err) {
    console.error('[Google Sheets] 초기화 실패:', err.message)
    return null
  }
}

const P_FACTORS = ['고군분투', '반항', '완벽', '외고집', '잡념', '만족', '적당', '의존', '싫증']

/**
 * PAIOR Lab 시트에 추가 (닉네임, 참여코드, A, I, O, R, P1-P9, 유형, 별점, 시간)
 */
export async function appendToSheet(data) {
  const client = createSheetsClient()
  if (!client) return { success: false, skipped: true }

  await ensureSheetHeaders()

  const { sheets, spreadsheetId } = client
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1'

  const aoir = data.aoir || {}
  const p = data.p || {}

  const row = [
    data.nickname || '',
    data.participationCode || '',
    aoir.A ?? '',
    aoir.I ?? '',
    aoir.O ?? '',
    aoir.R ?? '',
    p.고군분투 ?? '',
    p.반항 ?? '',
    p.완벽 ?? '',
    p.외고집 ?? '',
    p.잡념 ?? '',
    p.만족 ?? '',
    p.적당 ?? '',
    p.의존 ?? '',
    p.싫증 ?? '',
    data.type || '',
    '',
    data.responseTime ?? ''
  ]

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:${lastColumnLetter(row.length)}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    })
    return { success: true }
  } catch (err) {
    console.error('[Google Sheets] 전송 실패:', err.message)
    return { success: false, error: err.message }
  }
}

/** 만족도 열 인덱스 (0-based) - 17번째 열 */
const SATISFACTION_COL_INDEX = 16

/**
 * 닉네임+참여코드로 해당 행을 찾아 만족도 업데이트
 */
export async function updateSatisfactionInSheet(nickname, participationCode, score) {
  const client = createSheetsClient()
  if (!client) return { success: false, skipped: true }

  const { sheets, spreadsheetId } = client
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1'
  const col = colToLetter(SATISFACTION_COL_INDEX + 1)

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:B`
    })
    const rows = res.data.values || []
    let targetRow = -1
    for (let i = rows.length - 1; i >= 1; i--) {
      const row = rows[i] || []
      const rNick = String(row[0] || '').trim()
      const rCode = String(row[1] || '').trim()
      if (rNick === nickname && rCode === participationCode) {
        targetRow = i + 1
        break
      }
    }
    if (targetRow < 0) {
      console.warn('[Sheets] 만족도 업데이트: 해당 닉네임+참여코드 행 없음')
      return { success: false, error: '해당 행을 찾을 수 없습니다.' }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${col}${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[score]] }
    })
    return { success: true }
  } catch (err) {
    console.error('[Google Sheets] 만족도 업데이트 실패:', err.message)
    return { success: false, error: err.message }
  }
}
