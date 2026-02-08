/**
 * 시트의 문항 수정 사항을 questions.js에 반영
 * 실행: node server/pullQuestionsFromSheet.js
 *
 * '요인별문항리뷰' 탭에서 D열(수정제안)이 있으면 적용, 없으면 C열(문항내용)을 코드에 반영
 */

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getQuestions } from '../src/data/questions.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPREADSHEET_ID = '1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY'
const SHEET_TITLE = '요인별문항리뷰'

function escapeForJsString(str) {
  if (str == null) return ''
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
}

function getFactorLabel(q) {
  const FACTOR_LABELS = {
    A: 'A_추진력', O: 'O_질서', I: 'I_탐구', R: 'R_관계',
    고군분투: 'P1_고군분투', 반항: 'P2_반항', 완벽: 'P3_완벽', 외고집: 'P4_외고집',
    잡념: 'P5_잡념', 만족: 'P6_만족', 적당: 'P7_적당', 의존: 'P8_의존', 싫증: 'P9_싫증'
  }
  if (q.type === 'V') return 'V_타당도'
  return FACTOR_LABELS[q.factor] || q.factor
}

async function pullQuestionsFromSheet() {
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

  const sheetRows = []
  for (const factor of factorOrder) {
    const items = byFactor[factor] || []
    for (const it of items) sheetRows.push(it)
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_TITLE}!A2:D${sheetRows.length + 1}`
  })
  const rows = res.data.values || []

  if (rows.length !== sheetRows.length) {
    console.warn(`[경고] 시트 행 수(${rows.length})와 예상(${sheetRows.length})이 다릅니다. syncFactorReview를 먼저 실행하세요.`)
  }

  const updates = []
  for (let i = 0; i < Math.min(rows.length, sheetRows.length); i++) {
    const row = rows[i]
    const ref = sheetRows[i]
    const revision = (row[3] || '').trim()
    const content = (row[2] || '').trim()
    const newText = revision || content
    if (!newText || newText === ref.text) continue
    updates.push({ id: ref.id, surveyNo: ref.surveyNo, oldText: ref.text, newText })
  }

  if (updates.length === 0) {
    console.log('[완료] 반영할 수정 사항이 없습니다.')
    return
  }

  const filePath = join(__dirname, '..', 'src', 'data', 'questions.js')
  let content = readFileSync(filePath, 'utf8')

  let applied = 0
  for (const u of updates) {
    const oldEscaped = escapeForJsString(u.oldText)
    const newEscaped = escapeForJsString(u.newText)
    const searchStr = `  '${oldEscaped}',`
    const replaceStr = `  '${newEscaped}',`

    if (!content.includes(searchStr)) {
      console.warn(`  [건너뜀] ${u.id} (문항 ${u.surveyNo}): 원문을 찾을 수 없음`)
      continue
    }

    content = content.replace(searchStr, replaceStr)
    console.log(`  [반영] ${u.id} (문항 ${u.surveyNo})`)
    applied++
  }

  writeFileSync(filePath, content)
  console.log(`[완료] ${applied}개 문항이 questions.js에 반영되었습니다.`)
}

pullQuestionsFromSheet().catch((err) => {
  console.error('[오류]', err.message)
  process.exit(1)
})
