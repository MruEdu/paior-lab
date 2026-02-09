/**
 * DB 모듈: Vercel 환경에서 에러를 일으키는 요소를 원천 차단합니다.
 */
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** 가짜 DB 객체: 배포 시 에러 방지용 */
const createMockDb = () => ({
  prepare: () => ({ 
    run: () => ({ lastInsertRowid: 0 }), 
    get: () => null, 
    all: () => [] 
  }),
  exec: () => {}
})

// Vercel 서버가 싫어하는 'better-sqlite3' 호출을 아예 제거했습니다.
let db = createMockDb()
let useMock = true

export { db, useMock }