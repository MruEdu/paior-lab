/**
 * PAIOR 코드북 구글 시트 동기화
 * 실행: node server/syncCodebook.js
 *
 * 대상군별 전체 문항, 측정요인, 역채점, 비고, 인구학적 변수 요약을 'PAIOR_코드북' 탭에 저장
 */

import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getQuestions } from '../src/data/questions.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SPREADSHEET_ID = '1mTPejSsuMKuNMfdzAc2N-4p8HFRMwSIY9RQkOGCxUoY'
const SHEET_TITLE = 'PAIOR_코드북'

// 측정요인 라벨 (구글 시트 A_action 등과 동일)
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

const TARGETS = ['초등', '중고등', '대학생(대학/대학원)', '성인/일반']

function getFactorLabel(q) {
  if (q.type === 'V') return 'V_타당도'
  if (q.type === 'AIOR') return FACTOR_LABELS[q.factor] || q.factor
  if (q.type === 'P') return FACTOR_LABELS[q.factor] || q.factor
  return ''
}

// analysisEngine.parseScores 분석 결과: 역채점 미적용. 모든 문항 원점수 그대로 합산
function getReverseScoring(q) {
  return '해당 없음'
}

function getNote(q) {
  if (q.type === 'V') {
    const exp = q.expected === 1 ? '1점' : '5점'
    return `타당도 검증용 (정답: ${exp})`
  }
  return ''
}

async function syncCodebook() {
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

  // [1] 인구학적 변수 상단 요약
  const demoSection = [
    ['=== 인구학적 변수 (구글 시트 저장 형식) ==='],
    [],
    ['변수명', '저장 형식', '코드/값 예시', '비고'],
    ['email', '텍스트', 'example@email.com', '이메일 형식, 고유 식별값'],
    ['target', '텍스트', '초등 | 중고등 | 대학생(대학/대학원) | 성인/일반', '대상 구분 (TARGET_OPTIONS.value)'],
    ['gender', '텍스트', '남성 | 여성 | (빈값)', '성별'],
    ['region', '텍스트', '서울 | 경기 | 인천 | 강원 | 충청 | 전라 | 경상 | 제주 | (빈값)', '거주 지역'],
    ['detail', '텍스트', '학년/전공/직업 세부값', '대상별 상이 (초등:1~6학년, 중고등:중1~고3, 대학생:인문/사회/자연 등, 성인:직장인/자영업 등)'],
    ['concern', '텍스트', '학업성적 | 진로취업 | 대인관계 | 경제적문제 | 심리적불안 | 기타 | (빈값)', '현재 가장 큰 고민 1순위'],
    [],
    ['=== 문항 코드북 (대상군별 1~134번 전체) ==='],
    []
  ]

  // [2] 문항 목록: 대상군 | 문항번호 | 측정요인 | 실제 문항 내용 | 역채점 여부 | 비고
  const headerRow = ['대상군', '문항번호', '측정요인(A,O,I,R/P1~P9)', '실제 문항 내용', '역채점 여부', '비고(신뢰도 검증용 등)']

  const questionRows = []
  for (const target of TARGETS) {
    const questions = getQuestions(target)
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      questionRows.push([
        target,
        i + 1,
        getFactorLabel(q),
        q.text || '',
        getReverseScoring(q),
        getNote(q)
      ])
    }
  }

  const rows = [
    ...demoSection,
    headerRow,
    ...questionRows
  ]

  console.log(`[추출] 인구학적 변수 6개 + 문항 ${TARGETS.length}×134 = ${questionRows.length}행`)
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
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_TITLE}!A1:F${lastRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows }
    })

    console.log(`[완료] '${SHEET_TITLE}' 탭에 PAIOR 코드북이 저장되었습니다.`)
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

syncCodebook()
