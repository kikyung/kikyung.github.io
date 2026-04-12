# 구현 계획: 개발자 도구 페이지 (Blog Developer Tools)

## 개요

Jekyll 기반 Chirpy 테마 블로그에 8개의 클라이언트 사이드 개발자 유틸리티 도구를 구현한다. 공통 인프라(레이아웃, CSS, 공통 JS)를 먼저 구축한 후, 각 도구를 순차적으로 구현하고, 마지막에 Tools Hub 페이지로 통합한다. 테스트는 fast-check 기반 PBT와 Jest/Vitest 단위 테스트를 병행한다.

## Tasks

- [x] 1. 프로젝트 구조 및 공통 인프라 구축
  - [x] 1.1 테스트 환경 설정
    - `package.json` 생성 (vitest, fast-check 의존성 추가)
    - `vitest.config.js` 설정 (테스트 파일 경로: `tests/tools/**/*.test.js`)
    - `tests/tools/` 디렉토리 구조 생성
    - _Requirements: 2.3, 2.4_

  - [x] 1.2 공통 유틸리티 모듈 구현 (`assets/js/tools/common.js`)
    - `copyToClipboard(text, toastMessage)` 함수 구현
    - `showToast(message, duration)` 함수 구현
    - `showError(elementId, message)` / `clearError(elementId)` 함수 구현
    - `isDarkMode()` / `onThemeChange(callback)` 함수 구현
    - _Requirements: 11.5, 11.1_

  - [x] 1.3 도구 레이아웃 생성 (`_layouts/tool.html`)
    - `default` 레이아웃 상속, 도구 페이지 공통 구조 정의
    - Front Matter 인터페이스 (title, description, tool_icon, tool_description, tool_usage, permalink)
    - 2패널 레이아웃 (입력/출력 영역) 구조
    - `common.js` 및 도구별 JS/CSS 자동 로드 스크립트 태그
    - SEO 메타 태그 포함
    - _Requirements: 11.3, 11.4, 11.6_

  - [x] 1.4 공통 CSS 스타일 생성 (`assets/css/tools/tools.css`)
    - 2패널 레이아웃 스타일 (데스크톱: 좌우, 모바일: 상하)
    - 토스트 알림 스타일
    - 오류 메시지 스타일 (`.tool-error`)
    - 다크/라이트 모드 대응 CSS 변수
    - 반응형 레이아웃 미디어 쿼리
    - 도구 카드 그리드 스타일 (Tools Hub용)
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 2. 체크포인트 - 공통 인프라 검증
  - 테스트 환경이 정상 동작하는지 확인 (vitest 실행)
  - 레이아웃 파일이 Jekyll 빌드에서 오류 없이 처리되는지 확인
  - 문제가 있으면 사용자에게 질문

- [x] 3. 타임스탬프 변환기 구현
  - [x] 3.1 핵심 변환 로직 구현 (`assets/js/tools/timestamp-converter.js`)
    - `timestampToDate(timestamp)` 함수: number → { iso, readable, ms, sec }
    - `dateToTimestamp(dateString)` 함수: string → { sec, ms }
    - `detectTimestampUnit(value)` 함수: number → 'seconds' | 'milliseconds'
    - 현재 시각 실시간 표시 로직
    - 입력 유효성 검사 및 오류 처리
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.2 타임스탬프 변환기 PBT 작성
    - **Property 1: 타임스탬프 변환 라운드트립** - 유효한 Unix 타임스탬프를 날짜로 변환 후 다시 타임스탬프로 변환하면 원래 값과 동일
    - **Validates: Requirements 3.6**
    - **Property 2: 타임스탬프 단위 자동 감지** - 초 단위(10자리 이하)는 'seconds', 밀리초(13자리)는 'milliseconds'로 감지
    - **Validates: Requirements 3.4**

  - [ ]* 3.3 타임스탬프 변환기 단위 테스트 작성
    - 대표 입력/출력 쌍 검증 (epoch 0, 현재 시각 근처 값 등)
    - 엣지 케이스: 음수 타임스탬프, 매우 큰 값, 빈 문자열 입력
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 3.4 타임스탬프 변환기 페이지 생성 (`pages/tools/timestamp-converter.html`)
    - `layout: tool` 사용, Front Matter 설정
    - 입력 영역: 타임스탬프 입력 필드, 날짜/시간 입력 필드
    - 출력 영역: 변환 결과 표시, 현재 시각 실시간 표시
    - 클립보드 복사 버튼 연결
    - _Requirements: 3.1, 3.2, 3.3, 11.4_

- [x] 4. Cron 표현식 해석기 구현
  - [x] 4.1 핵심 파싱/해석 로직 구현 (`assets/js/tools/cron-interpreter.js`)
    - `parseCron(expression)` 함수: 5필드/6필드 자동 감지 및 한국어 설명 생성
    - `getNextExecutions(expression, count, timezone)` 함수: 다음 N회 실행 시각 계산
    - `describeField(field, type)` 함수: 개별 필드 한국어 설명
    - 자주 사용되는 Cron 예시 데이터 정의
    - 입력 유효성 검사 및 오류 처리
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.2 Cron 해석기 PBT 작성
    - **Property 3: Cron 표현식 필드 수 감지** - 5개 필드는 '5-field', 6개 필드는 '6-field'로 감지
    - **Validates: Requirements 4.2**
    - **Property 4: Cron 해석 멱등성** - 동일 표현식에 대해 parseCron을 두 번 호출하면 동일한 description 반환
    - **Validates: Requirements 4.8**

  - [ ]* 4.3 Cron 해석기 단위 테스트 작성
    - 대표 Cron 표현식 파싱 결과 검증 (`*/5 * * * *`, `0 0 * * MON` 등)
    - 엣지 케이스: 잘못된 필드 수, 범위 초과 값
    - _Requirements: 4.1, 4.5_

  - [x] 4.4 Cron 해석기 페이지 생성 (`pages/tools/cron-interpreter.html`)
    - `layout: tool` 사용, Front Matter 설정
    - 입력 영역: Cron 표현식 입력 필드, 예시 목록 (클릭 시 자동 입력)
    - 출력 영역: 한국어 설명, 필드별 분석, 다음 5회 실행 시각
    - 클립보드 복사 버튼 연결
    - _Requirements: 4.1, 4.3, 4.4, 4.6, 4.7_

- [x] 5. 정규표현식 테스터 구현
  - [x] 5.1 핵심 매칭 로직 구현 (`assets/js/tools/regex-tester.js`)
    - `testRegex(pattern, flags, testString)` 함수: 매칭 결과 배열 반환
    - 플래그 옵션 처리 (g, i, m, s, u)
    - 명명된 캡처 그룹 지원
    - 매칭 결과 하이라이트 렌더링 로직
    - 자주 사용되는 정규표현식 예시 데이터 정의
    - 입력 유효성 검사 (SyntaxError 포착)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 5.2 정규표현식 테스터 PBT 작성
    - **Property 5: 정규표현식 매칭 결과 구조 정합성** - start/end 인덱스로 슬라이스한 결과가 fullMatch와 동일, 매칭 수가 배열 길이와 일치
    - **Validates: Requirements 5.3, 5.7**

  - [ ]* 5.3 정규표현식 테스터 단위 테스트 작성
    - 대표 패턴 매칭 결과 검증 (이메일, URL 패턴 등)
    - 엣지 케이스: 빈 패턴, 잘못된 정규식 구문, 매칭 없는 경우
    - _Requirements: 5.1, 5.5_

  - [x] 5.4 정규표현식 테스터 페이지 생성 (`pages/tools/regex-tester.html`)
    - `layout: tool` 사용, Front Matter 설정
    - 입력 영역: 정규표현식 패턴, 플래그 체크박스, 테스트 문자열
    - 출력 영역: 하이라이트된 매칭 결과, 매칭 상세 목록, 요약 정보
    - 예시 패턴 목록, 클립보드 복사 버튼
    - _Requirements: 5.1, 5.2, 5.6, 5.8_

- [x] 6. 체크포인트 - 개발자 유틸리티 도구 1차 검증
  - 타임스탬프 변환기, Cron 해석기, 정규표현식 테스터의 모든 테스트 통과 확인
  - 문제가 있으면 사용자에게 질문

- [x] 7. Markdown 테이블 생성기 구현
  - [x] 7.1 핵심 테이블 생성 로직 구현 (`assets/js/tools/markdown-table-generator.js`)
    - `generateMarkdownTable(data, alignments)` 함수: 2차원 배열 → Markdown 문자열
    - `parseTableSize(rows, cols)` 함수: 빈 2차원 배열 생성
    - 동적 테이블 그리드 렌더링 (행/열 추가/삭제)
    - 정렬 옵션 드롭다운 처리
    - 입력 유효성 검사
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ]* 7.2 Markdown 테이블 생성기 PBT 작성
    - **Property 6: Markdown 테이블 정렬 구분선 생성** - 정렬 옵션에 따라 올바른 구분선 패턴 생성
    - **Validates: Requirements 6.4, 6.5, 6.6**
    - **Property 7: Markdown 테이블 데이터 보존** - 입력 배열의 모든 셀 값이 생성된 Markdown에 포함
    - **Validates: Requirements 6.2, 6.10**
    - **Property 8: 테이블 그리드 크기 정합성** - parseTableSize 반환 배열의 행/열 수가 입력과 일치
    - **Validates: Requirements 6.1**

  - [ ]* 7.3 Markdown 테이블 생성기 단위 테스트 작성
    - 대표 테이블 생성 결과 검증 (2x3, 5x5 등)
    - 엣지 케이스: 1x1 테이블, 특수문자 포함 셀, 빈 셀
    - _Requirements: 6.2, 6.8_

  - [x] 7.4 Markdown 테이블 생성기 페이지 생성 (`pages/tools/markdown-table-generator.html`)
    - `layout: tool` 사용, Front Matter 설정
    - 입력 영역: 행/열 수 입력, 동적 테이블 그리드, 정렬 드롭다운
    - 출력 영역: 생성된 Markdown 코드 미리보기
    - 행/열 추가/삭제 버튼, 클립보드 복사 버튼
    - _Requirements: 6.1, 6.3, 6.7, 6.9_

- [x] 8. 색상 변환기 구현
  - [x] 8.1 핵심 색상 변환 로직 구현 (`assets/js/tools/color-converter.js`)
    - `hexToRgb(hex)` 함수: HEX → RGB 변환
    - `rgbToHex(r, g, b)` 함수: RGB → HEX 변환
    - `rgbToHsl(r, g, b)` 함수: RGB → HSL 변환
    - `hslToRgb(h, s, l)` 함수: HSL → RGB 변환
    - 색상 미리보기 렌더링 로직
    - 입력 유효성 검사 (HEX 형식, RGB 범위, HSL 범위)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.8_

  - [ ]* 8.2 색상 변환기 PBT 작성
    - **Property 9: HEX ↔ RGB 라운드트립** - HEX → RGB → HEX 변환 시 원래 값과 동일
    - **Validates: Requirements 7.9**
    - **Property 10: RGB ↔ HSL 라운드트립** - RGB → HSL → RGB 변환 시 각 채널 ±1 범위 내 일치
    - **Validates: Requirements 7.10**

  - [ ]* 8.3 색상 변환기 단위 테스트 작성
    - 대표 색상 변환 결과 검증 (#FF5733, #000000, #FFFFFF 등)
    - 엣지 케이스: 3자리 HEX, 잘못된 HEX 형식, RGB 경계값
    - _Requirements: 7.1, 7.6, 7.7_

  - [x] 8.4 색상 변환기 페이지 생성 (`pages/tools/color-converter.html`)
    - `layout: tool` 사용, Front Matter 설정
    - 입력 영역: HEX 입력, RGB 입력 (R/G/B 개별), HSL 입력 (H/S/L 개별)
    - 출력 영역: 변환 결과 표시, 색상 미리보기 박스
    - 각 형식별 클립보드 복사 버튼
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. 체크포인트 - 개발자 유틸리티 도구 2차 검증
  - Markdown 테이블 생성기, 색상 변환기의 모든 테스트 통과 확인
  - 문제가 있으면 사용자에게 질문

- [x] 10. Obsidian Metadata Generator 구현
  - [x] 10.1 핵심 YAML 생성 로직 구현 (`assets/js/tools/metadata-generator.js`)
    - `generateYaml(fields)` 함수: MetadataFields → YAML 문자열
    - `parseYaml(yamlString)` 함수: YAML 문자열 → Object
    - 현재 날짜/시간 자동 채움 (Asia/Seoul)
    - 커스텀 필드 동적 추가/삭제 처리
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 10.2 Metadata Generator PBT 작성
    - **Property 11: YAML 메타데이터 라운드트립** - generateYaml → parseYaml 후 모든 필드 값 보존
    - **Validates: Requirements 8.6**

  - [ ]* 10.3 Metadata Generator 단위 테스트 작성
    - 대표 메타데이터 생성 결과 검증 (기본 필드, 태그 배열, 커스텀 필드)
    - 엣지 케이스: 빈 태그 배열, 특수문자 포함 제목
    - _Requirements: 8.1, 8.4_

  - [x] 10.4 Metadata Generator 페이지 생성 (`pages/tools/metadata-generator.html`)
    - `layout: tool` 사용, Front Matter 설정
    - 입력 영역: title, tags, categories, aliases, cssclass 입력 필드, 커스텀 필드 추가 버튼
    - 출력 영역: 생성된 YAML Front Matter 미리보기
    - 클립보드 복사 버튼
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 11. PARA 분류 도우미 구현
  - [x] 11.1 핵심 분류 로직 구현 (`assets/js/tools/para-classifier.js`)
    - `classifyPARA(title, description, checklist)` 함수: 키워드 기반 카테고리 추천
    - PARA 카테고리별 설명 및 분류 기준 데이터 정의
    - 체크리스트 인터랙션 처리 (hasDeadline, hasDeliverable, isOngoing, isReference, isInactive)
    - 폴더 경로 생성 로직 (`1_Projects/`, `2_Areas/`, `3_Resources/`, `4_Archives/`)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 11.2 PARA 분류 도우미 PBT 작성
    - **Property 12: PARA 분류 결과 유효성** - 반환 카테고리가 4가지 중 하나이며, 폴더 경로가 해당 카테고리 접두사로 시작
    - **Validates: Requirements 9.2, 9.4**

  - [ ]* 11.3 PARA 분류 도우미 단위 테스트 작성
    - 대표 분류 결과 검증 (프로젝트성 노트, 참고자료성 노트 등)
    - 엣지 케이스: 빈 설명, 모든 체크리스트 미선택
    - _Requirements: 9.2_

  - [x] 11.4 PARA 분류 도우미 페이지 생성 (`pages/tools/para-classifier.html`)
    - `layout: tool` 사용, Front Matter 설정
    - 입력 영역: 노트 제목, 설명 입력, 분류 기준 체크리스트
    - 출력 영역: 추천 카테고리, 신뢰도, 폴더 경로 제안
    - PARA 카테고리 설명 표시, 클립보드 복사 버튼
    - _Requirements: 9.1, 9.3, 9.4, 9.5_

- [ ] 12. AI 프롬프트 최적화 도구 구현
  - [x] 12.1 핵심 프롬프트 구조화 로직 구현 (`assets/js/tools/prompt-optimizer.js`)
    - `buildPrompt(sections)` 함수: PromptSections → 조합된 프롬프트 문자열
    - `applyTechnique(technique, sections)` 함수: 기법 적용 후 PromptSections 반환
    - 프롬프트 기법 데이터 정의 (Chain of Thought, Few-shot, Zero-shot)
    - 각 섹션별 작성 가이드 및 예시 데이터
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

  - [ ]* 12.2 프롬프트 최적화 도구 PBT 작성
    - **Property 13: 프롬프트 빌드 섹션 포함** - buildPrompt 결과가 입력된 모든 섹션 내용을 포함
    - **Validates: Requirements 10.1**
    - **Property 14: 프롬프트 기법 적용 후 구조 보존** - applyTechnique 후 원래 섹션 내용이 보존됨
    - **Validates: Requirements 10.5**

  - [ ]* 12.3 프롬프트 최적화 도구 단위 테스트 작성
    - 대표 프롬프트 빌드 결과 검증
    - 각 기법 적용 결과 검증 (chain-of-thought, few-shot, zero-shot)
    - _Requirements: 10.1, 10.5_

  - [x] 12.4 프롬프트 최적화 도구 페이지 생성 (`pages/tools/prompt-optimizer.html`)
    - `layout: tool` 사용, Front Matter 설정
    - 입력 영역: Role, Context, Instruction, Format, Constraints 섹션별 텍스트 영역
    - 출력 영역: 조합된 프롬프트 미리보기
    - 프롬프트 기법 선택 드롭다운/버튼, 클립보드 복사 버튼
    - _Requirements: 10.1, 10.3, 10.4, 10.6_

- [x] 13. 체크포인트 - 생산성/AI 도구 검증
  - Metadata Generator, PARA 분류 도우미, 프롬프트 최적화 도구의 모든 테스트 통과 확인
  - 문제가 있으면 사용자에게 질문

- [x] 14. Tools Hub 페이지 및 최종 통합
  - [x] 14.1 Tools Hub 메인 페이지 생성 (`_tabs/tools.md`)
    - `layout: page`, `icon: fas fa-tools`, `order: 5` 설정
    - 카테고리별 카드 그리드 렌더링 (개발자 유틸리티, 생산성/지식 관리, AI 활용)
    - 각 카드에 도구 이름, 설명, 아이콘, 링크 포함
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 14.2 Jekyll 설정 업데이트 (`_config.yml`)
    - `pages/tools/` 경로가 빌드에 포함되도록 확인
    - 필요 시 `collections` 또는 `defaults` 설정 추가
    - _Requirements: 1.1, 2.1_

  - [ ]* 14.3 공통 유틸리티 단위 테스트 작성 (`tests/tools/common.test.js`)
    - `showError` / `clearError` 함수 동작 검증
    - `isDarkMode` 함수 동작 검증
    - _Requirements: 11.1, 11.5_

- [x] 15. 최종 체크포인트 - 전체 통합 검증
  - 모든 테스트 통과 확인 (`vitest run`)
  - 모든 도구 페이지의 permalink가 올바르게 설정되었는지 확인
  - Tools Hub에서 모든 도구 링크가 정상 동작하는지 확인
  - 문제가 있으면 사용자에게 질문

## Notes

- `*` 표시된 태스크는 선택 사항이며, 빠른 MVP를 위해 건너뛸 수 있습니다
- 각 태스크는 특정 요구사항을 참조하여 추적 가능합니다
- 체크포인트에서 점진적 검증을 수행합니다
- Property 테스트는 설계 문서의 14개 정확성 속성을 검증합니다
- 단위 테스트는 대표 예시와 엣지 케이스를 검증합니다
- 모든 JavaScript는 ES Module이 아닌 전통적인 `<script>` 태그 방식으로 로드됩니다
