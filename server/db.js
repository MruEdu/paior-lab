/**
 * DB 모듈: Vercel 배포 환경을 위해 Mock 모드로 고정 (랜딩 페이지용)
 */
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Mock DB: 실제 DB 없이도 에러가 나지 않도록 가짜 함수들을 제공합니다. */
const createMockDb = () => ({
  prepare: () => ({ 
    run: () => ({ lastInsertRowid: 0 }), 
    get: () => null, 
    all: () => [] 
  }),
  exec: () => {}
})

let db = createMockDb()
let useMock = true

// Vercel 빌드 에러를 방지하기 위해 실제 DB 연결 코드는 주석 처리합니다.
/*
try {
  const Database = (await import('better-sqlite3')).default
  db = new Database(join(__dirname, 'paoir.db'))
  useMock = false
} catch (err) {
  console.warn('[DB] Mock 모드로 동작 중');
}
*/

export { db, useMock }