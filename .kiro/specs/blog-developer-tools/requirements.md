# 요구사항 문서: 개발자 도구 페이지

## 소개

Jekyll 기반 Chirpy 테마 블로그(blog.kikyung.com)에 개발자 전용 웹 유틸리티 도구 페이지를 구축한다. 모든 도구는 서버 없이 클라이언트 사이드(JavaScript)로만 동작하며, 블로그의 콘텐츠 퀄리티를 높여 구글 애드센스 승인에 기여하는 것이 목표이다. 도구는 크게 세 카테고리로 구분된다: 개발자 유틸리티, 생산성/지식 관리, AI 활용 도구.

## 용어 사전

- **Tools_Hub**: 모든 개발자 도구를 모아 놓은 메인 탭 페이지. Chirpy 테마의 `_tabs` 폴더에 추가되는 네비게이션 항목이다.
- **Tool_Page**: 개별 도구가 동작하는 독립 페이지. 각 도구는 고유한 URL 경로를 가진다.
- **Timestamp_Converter**: Unix 타임스탬프와 사람이 읽을 수 있는 날짜/시간 형식 간 양방향 변환을 수행하는 도구.
- **Cron_Interpreter**: Spring @Scheduled 또는 리눅스 crontab 형식의 Cron 표현식을 파싱하여 사람이 읽을 수 있는 한국어 설명으로 변환하고, 다음 실행 시각을 계산하는 도구.
- **Regex_Tester**: 정규표현식 패턴과 테스트 문자열을 입력받아 실시간으로 매칭 결과를 하이라이트하고 매칭 그룹 정보를 표시하는 도구.
- **Markdown_Table_Generator**: 행/열 수를 지정하고 데이터를 입력하면 Markdown 테이블 코드를 생성하는 도구. 정렬 옵션을 포함한다.
- **Color_Converter**: HEX, RGB, HSL 색상 형식 간 양방향 변환을 수행하고, 색상 미리보기와 클립보드 복사 기능을 제공하는 도구.
- **Metadata_Generator**: Obsidian 노트용 YAML Front Matter 메타데이터를 생성하는 도구.
- **PARA_Classifier**: PARA(Projects, Areas, Resources, Archives) 방법론에 따라 노트나 정보를 분류하는 도구.
- **Prompt_Optimizer**: AI 프롬프트를 구조화하고 최적화하는 도구.
- **Chirpy_Theme**: Jekyll 정적 사이트 생성기용 테마로, 사이드바 네비게이션과 `_tabs` 컬렉션을 지원한다.
- **Client_Side_Engine**: 서버 통신 없이 브라우저 내 JavaScript만으로 모든 로직을 처리하는 실행 환경.

## 요구사항

### 요구사항 1: Tools Hub 네비게이션 통합

**사용자 스토리:** 개발자로서, 블로그 사이드바에서 도구 페이지에 바로 접근하고 싶다. 그래야 블로그 방문자가 도구를 쉽게 발견할 수 있다.

#### 인수 조건

1. THE Tools_Hub SHALL Chirpy_Theme 사이드바에 "Tools" 탭으로 표시되며, `_tabs` 폴더에 `tools.md` 파일로 구성된다.
2. THE Tools_Hub SHALL Font Awesome 아이콘(`fas fa-tools`)을 사이드바 탭 아이콘으로 사용한다.
3. THE Tools_Hub SHALL 기존 탭(categories=1, tags=2, archives=3, about=4) 다음 순서인 `order: 5`로 배치된다.
4. THE Tools_Hub SHALL 모든 개별 Tool_Page로의 링크를 카테고리별로 그룹화하여 카드 형태로 표시한다.
5. WHEN 사용자가 Tools_Hub에 접속하면, THE Tools_Hub SHALL 각 도구의 이름, 간단한 설명, 아이콘을 포함한 카드 목록을 렌더링한다.

### 요구사항 2: 클라이언트 사이드 전용 실행

**사용자 스토리:** 블로그 운영자로서, 별도 서버 인프라 없이 모든 도구가 동작하길 원한다. 그래야 GitHub Pages 정적 호스팅 환경에서 추가 비용 없이 운영할 수 있다.

#### 인수 조건

1. THE Client_Side_Engine SHALL 모든 도구의 입력 처리, 변환 로직, 출력 렌더링을 브라우저 내 JavaScript로만 수행한다.
2. THE Client_Side_Engine SHALL 외부 서버로의 API 호출 없이 동작한다(CDN을 통한 라이브러리 로드는 허용).
3. THE Client_Side_Engine SHALL 각 도구의 JavaScript 파일을 `assets/js/tools/` 경로에 개별 모듈로 배치한다.
4. THE Client_Side_Engine SHALL 각 도구의 CSS 파일을 `assets/css/tools/` 경로에 배치한다.

### 요구사항 3: 타임스탬프 변환기

**사용자 스토리:** 개발자로서, Unix 타임스탬프와 날짜/시간 형식을 양방향으로 변환하고 싶다. 그래야 로그 분석과 API 디버깅이 수월해진다.

#### 인수 조건

1. WHEN 사용자가 Unix 타임스탬프(초 또는 밀리초)를 입력하면, THE Timestamp_Converter SHALL ISO 8601 형식과 사람이 읽을 수 있는 날짜/시간(Asia/Seoul 기준)으로 변환한다.
2. WHEN 사용자가 날짜/시간을 입력하면, THE Timestamp_Converter SHALL Unix 타임스탬프(초 및 밀리초)로 변환한다.
3. THE Timestamp_Converter SHALL 현재 시각의 타임스탬프를 실시간으로 표시하는 "현재 시각" 영역을 제공한다.
4. THE Timestamp_Converter SHALL 초 단위와 밀리초 단위 타임스탬프를 자동으로 구분한다.
5. IF 입력된 값이 유효한 타임스탬프 또는 날짜 형식이 아니면, THEN THE Timestamp_Converter SHALL "유효하지 않은 입력입니다"라는 오류 메시지를 표시한다.
6. WHEN Unix 타임스탬프를 날짜로 변환한 후 다시 타임스탬프로 변환하면, THE Timestamp_Converter SHALL 원래 입력과 동일한 값을 반환한다(라운드트립 속성).


### 요구사항 4: Cron 표현식 해석기

**사용자 스토리:** 백엔드 개발자로서, Spring @Scheduled나 리눅스 crontab의 Cron 표현식을 사람이 읽을 수 있는 한국어 설명으로 확인하고 싶다. 그래야 스케줄링 설정을 빠르게 검증할 수 있다.

#### 인수 조건

1. WHEN 사용자가 Cron 표현식(5필드 리눅스 crontab 또는 6필드 Spring 형식)을 입력하면, THE Cron_Interpreter SHALL 해당 표현식을 파싱하여 사람이 읽을 수 있는 한국어 설명으로 변환한다.
2. THE Cron_Interpreter SHALL 5필드(분 시 일 월 요일) 리눅스 crontab 형식과 6필드(초 분 시 일 월 요일) Spring @Scheduled 형식을 자동으로 구분하여 처리한다.
3. WHEN 파싱이 완료되면, THE Cron_Interpreter SHALL 현재 시각(Asia/Seoul 기준) 이후의 다음 5회 실행 예정 시각을 목록으로 표시한다.
4. THE Cron_Interpreter SHALL 각 필드(초, 분, 시, 일, 월, 요일)의 의미를 개별적으로 설명하는 필드 분석 영역을 제공한다.
5. IF 입력된 Cron 표현식의 형식이 유효하지 않으면, THEN THE Cron_Interpreter SHALL "유효하지 않은 Cron 표현식입니다"라는 오류 메시지와 함께 올바른 형식 예시를 표시한다.
6. THE Cron_Interpreter SHALL 자주 사용되는 Cron 표현식 예시 목록(매분, 매시, 매일 자정, 매주 월요일 등)을 클릭 가능한 형태로 제공한다.
7. THE Cron_Interpreter SHALL 해석 결과를 클립보드에 복사하는 버튼을 제공한다.
8. WHEN Cron 표현식을 한국어 설명으로 변환한 후, THE Cron_Interpreter SHALL 동일한 표현식을 다시 입력했을 때 동일한 한국어 설명을 생성한다(멱등성 속성).

### 요구사항 5: 정규표현식 테스터

**사용자 스토리:** 개발자로서, 정규표현식 패턴을 작성하고 테스트 문자열에 대한 매칭 결과를 실시간으로 확인하고 싶다. 그래야 정규식 디버깅 시간을 절약할 수 있다.

#### 인수 조건

1. WHEN 사용자가 정규표현식 패턴과 테스트 문자열을 입력하면, THE Regex_Tester SHALL 실시간으로 매칭되는 부분을 하이라이트하여 표시한다.
2. THE Regex_Tester SHALL 플래그 옵션(global, case-insensitive, multiline, dotAll, unicode)을 체크박스로 제공한다.
3. WHEN 매칭 결과가 존재하면, THE Regex_Tester SHALL 각 매칭의 전체 매칭 텍스트, 캡처 그룹, 시작 인덱스, 끝 인덱스를 목록으로 표시한다.
4. WHEN 정규표현식에 명명된 캡처 그룹이 포함되어 있으면, THE Regex_Tester SHALL 그룹 이름과 매칭된 값을 함께 표시한다.
5. IF 입력된 정규표현식 패턴이 유효하지 않으면, THEN THE Regex_Tester SHALL 구문 오류 메시지를 표시한다.
6. THE Regex_Tester SHALL 자주 사용되는 정규표현식 패턴 예시(이메일, URL, 전화번호, IP 주소 등)를 클릭 가능한 형태로 제공한다.
7. THE Regex_Tester SHALL 매칭 결과 요약(총 매칭 수, 캡처 그룹 수)을 표시한다.
8. THE Regex_Tester SHALL 정규표현식 패턴과 테스트 문자열을 클립보드에 복사하는 버튼을 제공한다.

### 요구사항 6: Markdown 테이블 생성기

**사용자 스토리:** 블로그 작성자로서, 행/열 수를 지정하고 데이터를 입력하면 Markdown 테이블 코드를 빠르게 생성하고 싶다. 그래야 블로그 포스트 작성 시 테이블 마크업 시간을 절약할 수 있다.

#### 인수 조건

1. WHEN 사용자가 행 수와 열 수를 지정하면, THE Markdown_Table_Generator SHALL 해당 크기의 편집 가능한 테이블 입력 그리드를 생성한다.
2. WHEN 사용자가 테이블 셀에 데이터를 입력하면, THE Markdown_Table_Generator SHALL 실시간으로 Markdown 테이블 코드를 생성하여 미리보기 영역에 표시한다.
3. THE Markdown_Table_Generator SHALL 각 열에 대해 정렬 옵션(왼쪽 정렬, 가운데 정렬, 오른쪽 정렬)을 선택할 수 있는 드롭다운을 제공한다.
4. WHEN 왼쪽 정렬이 선택되면, THE Markdown_Table_Generator SHALL 구분선을 `:---` 형식으로 생성한다.
5. WHEN 가운데 정렬이 선택되면, THE Markdown_Table_Generator SHALL 구분선을 `:---:` 형식으로 생성한다.
6. WHEN 오른쪽 정렬이 선택되면, THE Markdown_Table_Generator SHALL 구분선을 `---:` 형식으로 생성한다.
7. THE Markdown_Table_Generator SHALL 행 추가, 행 삭제, 열 추가, 열 삭제 버튼을 제공한다.
8. IF 행 수 또는 열 수가 0 이하로 입력되면, THEN THE Markdown_Table_Generator SHALL "1 이상의 값을 입력해주세요"라는 오류 메시지를 표시한다.
9. THE Markdown_Table_Generator SHALL 생성된 Markdown 코드를 클립보드에 복사하는 버튼을 제공한다.
10. WHEN Markdown 테이블 코드를 생성한 후 해당 코드를 Markdown 렌더러로 렌더링하면, THE Markdown_Table_Generator SHALL 입력한 데이터와 동일한 내용의 테이블이 표시된다(라운드트립 속성).

### 요구사항 7: 색상 변환기 (HEX/RGB/HSL)

**사용자 스토리:** 프론트엔드 개발자로서, HEX, RGB, HSL 색상 형식 간 양방향 변환을 빠르게 수행하고 싶다. 그래야 CSS 작업 시 색상 코드 변환 시간을 절약할 수 있다.

#### 인수 조건

1. WHEN 사용자가 HEX 색상 코드(예: #FF5733)를 입력하면, THE Color_Converter SHALL 해당 색상을 RGB(예: rgb(255, 87, 51))와 HSL(예: hsl(11, 100%, 60%)) 형식으로 변환하여 표시한다.
2. WHEN 사용자가 RGB 값(R, G, B 각각 0~255)을 입력하면, THE Color_Converter SHALL 해당 색상을 HEX와 HSL 형식으로 변환하여 표시한다.
3. WHEN 사용자가 HSL 값(H: 0~360, S: 0~100%, L: 0~100%)을 입력하면, THE Color_Converter SHALL 해당 색상을 HEX와 RGB 형식으로 변환하여 표시한다.
4. THE Color_Converter SHALL 변환된 색상의 미리보기를 색상 박스로 표시한다.
5. THE Color_Converter SHALL 각 형식(HEX, RGB, HSL)의 변환 결과를 개별적으로 클립보드에 복사하는 버튼을 제공한다.
6. IF 입력된 HEX 값이 유효한 형식(#RGB 또는 #RRGGBB)이 아니면, THEN THE Color_Converter SHALL "유효하지 않은 HEX 색상 코드입니다"라는 오류 메시지를 표시한다.
7. IF 입력된 RGB 값이 0~255 범위를 벗어나면, THEN THE Color_Converter SHALL "RGB 값은 0~255 범위여야 합니다"라는 오류 메시지를 표시한다.
8. IF 입력된 HSL 값이 유효 범위(H: 0~360, S: 0~100, L: 0~100)를 벗어나면, THEN THE Color_Converter SHALL "HSL 값이 유효 범위를 벗어났습니다"라는 오류 메시지를 표시한다.
9. WHEN HEX를 RGB로 변환한 후 다시 HEX로 변환하면, THE Color_Converter SHALL 원래 입력과 동일한 HEX 값을 반환한다(라운드트립 속성).
10. WHEN RGB를 HSL로 변환한 후 다시 RGB로 변환하면, THE Color_Converter SHALL 원래 입력과 동일한 RGB 값을 반환한다(라운드트립 속성).


### 요구사항 8: Obsidian Metadata Generator

**사용자 스토리:** Zettelkasten 사용자로서, Obsidian 노트에 일관된 YAML Front Matter를 빠르게 생성하고 싶다. 그래야 노트 관리의 일관성을 유지할 수 있다.

#### 인수 조건

1. WHEN 사용자가 노트 제목, 태그, 카테고리를 입력하면, THE Metadata_Generator SHALL YAML Front Matter 형식의 메타데이터를 생성한다.
2. THE Metadata_Generator SHALL `title`, `date`, `tags`, `categories`, `aliases`, `cssclass` 필드를 포함한 템플릿을 제공한다.
3. THE Metadata_Generator SHALL `date` 필드에 현재 날짜/시간(Asia/Seoul 기준)을 자동으로 채운다.
4. WHEN 사용자가 커스텀 필드를 추가하면, THE Metadata_Generator SHALL 해당 필드를 YAML에 포함한다.
5. THE Metadata_Generator SHALL 생성된 YAML을 클립보드에 복사하는 버튼을 제공한다.
6. WHEN YAML을 생성한 후 파싱하면, THE Metadata_Generator SHALL 입력한 모든 필드 값이 보존된 상태로 복원된다(라운드트립 속성).

### 요구사항 9: PARA 분류 도우미

**사용자 스토리:** 지식 관리자로서, 새로운 정보나 노트를 PARA 방법론에 따라 올바른 카테고리로 분류하고 싶다. 그래야 체계적인 지식 관리가 가능하다.

#### 인수 조건

1. THE PARA_Classifier SHALL Projects, Areas, Resources, Archives 네 가지 카테고리에 대한 설명과 분류 기준을 표시한다.
2. WHEN 사용자가 노트 제목과 설명을 입력하면, THE PARA_Classifier SHALL 키워드 기반으로 적합한 PARA 카테고리를 추천한다.
3. THE PARA_Classifier SHALL 각 카테고리별 분류 기준 체크리스트를 인터랙티브하게 제공한다.
4. WHEN 사용자가 카테고리를 선택하면, THE PARA_Classifier SHALL 해당 카테고리에 맞는 Obsidian 폴더 경로 제안을 표시한다.
5. THE PARA_Classifier SHALL 분류 결과를 클립보드에 복사하는 버튼을 제공한다.

### 요구사항 10: AI 프롬프트 최적화 도구

**사용자 스토리:** AI 활용자로서, 프롬프트를 체계적으로 구조화하고 개선하고 싶다. 그래야 AI로부터 더 정확한 응답을 얻을 수 있다.

#### 인수 조건

1. WHEN 사용자가 원본 프롬프트를 입력하면, THE Prompt_Optimizer SHALL 역할(Role), 맥락(Context), 지시(Instruction), 형식(Format), 제약(Constraints) 섹션으로 구조화된 템플릿을 제공한다.
2. THE Prompt_Optimizer SHALL 각 섹션별 작성 가이드와 예시를 표시한다.
3. THE Prompt_Optimizer SHALL 구조화된 프롬프트를 하나의 텍스트로 조합하여 미리보기를 제공한다.
4. THE Prompt_Optimizer SHALL 프롬프트 기법 목록(Chain of Thought, Few-shot, Zero-shot 등)을 선택 가능한 형태로 제공한다.
5. WHEN 사용자가 프롬프트 기법을 선택하면, THE Prompt_Optimizer SHALL 해당 기법에 맞는 템플릿 구조를 프롬프트에 적용한다.
6. THE Prompt_Optimizer SHALL 완성된 프롬프트를 클립보드에 복사하는 버튼을 제공한다.

### 요구사항 11: 공통 UI/UX 표준

**사용자 스토리:** 블로그 방문자로서, 모든 도구가 일관된 디자인과 사용 경험을 제공하길 원한다. 그래야 도구 간 전환이 자연스럽다.

#### 인수 조건

1. THE Tool_Page SHALL Chirpy_Theme의 다크/라이트 모드 전환을 자동으로 지원한다.
2. THE Tool_Page SHALL 모바일 환경에서도 사용 가능한 반응형 레이아웃을 제공한다.
3. THE Tool_Page SHALL 입력 영역과 출력 영역을 좌우 또는 상하로 분리한 2패널 레이아웃을 기본으로 사용한다.
4. THE Tool_Page SHALL 각 도구 페이지 상단에 도구 이름, 설명, 사용법 안내를 표시한다.
5. THE Tool_Page SHALL 클립보드 복사 시 "복사 완료" 토스트 알림을 표시한다.
6. THE Tool_Page SHALL SEO를 위해 각 페이지에 고유한 `title`, `description` 메타 태그를 포함한다.