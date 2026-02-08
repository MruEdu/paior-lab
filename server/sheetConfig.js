/**
 * PAIOR Lab 구글 시트 구조 정의 (단일 소스)
 * 저장 순서: 닉네임, 참여코드, A, I, O, R, P1-P9, 유형, 별점, 시간
 */

function colToLetter(n) {
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s || 'A'
}

/** PAIOR Lab 시트 헤더 (간소화) */
export const EXPECTED_HEADERS = [
  '닉네임',
  '참여코드',
  'A',
  'I',
  'O',
  'R',
  'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9',
  '유형',
  '별점',
  '시간'
]

export { colToLetter }
