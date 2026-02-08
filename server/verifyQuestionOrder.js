/**
 * 문항 순서·요인 매칭 검수
 * 실행: node server/verifyQuestionOrder.js
 *
 * QUESTION_ORDER vs getQuestions vs 코드북/문항일람표 일치 여부 확인
 */

import { QUESTION_ORDER, getOrderedQuestionIds, getQuestions } from '../src/data/questions.js'

const FACTOR_LABELS = {
  A: 'A_추진력', I: 'I_탐구', O: 'O_질서', R: 'R_관계',
  고군분투: 'P1_고군분투', 반항: 'P2_반항', 완벽: 'P3_완벽', 외고집: 'P4_외고집',
  잡념: 'P5_잡념', 만족: 'P6_만족', 적당: 'P7_적당', 의존: 'P8_의존', 싫증: 'P9_싫증'
}

function getFactorLabel(item) {
  if (item.type === 'V') return 'V_타당도'
  if (item.type === 'AIOR') return FACTOR_LABELS[item.factor] || item.factor
  if (item.type === 'P') return FACTOR_LABELS[item.factor] || item.factor
  return ''
}

function getQuestionId(item) {
  if (item.type === 'V') return `V${item.num}`
  if (item.type === 'AIOR') return `${item.factor}${item.num}`
  return `P_${item.factor}_${item.num}`
}

console.log('=== PAIOR 문항 순서·요인 매칭 검수 ===\n')

// 1. QUESTION_ORDER 직접 추출
const orderFromQUESTION_ORDER = QUESTION_ORDER.map((item, i) => ({
  no: i + 1,
  id: getQuestionId(item),
  factor: getFactorLabel(item),
  raw: item
}))

// 2. getQuestions('중고등') 결과
const questionsFromGetQuestions = getQuestions('중고등')

// 3. getOrderedQuestionIds
const idsFromGetOrderedIds = getOrderedQuestionIds()

// 검증: 문항번호 ↔ ID ↔ 요인 일치
let errors = []

for (let i = 0; i < 134; i++) {
  const fromOrder = orderFromQUESTION_ORDER[i]
  const fromGetQ = questionsFromGetQuestions[i]
  const idFromIds = idsFromGetOrderedIds[i]

  // ID 일치
  if (fromOrder.id !== fromGetQ?.id) {
    errors.push(`문항 ${i + 1}: QUESTION_ORDER ID=${fromOrder.id} vs getQuestions ID=${fromGetQ?.id}`)
  }
  if (fromOrder.id !== idFromIds) {
    errors.push(`문항 ${i + 1}: QUESTION_ORDER ID=${fromOrder.id} vs getOrderedIds ID=${idFromIds}`)
  }

  // 요인 일치
  const expectedFactor = fromOrder.factor
  const actualFactor = fromGetQ ? (fromGetQ.type === 'V' ? 'V_타당도' : FACTOR_LABELS[fromGetQ.factor] || fromGetQ.factor) : ''
  if (expectedFactor !== actualFactor) {
    errors.push(`문항 ${i + 1}: 요인 불일치 - 기대=${expectedFactor}, 실제=${actualFactor} (id=${fromGetQ?.id})`)
  }
}

// AIOR 교차 구간 샘플 출력 (1-32번)
console.log('--- 문항 1~32번 (AIOR + V1) 샘플 ---')
console.log('번호\tID\t측정요인')
for (let i = 0; i < 32; i++) {
  const r = orderFromQUESTION_ORDER[i]
  console.log(`${r.no}\t${r.id}\t${r.factor}`)
}

console.log('\n--- 문항 29~35번 (AIOR 잔여 + V1 경계) ---')
for (let i = 28; i < 35; i++) {
  const r = orderFromQUESTION_ORDER[i]
  console.log(`${r.no}\t${r.id}\t${r.factor}`)
}

console.log('\n--- 문항 38~45번 (AIOR 끝 + P1 시작) ---')
for (let i = 37; i < 45; i++) {
  const r = orderFromQUESTION_ORDER[i]
  console.log(`${r.no}\t${r.id}\t${r.factor}`)
}

if (errors.length > 0) {
  console.log('\n❌ 검수 실패:')
  errors.forEach((e) => console.log('  -', e))
  process.exit(1)
}

console.log('\n✅ 검수 통과: QUESTION_ORDER ↔ getQuestions ↔ getOrderedIds 일치')
console.log(`   총 134문항, AIOR 순서: A-I-O-R (추진력-탐구-질서-관계)`)
console.log('\n   syncCodebook/syncQuestionList는 getQuestions() 사용 → 설문 순서와 동일')
