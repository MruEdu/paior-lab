/**
 * PAIOR (파이오르) 분석 엔진
 * 구성: 기질 엔진 AOIR (A:추진력, O:질서, I:탐구, R:관계) + 심리 역동 P1~P9
 *
 * ─────────────────────────────────────────────────────────────
 * 점수 등급 (50점 만점 기준)
 * ─────────────────────────────────────────────────────────────
 * 높음(High): 40점 이상 → 핵심 강점/활성 상태
 * 보통(Middle): 25~39점 → 안정적/유연한 상태
 * 낮음(Low): 24점 이하 → 잠재 영역/미활성 상태
 *
 * 동점 처리 우선순위 (Tie-breaking): I > A > R > O
 * ─────────────────────────────────────────────────────────────
 */

// AOIR 엔진별 상관 P 마찰 요인 (내부 효율 계산용)
const AOIR_P_FRICTION = {
  A: ['완벽', '싫증'],
  O: ['외고집', '잡념'],
  I: ['싫증', '외고집'],
  R: ['의존', '적당']
}

// P 요인별 한글 라벨 (P1~P9 순서)
export const P_ORDER = ['고군분투', '반항', '완벽', '외고집', '잡념', '만족', '적당', '의존', '싫증']
export const P_LABELS = {
  고군분투: '고군분투',
  반항: '반항',
  완벽: '완벽',
  외고집: '외고집',
  잡념: '잡념',
  만족: '만족',
  적당: '적당',
  의존: '의존',
  싫증: '싫증'
}

// AOIR 라벨 (A-O-I-R 순서: 추진력-질서-탐구-관계)
export const AIOR_LABELS = { A: '추진력', O: '질서', I: '탐구', R: '관계' }
export const AOIR_LABELS = { A: '추진력', O: '질서', I: '탐구', R: '관계' }

// 점수 등급 (50점 만점)
export const SCORE_GRADES = { HIGH: '높음', MIDDLE: '보통', LOW: '낮음' }

/** 점수 → 등급 (높음≥40, 보통 25~39, 낮음≤24) */
export function getScoreGrade(score) {
  if (score >= 40) return SCORE_GRADES.HIGH
  if (score >= 25) return SCORE_GRADES.MIDDLE
  return SCORE_GRADES.LOW
}

/** 등급 표시용 (저점수 시 '잠재'로 부드럽게) */
export function getScoreGradeDisplay(score) {
  const grade = getScoreGrade(score)
  return grade === SCORE_GRADES.LOW ? '잠재' : grade
}

// 단독형 유형명
const AOIR_TYPE_NAMES = {
  A: '거침없는 개척자',
  O: '정교한 설계자',
  I: '패턴의 추적자',
  R: '따스한 연결자'
}

// 복합형 유형명 (정렬된 키: AI, AO, AR, IO, IR, OR, AOI, AOR, AIR, OIR)
const COMPOSITE_TYPE_NAMES = {
  AI: '지적인 개척자',
  AO: '치밀한 전략가',
  AR: '열정적 조력자',
  IO: '냉철한 분석가',
  IR: '통찰적 중재자',
  OR: '따뜻한 설계자',
  AOI: '완전무결한 개척자',
  AOR: '신뢰받는 리더',
  AIR: '역동적 통찰가',
  OIR: '사려 깊은 조정자'
}

// 단독형 AOIR 에너지 설명
const AOIR_SINGLE_DESC = {
  A: '귀하의 파이오르에서 읽히는 가장 선명한 결은 **추진력(A)**의 에너지입니다. 이는 생각에 머물기보다 몸을 먼저 움직여 현실적인 결과를 만들어내는 강력한 추진력을 의미합니다. 망설임보다는 \'일단 해보는\' 태도가 귀하의 삶을 이끌어가는 핵심 동력입니다.',
  O: '귀하의 파이오르에서 읽히는 가장 선명한 결은 **질서(O)**의 에너지입니다. 이는 외부에서 밀려드는 불확실하고 무질서한 자극들을 자신만의 체계로 정리하여, 예측 가능한 상태로 구조화하려는 정교한 안전 기제입니다. 단순히 깔끔함을 추구하는 것이 아니라, 삶의 불확실성을 통제하여 심리적 안정을 확보하려는 깊은 본능을 의미합니다.',
  I: '귀하의 파이오르에서 가장 깊게 흐르는 결은 **탐구(I)**의 에너지입니다. 이는 현상의 표면에 머물지 않고, 그 이면에 숨겨진 인과관계와 원리를 파헤쳐 본질을 규명하려는 지적인 본능입니다.',
  R: '귀하의 파이오르에서 가장 아름답게 빛나는 결은 **관계(R)**의 에너지입니다. 이는 타인과 정서적 주파수를 맞추고, 주변의 분위기를 조화롭게 유지하며 사람 사이의 연결망을 통해 삶의 의미를 찾는 정서적 본능입니다.'
}

// 복합형 AOIR 설명
const AOIR_COMPOSITE_DESC = {
  AI: '귀하의 파이오르에서 읽히는 첫 번째 결은 **추진력(A)**과 **탐구(I)**의 강력한 결합입니다. 이는 세상의 이치를 깊이 궁리하여 본질을 파악한 뒤(I), 이를 현실의 결과물로 거침없이 치환해내는(A) 역동적인 설계도를 의미합니다.',
  AO: '귀하의 파이오르에서 읽히는 결은 **추진력(A)**의 추진력과 **질서(O)**의 체계성이 결합된 형태입니다. 이는 목표를 향해 빠르게 움직이되(A), 모든 과정을 자신만의 정교한 규칙과 시스템 안에 두어(O) 한 치의 오차도 허용하지 않는 설계도를 의미합니다.',
  AR: '귀하의 파이오르에서 읽히는 결은 **추진력(A)**의 에너지와 **관계(R)**의 따뜻함이 만난 상태입니다. 이는 사람들과 함께 목표를 향해 나아갈 때(R) 가장 강력한 행동력(A)이 발휘되는 설계도로, 타인의 성장을 돕거나 공동체의 성취를 위해 앞장서서 움직이는 에너지를 의미합니다.',
  IO: '귀하의 파이오르에서 읽히는 결은 **탐구(I)**의 지적 깊이와 **질서(O)**의 체계성이 결합된 형태입니다. 이는 현상의 원리를 깊이 파고들어 본질을 규명하고(I), 그 발견된 진실을 자신만의 논리적인 틀 안에 완벽하게 정리하려는(O) 설계도를 의미합니다.',
  IR: '귀하의 파이오르에서 읽히는 결은 **탐구(I)**의 통찰력과 **관계(R)**의 공감 능력이 만난 상태입니다. 이는 사람 사이의 보이지 않는 심리적 기제나 역동을 예리하게 파악하고(I), 이를 바탕으로 관계의 조화를 이루어내거나 본질적인 도움을 주려는(R) 설계도를 의미합니다.',
  OR: '귀하의 파이오르에서 읽히는 결은 **질서(O)**와 **관계(R)**의 아름다운 조화입니다. 이는 주변 사람들과의 정서적 연결을 소중히 여기면서도(R), 그 관계와 환경이 안정적이고 체계적으로 유지되도록(O) 세심하게 보살피는 설계도를 의미합니다.',
  AOI: '귀하의 파이오르에서 읽히는 결은 **추진력(A)**의 추진력, **질서(O)**의 체계성, 그리고 **탐구(I)**의 지적 깊이가 완벽한 삼각형을 이루는 형태입니다. 이는 본질을 꿰뚫어 보는 안목(I)으로 전략을 세우고, 이를 흐트러짐 없는 시스템(O) 안에서 즉각적인 행동(A)으로 옮기는 매우 강력한 설계도를 의미합니다.',
  AOR: '귀하의 파이오르에서 읽히는 결은 **추진력(A)**의 에너지와 **질서(O)**의 안정감, 그리고 **관계(R)**의 포용력이 결합된 형태입니다. 이는 주변 사람들과 정서적 유대를 맺으면서도(R), 공정하고 체계적인 질서(O)를 유지하며, 공동의 목표를 향해 앞장서서 나아가는(A) 든든한 설계도를 의미합니다.',
  AIR: '귀하의 파이오르에서 읽히는 결은 **추진력(A)**의 추진력, **탐구(I)**의 본질 파악, 그리고 **관계(R)**의 정서적 교감이 유기적으로 연결된 형태입니다. 이는 사람과 세상의 원리를 깊이 이해하고(I), 그 안에서 사람들과 소통하며(R), 목표한 바를 실제적인 행동으로 구현해내는(A) 다재다능한 설계도를 의미합니다.',
  OIR: '귀하의 파이오르에서 읽히는 결은 **질서(O)**의 안정감, **탐구(I)**의 예리함, **관계(R)**의 조화가 결합된 형태입니다. 이는 관계 속의 미묘한 흐름을 파악하고(R), 그 인과관계를 분석하여(I), 모두가 안심할 수 있는 체계적인 환경을 구축하려는(O) 사려 깊은 설계도를 의미합니다.'
}

// 나이팅게일 로즈 차트 설명 (단독형)
const CHART_SINGLE_DESC = {
  A: '나이팅게일 로즈 차트에서 귀하의 추진력(A) 영역은 압도적인 크기로 뻗어 있습니다. 이는 복잡한 계산이나 타인의 시선보다 자신의 의지에 따른 직접적인 실천이 귀하를 정의하는 가장 고유한 프로필임을 시각적으로 증명합니다.',
  O: '나이팅게일 로즈 차트에서 귀하의 질서(O) 영역은 매우 단단하고 견고하게 뻗어 있습니다. 이는 상황이 자신의 통제 안에 있고 모든 것이 제자리에 놓여 있을 때 비로소 평온함을 느끼는 \'정교한 설계자\'로서의 면모를 시각적으로 증명합니다.',
  I: '나이팅게일 로즈 차트에서 귀하의 탐구(I) 영역은 중심부에서 바깥으로 날카롭고 깊게 뻗어 있습니다. 이는 복잡한 정보들 사이에서 핵심적인 패턴을 찾아내고, 자신만의 논리적 체계를 완성할 때 지적 희열을 느끼는 \'패턴의 추적자\'로서의 면모를 시각적으로 증명합니다.',
  R: '나이팅게일 로즈 차트에서 귀하의 관계(R) 영역은 부드럽고 넓게 뻗어 있습니다. 이는 혼자만의 성취보다 \'함께\'의 가치를 소중히 여기며, 타인의 마음을 읽어내는 공감의 결을 가진 \'따스한 연결자\'로서의 면모를 시각적으로 증명합니다.'
}

// 나이팅게일 로즈 차트 설명 (복합형)
const CHART_COMPOSITE_DESC = {
  AI: '나이팅게일 로즈 차트에서 귀하의 A와 I 영역은 날카롭고 견고하게 뻗어 있습니다. 이는 단순한 행동이나 막연한 생각을 넘어, 확신이 선 지점을 향해 전략적으로 전진하는 \'지적인 개척자\'로서의 면모를 시각적으로 증명합니다.',
  AO: '나이팅게일 로즈 차트에서 귀하의 A와 O 영역은 매우 대칭적이고 강하게 뻗어 있습니다. 이는 단순한 돌파가 아니라, 철저한 계획하에 승률을 높여가는 \'치밀한 전략가\'로서의 면모를 시각적으로 증명합니다.',
  AR: '나이팅게일 로즈 차트에서 귀하의 A와 R 영역은 역동적으로 어우러져 있습니다. 이는 혼자만의 성공보다 \'우리\'의 승리를 위해 먼저 발 벗고 나서는 \'열정적 조력자\'로서의 면모를 시각적으로 증명합니다.',
  IO: '나이팅게일 로즈 차트에서 귀하의 I와 O 영역은 매우 질서 정연하고 깊게 형성되어 있습니다. 이는 단순히 아는 것에 그치지 않고, 지식을 구조화하여 명확한 체계를 세울 때 안정을 느끼는 \'냉철한 분석가\'로서의 면모를 시각적으로 증명합니다.',
  IR: '나이팅게일 로즈 차트에서 귀하의 I와 R 영역은 섬세하고 유연하게 뻗어 있습니다. 이는 사람에 대한 깊은 이해를 바탕으로 진심 어린 연결을 추구하는 \'통찰적 중재자\'로서의 면모를 시각적으로 증명합니다.',
  OR: '나이팅게일 로즈 차트에서 귀하의 O와 R 영역은 부드러우면서도 넓게 형성되어 있습니다. 이는 주변의 무질서를 정돈하여 모두가 편안함을 느낄 수 있는 안전한 울타리를 만드는 \'따뜻한 설계자\'로서의 면모를 시각적으로 증명합니다.',
  AOI: '나이팅게일 로즈 차트에서 귀하의 A, O, I 영역은 넓고 고르게 분포되어 있습니다. 이는 단순히 열심히 하는 것을 넘어, \'왜(I)\' 해야 하는지 알고, \'어떻게(O)\' 할지 설계한 뒤, \'확실하게(A)\' 끝맺음하는 \'완전무결한 개척자\'로서의 면모를 시각적으로 증명합니다.',
  AOR: '나이팅게일 로즈 차트에서 귀하의 A, O, R 영역은 조화롭고 역동적인 균형을 보여줍니다. 이는 주변 사람들에게 예측 가능한 안정감을 주면서 동시에 확실한 결과를 만들어내는 \'신뢰받는 리더\'로서의 면모를 시각적으로 증명합니다.',
  AIR: '나이팅게일 로즈 차트에서 귀하의 A, I, R 영역은 생동감 있게 뻗어 있습니다. 이는 단순한 이론가나 활동가를 넘어, 사람의 마음을 움직여 본질적인 변화를 실행에 옮기는 \'역동적 통찰가\'로서의 면모를 시각적으로 증명합니다.',
  OIR: '나이팅게일 로즈 차트에서 귀하의 O, I, R 영역은 섬세하고 균형 잡힌 분포를 보여줍니다. 이는 공동체 내에서 발생할 수 있는 혼란을 지적인 통찰로 미리 예방하고, 따뜻한 질서를 만들어가는 \'사려 깊은 조정자\'로서의 면모를 시각적으로 증명합니다.'
}

// P-역동 → P1~P9 데이터 매핑 (해석 알고리즘 3)
const P_SCORE_MAP = {
  고군분투: 'P1',
  반항: 'P2',
  완벽: 'P3',
  외고집: 'P4',
  잡념: 'P5',
  만족: 'P6',
  적당: 'P7',
  의존: 'P8',
  싫증: 'P9'
}

// P-역동 '숭고한 정성' 해석 (해석 알고리즘 2 - 긍정적 재해석)
const P_NOBLE_DESC = {
  고군분투: '목표 완수를 위해 홀로 무게를 견디는 귀하의 진실한 태도입니다. 파이오르는 이를 단순한 피로나 과로가 아닌, 자신이 목표한 바를 완수하기 위해 홀로 모든 무게를 견뎌내며 나아가는 귀하만의 숭고한 정성으로 읽어냅니다. 그 치열하고 정직한 움직임 속에 담긴 정성을 깊이 지지합니다.',
  반항: '외부의 압박 속에서도 자신만의 주도권을 지키려는 숭고한 정성입니다. 파이오르는 이를 단순한 저항이 아닌, 타인의 기대에 휘둘리지 않고 자신의 길을 스스로 설계하려는 귀하만의 진실한 태도로 읽어냅니다. 주인의식을 지키기 위해 애써온 귀하의 정성을 깊이 지지합니다.',
  완벽: '그 질서를 한 치의 오차 없이 유지하고 완성하려는 숭고한 정성입니다. 파이오르는 이를 스스로를 옥죄는 강박이 아닌, 자신의 세계를 티 없이 맑고 가지런하게 가꾸어 안전한 울타리를 만들려는 귀하만의 진실한 태도로 읽어냅니다. 흐트러짐 없는 삶의 체계를 세우기 위해 홀로 분투하며 정성을 다해온 귀하의 마음을 깊이 지지합니다.',
  외고집: '자신이 발견한 본질과 진실을 끝까지 지켜내려는 숭고한 정성입니다. 파이오르는 이를 단순한 고집이나 불통이 아닌, 타협할 수 없는 가치를 수호하며 자신만의 길을 묵묵히 걸어가는 귀하만의 진실한 태도로 읽어냅니다. 남들이 보지 못하는 깊은 곳의 진실을 붙들고 인내해온 귀하의 정성을 깊이 지지합니다.',
  잡념: '환경과 관계 속의 불안을 다스리려는 숭고한 정성입니다. 파이오르는 이를 단순한 산만함이 아닌, 주변의 어수선함을 정리하고 마음의 평화를 되찾으려는 귀하만의 진실한 태도로 읽어냅니다. 상황을 파악하고 안정을 찾으려 노력해온 귀하의 정성을 깊이 지지합니다.',
  만족: '지금의 순간을 충분히 인정하고 에너지를 아끼려는 숭고한 정성입니다. 파이오르는 이를 나태가 아닌, 현재의 성취를 소중히 여기며 다음 도전을 위한 여유를 확보하려는 귀하만의 진실한 태도로 읽어냅니다. 무리하지 않고 자신의 속도에 맞춰 나아가려는 귀하의 지혜를 깊이 지지합니다.',
  적당: '주변과의 조화를 지키며 부담을 덜어내려는 숭고한 정성입니다. 파이오르는 이를 평범함의 연기가 아닌, 관계 속에서 눈에 띄지 않게 따뜻한 균형을 이루려는 귀하만의 진실한 태도로 읽어냅니다. 함께 어울리며 편안함을 만들어가는 귀하의 정성을 깊이 지지합니다.',
  의존: '협력과 지원의 가치를 소중히 여기는 숭고한 정성입니다. 파이오르는 이를 단순한 의존이 아닌, 함께하는 이들을 신뢰하며 그 힘을 빌려 나아가려는 귀하만의 진실한 태도로 읽어냅니다. 혼자서 모든 것을 감당하지 않으려는 귀하의 지혜를 깊이 지지합니다.',
  싫증: '새로운 통찰을 채우기 위해 잠시 멈춰 서는 귀하의 진실한 신호입니다. 파이오르는 이를 단순한 변덕이나 권태가 아닌, 그동안 타인에게 주파수를 맞추느라 소진된 자신의 마음을 보호하고 새로운 에너지를 채우려는 숭고한 정성으로 읽어냅니다. 늘 남을 먼저 배려하며 자신의 결을 내어주었던 귀하의 헌신적인 정성을 깊이 지지합니다.'
}

const FRICTION_COEFFICIENT = 0.4

/**
 * 데이터 매핑: 점수값을 서사적 문구에 주입 (해석 알고리즘 3)
 * @param {string} text - $A$, $O$, $I$, $R$, $P1$~$P9$ 플레이스홀더 포함 텍스트
 * @param {Object} aoir - { A, O, I, R }
 * @param {Object} p - { 고군분투, 반항, ... }
 */
function personalizeWithScores(text, aoir, p) {
  if (!text) return ''
  let out = text
  out = out.replace(/\$A\$/g, aoir?.A ?? 0)
  out = out.replace(/\$O\$/g, aoir?.O ?? 0)
  out = out.replace(/\$I\$/g, aoir?.I ?? 0)
  out = out.replace(/\$R\$/g, aoir?.R ?? 0)
  const pKeys = ['고군분투', '반항', '완벽', '외고집', '잡념', '만족', '적당', '의존', '싫증']
  pKeys.forEach((k, i) => {
    out = out.replace(new RegExp(`\\$${P_SCORE_MAP[k]}\\$`, 'g'), p?.[k] ?? 0)
  })
  return out
}

/**
 * raw 점수에서 응답 파싱
 */
export function parseScores(answers) {
  const aoir = { A: 0, O: 0, I: 0, R: 0 } // AOIR 순서: A(실행)-O(질서)-I(탐구)-R(관계)
  const p = { 고군분투: 0, 반항: 0, 완벽: 0, 외고집: 0, 잡념: 0, 만족: 0, 적당: 0, 의존: 0, 싫증: 0 }

  for (const [id, val] of Object.entries(answers)) {
    const num = Number(val)
    if (isNaN(num)) continue
    if (/^A\d+$/.test(id)) aoir.A += num
    else if (/^O\d+$/.test(id)) aoir.O += num
    else if (/^I\d+$/.test(id)) aoir.I += num
    else if (/^R\d+$/.test(id)) aoir.R += num
    else if (id.startsWith('P_')) {
      const factor = id.split('_')[1]
      if (p[factor] != null) p[factor] += num
    }
  }

  return { aoir, p }
}

/**
 * 각 엔진의 원점수에서 관련 P 마찰 점수 감산 → 실질 학습 에너지 (내부 계산용)
 */
export function computeEnergyEfficiency(aoir, p, opts = {}) {
  const { ageWeight = 1 } = opts
  const effective = {}
  const friction = {}

  for (const [engine, pFactors] of Object.entries(AOIR_P_FRICTION)) {
    const raw = aoir[engine]
    const frictionSum = pFactors.reduce((sum, pf) => sum + (p[pf] || 0), 0)
    const frictionAmount = frictionSum * FRICTION_COEFFICIENT * ageWeight
    effective[engine] = Math.max(0, raw - frictionAmount)
    friction[engine] = frictionAmount
  }

  const aoirSum = aoir.A + aoir.O + aoir.I + aoir.R
  const pSum = Object.values(p).reduce((a, b) => a + b, 0)
  const effectiveSum = Object.values(effective).reduce((a, b) => a + b, 0)
  const efficiencyIndex = pSum > 0 ? (aoirSum / (pSum * 0.1 * ageWeight)) : 10

  return {
    raw: aoir,
    effective,
    friction,
    aoirSum,
    pSum,
    effectiveSum,
    efficiencyIndex: Math.round(efficiencyIndex * 10) / 10
  }
}

// 동점 처리 우선순위: I > A > R > O (무조건 하나의 대표 코드 확정)
const TIE_BREAK_PRIORITY = { I: 0, A: 1, R: 2, O: 3 }

function compareAOIR(a, b) {
  const scoreDiff = b[1] - a[1]
  if (scoreDiff !== 0) return scoreDiff
  return (TIE_BREAK_PRIORITY[a[0]] ?? 99) - (TIE_BREAK_PRIORITY[b[0]] ?? 99)
}

/**
 * 우세 AOIR 요인 판정 (항상 하나의 대표 코드 확정)
 * 모든 점수가 낮더라도 가장 높은 요인을 대표 코드로 선정
 * 동점 시 I > A > R > O 우선순위 적용
 * @returns { typeCode, factors, typeName, typeLabel, isLowEnergy }
 */
function getDominantAOIR(aoir) {
  const entries = Object.entries(aoir)
    .map(([k, v]) => [k, v ?? 0])
    .sort(compareAOIR)

  const first = entries[0]
  const maxScore = first?.[1] ?? 0
  const isLowEnergy = maxScore <= 24

  if (entries.length === 0 || !first) {
    return {
      typeCode: 'A',
      factors: ['A'],
      typeName: AOIR_TYPE_NAMES.A,
      typeLabel: '[추진력(A), A형]',
      isLowEnergy: true
    }
  }

  const [second, third] = entries.slice(1, 3)
  const gap = first[1] - (second?.[1] ?? 0)

  let factors
  let typeCode

  if (isLowEnergy) {
    factors = [first[0]]
    typeCode = first[0]
  } else if (entries.length === 1 || gap >= 10) {
    factors = [first[0]]
    typeCode = first[0]
  } else if (entries.length >= 3 && third && second[1] - third[1] < 6) {
    factors = [first[0], second[0], third[0]]
    typeCode = [first[0], second[0], third[0]].sort().join('')
  } else {
    factors = [first[0], second[0]]
    typeCode = [first[0], second[0]].sort().join('')
  }

  const typeName = factors.length === 1
    ? AOIR_TYPE_NAMES[typeCode]
    : (COMPOSITE_TYPE_NAMES[typeCode] || AOIR_TYPE_NAMES[factors[0]])

  const typeLabel = factors.length === 1
    ? `[${AIOR_LABELS[factors[0]]}(${factors[0]}), ${factors[0]}형]`
    : `[${factors.map(f => `${AIOR_LABELS[f]}(${f})`).join(' ')}, ${typeCode}형]`

  return { typeCode, factors, typeName, typeLabel, isLowEnergy }
}

// 저에너지(전반적 낮음) 시 잠재적 강점 해석
const AOIR_LOW_ENERGY_DESC = {
  A: '에너지가 전반적으로 낮지만 그중에서도 귀하의 잠재적 강점은 **추진력(A)**입니다. 이는 망설임보다 "일단 해보는" 태도로 나아갈 수 있는 숨겨진 결을 의미하며, 상황이 주어질 때 빠르게 움직일 수 있는 소중한 역량입니다.',
  O: '에너지가 전반적으로 낮지만 그중에서도 귀하의 잠재적 강점은 **질서(O)**입니다. 이는 자신만의 체계로 환경을 정리하고 예측 가능한 안정을 찾아갈 수 있는 숨겨진 결을 의미하며, 차분한 틀을 세울 수 있는 소중한 역량입니다.',
  I: '에너지가 전반적으로 낮지만 그중에서도 귀하의 잠재적 강점은 **탐구(I)**입니다. 이는 현상의 이면을 궁리하고 본질을 파악할 수 있는 숨겨진 결을 의미하며, 깊이 있는 이해를 이끌어낼 수 있는 소중한 역량입니다.',
  R: '에너지가 전반적으로 낮지만 그중에서도 귀하의 잠재적 강점은 **관계(R)**입니다. 이는 타인과 정서적으로 연결되고 조화를 이루어낼 수 있는 숨겨진 결을 의미하며, 따뜻한 소통을 이끌어낼 수 있는 소중한 역량입니다.'
}

// 저에너지 차트 설명
const CHART_LOW_ENERGY_DESC = {
  A: '나이팅게일 로즈 차트에서 그늘진 영역 가운데 추진력(A)이 상대적으로 돋보입니다. 이는 아직 펼쳐지지 않은 잠재력으로, 적절한 환경과 기회가 주어질 때 발휘될 수 있는 소중한 결입니다.',
  O: '나이팅게일 로즈 차트에서 그늘진 영역 가운데 질서(O)가 상대적으로 돋보입니다. 이는 아직 펼쳐지지 않은 잠재력으로, 안정적인 틀이 필요할 때 발휘될 수 있는 소중한 결입니다.',
  I: '나이팅게일 로즈 차트에서 그늘진 영역 가운데 탐구(I)가 상대적으로 돋보입니다. 이는 아직 펼쳐지지 않은 잠재력으로, 깊이 있는 이해가 필요할 때 발휘될 수 있는 소중한 결입니다.',
  R: '나이팅게일 로즈 차트에서 그늘진 영역 가운데 관계(R)가 상대적으로 돋보입니다. 이는 아직 펼쳐지지 않은 잠재력으로, 따뜻한 연결이 필요할 때 발휘될 수 있는 소중한 결입니다.'
}

/** 높음(≥40) P-역동 (심리적으로 강하게 작용 중) */
function getHighPDynamics(p) {
  return Object.entries(p)
    .filter(([, v]) => v >= 40)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
}

/** 상위 P-역동 1~3개 (25점 이상, 점수순) */
function getTopPDynamics(p, limit = 3) {
  return Object.entries(p)
    .filter(([, v]) => v >= 25)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k)
}

/** P요인 35점 이상 존재 여부 */
const P_HIGH_THRESHOLD = 35

function hasAnyPAboveThreshold(p, threshold = P_HIGH_THRESHOLD) {
  return Object.values(p || {}).some((v) => v >= threshold)
}

/**
 * P-역동별 '숭고한 정성' 해석 (PDF 톤)
 * 35점 이상인 요인이 없으면 { _isPeaceful: true } 반환 (평온한 상태)
 */
export function getPDynamicsReport(p, keyFactors) {
  if (!hasAnyPAboveThreshold(p)) return { _isPeaceful: true }

  const reports = {}
  const factorsAbove35 = Object.entries(p)
    .filter(([, v]) => v >= P_HIGH_THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  for (const [factor, value] of factorsAbove35) {
    const noble = P_NOBLE_DESC[factor]
    if (noble) {
      reports[factor] = {
        value,
        isKey: keyFactors.includes(factor),
        text: noble
      }
    }
  }

  return reports
}

/**
 * 레이더 차트용 데이터 (0~100 스케일)
 */
export function getRadarData(aoir, effective) {
  const maxRaw = 50
  return ['A', 'O', 'I', 'R'].map((k) => ({
    factor: k,
    label: AOIR_LABELS[k],
    raw: Math.min(100, (aoir[k] / maxRaw) * 100),
    effective: Math.min(100, ((effective[k] ?? aoir[k]) / maxRaw) * 100),
    rawScore: aoir[k],
    effectiveScore: Math.round(effective[k] ?? aoir[k])
  }))
}

/** 평온한 P 상태 요약 (35점 이상 요인 없음) */
const P_PEACEFUL_BLOCK = '현재 심리적으로 특별한 과부하가 없는 평온한 상태입니다. 특별한 심리적 역동이 관찰되지 않으며, 이는 매우 안정적인 심리적 항상성을 유지하고 있음을 의미합니다.'

/**
 * 통합 내러티브 리포트 생성 (PAIOR.pdf + 해석 예시.pdf 결합)
 * 데이터 매핑: $A$, $O$, $I$, $R$, $P1$~$P9$ 주입으로 개인화
 */
function buildNarrative(dominant, topP, highP, aoir, p) {
  const { typeCode, factors, typeName, typeLabel, isLowEnergy } = dominant
  const isSingle = factors.length === 1
  const repCode = factors[0]

  let aoirText = isLowEnergy && repCode && AOIR_LOW_ENERGY_DESC[repCode]
    ? AOIR_LOW_ENERGY_DESC[repCode]
    : (isSingle
        ? AOIR_SINGLE_DESC[repCode]
        : (AOIR_COMPOSITE_DESC[typeCode] || AOIR_SINGLE_DESC[repCode]))

  let chartText = isLowEnergy && repCode && CHART_LOW_ENERGY_DESC[repCode]
    ? CHART_LOW_ENERGY_DESC[repCode]
    : (isSingle
        ? CHART_SINGLE_DESC[repCode]
        : (CHART_COMPOSITE_DESC[typeCode] || CHART_SINGLE_DESC[repCode]))

  let pBlock = ''
  if (!hasAnyPAboveThreshold(p)) {
    pBlock = P_PEACEFUL_BLOCK
  } else if (highP.length > 0) {
    const highList = highP.map((k) => `**${P_LABELS[k]}**(${p[k]}점, 높음)`).join(', ')
    pBlock = `현재 심리 역동(P1~P9)에서 ${highList} 등 40점 이상 '높음' 항목이 있어, 현재 심리적으로 강하게 작용 중입니다. 이는 귀하가 삶을 대하는 **숭고한 정성**의 일면으로, 파이오르는 모든 P-역동을 문제가 아닌 자신을 지키고 나아가려는 진실한 태도로 읽어냅니다.`
  } else {
    const topFactor = topP[0]
    const topScore = topFactor ? (p[topFactor] ?? 0) : 0
    if (topFactor && topScore >= 25 && P_NOBLE_DESC[topFactor]) {
      pBlock = `현재 심리 바탕(P)에서 관찰되는 **${topFactor}**(${topScore}점)는 ${P_NOBLE_DESC[topFactor]}`
    } else {
      pBlock = `현재 심리 바탕(P)에서 관찰되는 역동은 귀하가 삶을 대하는 **숭고한 정성**의 일면입니다. 파이오르는 모든 P-역동을 문제가 아닌, 자신을 지키고 나아가려는 진실한 태도로 읽어냅니다.`
    }
  }

  const closing = '본 분석은 귀하의 응답 데이터를 기반으로 정밀하게 분석하였습니다. 전문가로부터 더 깊이 있는 해석과 상담이 필요할 수 있습니다.'

  const dataSummary = `귀하의 추진력(A) $A$점, 질서(O) $O$점, 탐구(I) $I$점, 관계(R) $R$점, P 역동(고군분투 $P1$·반항 $P2$·완벽 $P3$·외고집 $P4$·잡념 $P5$·만족 $P6$·적당 $P7$·의존 $P8$·싫증 $P9$점)을 매칭하여 개인화된 리포트를 생성하였습니다.`

  const raw = {
    typeLabel,
    typeName,
    aoirText,
    chartText,
    pBlock,
    dataSummary,
    closing
  }

  return {
    ...raw,
    aoirText: personalizeWithScores(raw.aoirText, aoir, p),
    chartText: personalizeWithScores(raw.chartText, aoir, p),
    pBlock: personalizeWithScores(raw.pBlock, aoir, p),
    dataSummary: personalizeWithScores(raw.dataSummary, aoir, p),
    closing: raw.closing
  }
}

/**
 * 핵심 관찰 역동 (평균+1.5SD 이상, '마찰' 대신 '주요 관찰')
 */
export function getKeyFrictionFactors(p) {
  const values = Object.values(p)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
  const sd = Math.sqrt(variance)
  const threshold = mean + 1 * sd

  return Object.entries(p)
    .filter(([, v]) => v >= threshold)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
}

/**
 * 통합 리포트 생성 (새 톤앤매너)
 */
export function generateReport(answers, target = '') {
  const { aoir, p } = parseScores(answers)
  const efficiency = computeEnergyEfficiency(aoir, p, { ageWeight: 1 })
  const dominant = getDominantAOIR(aoir)
  const keyFactors = getKeyFrictionFactors(p)
  const topP = getTopPDynamics(p, 3)
  const highP = getHighPDynamics(p)
  const pReport = getPDynamicsReport(p, keyFactors)
  const radarData = getRadarData(aoir, efficiency.effective)
  const narrative = buildNarrative(dominant, topP, highP, aoir, p)

  const aoirGrades = { A: getScoreGrade(aoir.A), O: getScoreGrade(aoir.O), I: getScoreGrade(aoir.I), R: getScoreGrade(aoir.R) }
  const pGrades = {}
  for (const k of Object.keys(p)) pGrades[k] = getScoreGrade(p[k])

  const scoreMappedSummary = personalizeWithScores(
    `${dominant.typeLabel} '${dominant.typeName}' 입니다. 귀하의 추진력(A) $A$점, 질서(O) $O$점, 탐구(I) $I$점, 관계(R) $R$점, P 역동(고군분투 $P1$·반항 $P2$·완벽 $P3$·외고집 $P4$·잡념 $P5$·만족 $P6$·적당 $P7$·의존 $P8$·싫증 $P9$점)을 매칭하여 개인화된 리포트를 생성하였습니다.`,
    aoir,
    p
  )

  const highAoir = ['A', 'O', 'I', 'R'].filter((k) => (aoir[k] || 0) >= 40)
  const strengthLabel = highAoir.length > 0 ? highAoir.map((k) => AIOR_LABELS[k]).join('·') : dominant.typeName
  const highPLabel = highP.length > 0 ? highP.map((k) => P_LABELS[k]).join(', ') : ''
  const hasHighP = highP.length > 0
  const hasPeacefulP = !hasAnyPAboveThreshold(p)
  const comprehensiveGuide = hasPeacefulP
    ? `귀하의 기질적 강점(${strengthLabel})을 살리면서, 현재 평온한 심리 상태를 유지하시면 더욱 균형 잡힌 학습 에너지를 발휘하실 수 있습니다.`
    : hasHighP
      ? `귀하의 기질적 강점(${strengthLabel})을 살리면서, 현재 활성화된 심리 역동(${highPLabel})을 인식하고 관리해 나가시면 더욱 균형 잡힌 학습 에너지를 발휘하실 수 있습니다.`
      : `귀하의 기질적 강점(${strengthLabel})을 살리면서, 현재의 심리 역동을 알아차리고 관리해 나가시면 더욱 균형 잡힌 학습 에너지를 발휘하실 수 있습니다.`
  const summary = comprehensiveGuide

  return {
    aoir,
    p,
    aoirGrades,
    pGrades,
    efficiency,
    type: dominant.typeName,
    typeLabel: narrative.typeLabel,
    typeName: narrative.typeName,
    narrative,
    keyFactors,
    highP,
    pReport,
    radarData,
    summary
  }
}
