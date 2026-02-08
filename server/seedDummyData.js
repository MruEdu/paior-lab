/**
 * 구글 시트 더미 데이터 입력 (시스템 검증용)
 * 실행: node server/seedDummyData.js
 *
 * 10명 샘플, 대상군별 2명+, q1~q52 무작위(요인별 편차), A/I/O/R/P1~P9/효율지수 코드 공식대로 계산
 */

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getOrderedQuestionIds } from '../src/data/questions.js'
import { generateReport } from '../src/lib/analysisEngine.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SPREADSHEET_ID = '1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY'
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1'
const Q_COUNT = 52
const AIOR_ITEMS = 10
const P_ITEMS = 10

const ORDERED_IDS = getOrderedQuestionIds().slice(0, Q_COUNT)
const P_FACTORS = ['고군분투', '반항', '완벽', '외고집', '잡념', '만족', '적당', '의존', '싫증']

// 1~5 균등 랜덤
function rand1to5() {
  return Math.floor(Math.random() * 5) + 1
}

// 요인별 편향: bias { A: 1, I: -1 } → A 높게, I 낮게
function generateAnswers(profile) {
  const ids = ORDERED_IDS
  const answers = {}

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    let base = rand1to5()

    if (/^A\d+$/.test(id) && profile?.A) base = Math.min(5, Math.max(1, base + profile.A))
    else if (/^I\d+$/.test(id) && profile?.I) base = Math.min(5, Math.max(1, base + profile.I))
    else if (/^O\d+$/.test(id) && profile?.O) base = Math.min(5, Math.max(1, base + profile.O))
    else if (/^R\d+$/.test(id) && profile?.R) base = Math.min(5, Math.max(1, base + profile.R))
    else if (id.startsWith('P_')) {
      const f = id.split('_')[1]
      if (profile?.[f] != null) base = Math.min(5, Math.max(1, base + profile[f]))
    }

    answers[id] = base
  }

  return answers
}

const DUMMY_PROFILES = [
  { target: '초등', detail: '4학년', email: 'dummy.elem1@test.paoir.kr', gender: '남성', region: '서울', profile: { A: 1, R: 1 } },
  { target: '초등', detail: '6학년', email: 'dummy.elem2@test.paoir.kr', gender: '여성', region: '경기', profile: { O: 1, I: -1 } },
  { target: '중고등', detail: '고2', email: 'dummy.mid1@test.paoir.kr', gender: '남성', region: '인천', profile: { A: 2, 고군분투: 1 } },
  { target: '중고등', detail: '중3', email: 'dummy.mid2@test.paoir.kr', gender: '여성', region: '강원', profile: { R: 1, 반항: -1 } },
  { target: '대학생(대학/대학원)', detail: '공학', email: 'dummy.uni1@test.paoir.kr', gender: '남성', region: '충청', profile: { I: 2, O: 1 } },
  { target: '대학생(대학/대학원)', detail: '인문', email: 'dummy.uni2@test.paoir.kr', gender: '여성', region: '전라', profile: { R: 1, 완벽: 1 } },
  { target: '성인/일반', detail: '직장인', email: 'dummy.adult1@test.paoir.kr', gender: '남성', region: '경상', profile: { A: 1, O: 1, 싫증: -1 } },
  { target: '성인/일반', detail: '프리랜서', email: 'dummy.adult2@test.paoir.kr', gender: '여성', region: '제주', profile: { I: 1, 의존: -1 } },
  { target: '초등', detail: '5학년', email: 'dummy.elem3@test.paoir.kr', gender: '남성', region: '서울', profile: { A: -1, 고군분투: 1 } },
  { target: '성인/일반', detail: '구직중', email: 'dummy.adult3@test.paoir.kr', gender: '여성', region: '경기', profile: { O: 2, 외고집: 1 } }
]

function buildRow(data) {
  const aoir = data.aoir || {}
  const p = data.p || {}

  const aoirAvg = (key) => {
    const sum = aoir[key] ?? 0
    return sum ? (sum / AIOR_ITEMS).toFixed(2) : ''
  }
  const aoirAvgs = {
    A: aoirAvg('A'),
    O: aoirAvg('O'),
    I: aoirAvg('I'),
    R: aoirAvg('R')
  }
  const pAvgs = Object.fromEntries(
    P_FACTORS.map((k) => [k, p[k] ? (p[k] / P_ITEMS).toFixed(2) : ''])
  )

  const qValues = ORDERED_IDS.map((id) => {
    const val = data.answers[id]
    if (val == null || val === '') return ''
    const num = Number(val)
    return Number.isFinite(num) ? num : String(val)
  })

  return [
    data.email || '',
    data.target || '',
    data.gender || '',
    data.region || '',
    data.detail || '',
    ...qValues,
    aoir.A ?? '',
    aoir.O ?? '',
    aoir.I ?? '',
    aoir.R ?? '',
    aoirAvgs.A,
    aoirAvgs.O,
    aoirAvgs.I,
    aoirAvgs.R,
    p.고군분투 ?? '',
    p.반항 ?? '',
    p.완벽 ?? '',
    p.외고집 ?? '',
    p.잡념 ?? '',
    p.만족 ?? '',
    p.적당 ?? '',
    p.의존 ?? '',
    p.싫증 ?? '',
    ...P_FACTORS.map((k) => pAvgs[k]),
    data.efficiencyIndex ?? '',
    Array.isArray(data.keyFactors) ? data.keyFactors.join(', ') : (data.keyFactors || ''),
    data.summary || '',
    data.responseTime ?? ''
  ]
}

async function seedDummyData() {
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

  const rows = []

  for (const d of DUMMY_PROFILES) {
    const answers = generateAnswers(d.profile)
    const result = generateReport(answers, d.target)
    const { aoir, p, summary, efficiency, keyFactors } = result

    const rowData = {
      ...d,
      answers,
      aoir,
      p,
      summary: summary || '',
      keyFactors: keyFactors || [],
      efficiencyIndex: efficiency?.efficiencyIndex ?? '',
      responseTime: ''
    }

    rows.push(buildRow(rowData))
  }

  function lastColLetter(n) {
    let s = ''
    while (n > 0) {
      const r = (n - 1) % 26
      s = String.fromCharCode(65 + r) + s
      n = Math.floor((n - 1) / 26)
    }
    return s || 'A'
  }
  const range = `${SHEET_NAME}!A:${lastColLetter(rows[0].length)}`

  console.log(`[입력] ${rows.length}명 더미 데이터 준비 완료`)
  console.log(`  대상: 초등 ${DUMMY_PROFILES.filter((d) => d.target === '초등').length}명, 중고등 2명, 대학생 2명, 성인 3명`)
  console.log(`  시트: ${SHEET_NAME}`)

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows }
    })
    console.log(`[완료] 구글 시트에 ${rows.length}행이 추가되었습니다.`)
    console.log(`  → A/I/O/R, P1~P9, 효율지수는 generateReport 및 parseScores 공식대로 계산됨`)
  } catch (err) {
    if (err.code === 403 || err.message?.includes('PERMISSION_DENIED')) {
      console.error('[권한 오류] 시트에 쓰기 권한이 없습니다.')
    } else {
      console.error('[오류]', err.message)
    }
    process.exit(1)
  }
}

seedDummyData()
