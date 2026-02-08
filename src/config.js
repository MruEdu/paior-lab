/**
 * PAIOR 참여 코드 (박사님이 정한 코드)
 * PAIOR700 ~ PAIOR777 (78개) 허용
 * 대소문자 구분 없음 (paior700, PAIOR700 등 모두 허용)
 */
export function isValidParticipationCode(code) {
  const trimmed = code.trim().toUpperCase()
  if (!/^PAIOR\d{3}$/.test(trimmed)) return false
  const num = parseInt(trimmed.slice(5), 10)
  return num >= 700 && num <= 777
}
