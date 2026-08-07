---
title: AI 개발 도구 비교 (Kiro, Claude, Cursor, Antigravity)
date: 2026-03-07T01:07:00.000+09:00
categories:
  - 개발
tags:
  - 코딩에이전트
---
# Kiro CLI · Kiro IDE · Cursor · Claude Code · Google Antigravity (2026년 3월 기준)



- - -

## 1. 도구별 개요

### Kiro (AWS 계열)

| 구분        | Kiro CLI                                                         | Kiro IDE (Kiro App)                                          |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| **공식**    | https://kiro.dev/ · [CLI](https://kiro.dev/cli/)                 | https://kiro.dev/ · [Downloads](https://kiro.dev/downloads/) |
| **설치**    | `curl -fsSL https://cli.kiro.dev/install \| bash`                | kiro.dev/downloads 에서 Mac/Windows/Linux 다운로드                 |
| **형태**    | 터미널 전용 에이전트                                                      | 데스크톱 IDE (VS Code 호환 플러그인·설정)                                |
| **지원 OS** | macOS, Linux (Windows는 WSL)                                      | Windows, macOS, Linux                                        |
| **계정**    | AWS 계정 없이 사용 가능 (소셜, Builder ID 등)                               | 동일 (app.kiro.dev 대시보드)                                       |
| **역사**    | 2025.11 Amazon Q Developer CLI → Kiro CLI 전환. 2026.2 GovCloud 지원 | 2025.11 GA. 0.6에서 CLI·멀티루트·체크포인트·스펙 정확도 등 추가                 |

### Cursor

* VS Code 포크 + AI 에이전트. Agent가 **터미널 명령·코드 편집·검색·브라우저**를 직접 실행.
* Cursor 2.0+ Agent Sandbox(기본), Auto-Run 설정 지원.

### Claude Code

* Anthropic 공식 **자율 코딩 에이전트**. 터미널/IDE(VS Code, JetBrains)/웹.
* CLAUDE.md, 100만 토큰 컨텍스트(베타), MCP 등.

### Google Antigravity

* **공식**: https://antigravityide.org/ · [Google Codelabs](https://codelabs.developers.google.com/getting-started-google-antigravity)
* **형태**: 에이전트 우선 IDE (에이전트 퍼스트). Gemini 3 기반. 2025년 11월 공개.
* **실행**: 에디터·터미널·브라우저에서 **여러 에이전트가 동시에** 계획·실행·검증.
* **Mission Control**: 여러 에이전트를 한 화면에서 조율·관찰.
* **가격 (2026)**: 무료(주간 쿼터), Pro $19.99/월(5시간 주기), Ultra $249.99/월. 프리뷰는 무료.
* **제한**: 무료/Pro 모두 **레이트 리밋이 빡셈** (몇 번 프롬프트만에 소진 가능). Thinking 토큰이 쿼터에 포함.

- - -

## 2. 다섯 도구 한 줄 정리 (2026년 3월)

| 도구                     | 한 줄 정리                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| **Cursor**             | VS Code 기반 IDE + 에이전트가 터미널·코드·검색·브라우저를 직접 실행하는 AI 개발 환경.               |
| **Claude Code**        | 터미널/IDE/웹 자율 코딩 에이전트. 읽기·편집·명령·테스트를 스스로 반복 수행.                         |
| **Kiro CLI**           | 터미널 전용 AI 에이전트. 자연어 → git/docker/aws/kubectl 명령 생성·실행, AWS·DevOps 특화.  |
| **Kiro IDE**           | **스펙 기반** AI IDE. 요구사항→설계→태스크 구조화, 에이전트 훅·오토파일럿·MCP, 터미널·배포까지.         |
| **Google Antigravity** | Gemini 3 기반 **에이전트 우선 IDE**. 다중 에이전트 동시 실행, 아티팩트·피드백, Mission Control. |

- - -

## 3. 역할·강점·약점 (도구별)

### Cursor

* **역할**: 에디터 + **터미널 명령 직접 실행** (샌드박스/설정에 따라 자동 또는 승인).
* **강점**: 프로젝트 맥락, 다중 파일 리팩토링, 타입/컴파일 에러 수정, 멀티 모델, 브라우저·이미지·체크포인트, VS Code 생태계.
* **약점**: “터미널만” 쓰고 싶을 때는 Cursor CLI 필요. Kiro CLI처럼 “CLI만 설치해 터미널만” 쓰는 경험과는 다름.

### Claude Code

* **역할**: 터미널·IDE·웹 **자율 에이전트**. 의도 주면 파일·명령·테스트를 스스로 반복.
* **강점**: 자율 실행, 100만 토큰 컨텍스트(베타), CLAUDE.md, 서브에이전트·MCP. 결과 중심으로 맡기기 좋음.
* **약점**: Anthropic 전용. Cursor 같은 에디터 통합·시각적 diff·멀티모델은 아님. 구독 비용 대비 비교 필요.

### Kiro CLI

* **역할**: **터미널 전용** AI 에이전트. AWS·DevOps·CLI 작업 특화.
* **강점**: 자연어→정확한 CLI 명령 생성·실행, 커스텀 에이전트, `.kiro`로 IDE와 설정 공유, 한국어, IDE 독립.
* **약점**: 코드 편집 정교함·전체 리팩터링은 Cursor/Claude Code보다 약함. 명령 실행 시 승인 신중. AWS 편향.

### Kiro IDE (Kiro App)

* **역할**: **스펙 기반(spec-driven)** AI IDE. 요구사항→설계→태스크로 구조화 후 에이전트가 구현·배포까지.
* **강점**: EARS 요구사항·설계 문서·태스크 시퀀스, property-based 스펙 검증, 에이전트 훅(파일 저장 시 자동 테스트/문서화 등), 오토파일럿, MCP·스티어링 파일, 멀티루트 워크스페이스, 체크포인트, VS Code 플러그인·설정 호환.
* **약점**: 스펙 작성/유지보수 필요. Cursor만큼 “그냥 채팅으로 바로 수정”보다는 구조화된 워크플로에 맞음. Windows는 CLI 미지원(IDE만).

### Google Antigravity

* **역할**: **에이전트 우선** IDE. 여러 에이전트가 에디터·터미널·브라우저에서 동시에 작업.
* **강점**: 다중 에이전트 병렬 실행, Mission Control로 조율·관찰, 아티팩트(태스크 리스트·스크린샷·브라우저 녹화), Google 독 스타일 코멘트로 피드백·재실행, VS Code/Cursor 설정 임포트, 개인 Gmail 기준 프리뷰 무료.
* **약점**: **레이트 리밋이 매우 타이트** (무료는 주간, Pro도 5시간 주기·몇 번 쓰면 소진 가능). Thinking 토큰이 쿼터에 포함돼 무거운 작업은 빠르게 소진. Chrome 필요.

- - -

## 4. 비교 요약표 (2026년 3월)

| 구분         | Cursor           | Claude Code             | Kiro CLI       | Kiro IDE                 | Google Antigravity              |
| ---------- | ---------------- | ----------------------- | -------------- | ------------------------ | ------------------------------- |
| **형태**     | IDE (VS Code 포크) | CLI/IDE/웹 에이전트          | 터미널 전용         | 데스크톱 IDE                 | 에이전트 우선 IDE                     |
| **터미널 실행** | ✅ 에이전트 직접 실행     | ✅ 직접 실행                 | ✅ 직접 실행        | ✅ 에이전트 실행                | ✅ 다중 에이전트                       |
| **코드 편집**  | ✅ 통합·diff 강함     | ✅ 읽기·쓰기                 | ⚠️ 보조          | ✅ 스펙 기반 구현               | ✅ 에이전트 편집                       |
| **특화**     | 멀티모델·통합 개발       | 자율 실행·대용량 컨텍스트          | AWS·DevOps·CLI | 스펙 기반·훅·오토파일럿            | 다중 에이전트·아티팩트                    |
| **모델**     | 멀티 (OpenAI 등)    | Anthropic               | Kiro/Bedrock 등 | Claude Sonnet 4.5 / Auto | Gemini 3                        |
| **가격 대략**  | 무료 티어·Pro 등      | Claude Max 등 ~$100/월 수준 | 무료·유료 플랜       | 무료·엔터프라이즈                | 무료(쿼터)·Pro $19.99·Ultra $249.99 |

- - -

## 5. Kiro CLI vs Kiro IDE (Kiro App)

| 구분         | Kiro CLI                                         | Kiro IDE                              |
| ---------- | ------------------------------------------------ | ------------------------------------- |
| **인터페이스**  | 터미널만                                             | GUI 에디터 + 채팅 + 스펙 편집                  |
| **스펙**     | 스티어링 파일·스펙 지원 (CLI에서 스펙 풀 생성은 이후 버전 예정)          | 요구사항·설계·태스크 풀 생성·편집·property-based 검증 |
| **워크스페이스** | 단일 디렉터리 중심                                       | 멀티루트 워크스페이스                           |
| **훅**      | —                                                | 파일 저장 등 이벤트 기반 에이전트 훅                 |
| **체크포인트**  | —                                                | 대화 상태 롤백                              |
| **공통**     | `.kiro` 스티어링·MCP·커스텀 에이전트·Auto/Claude Sonnet 4.5 |                                       |

- - -

## 6. Kiro CLI / Kiro IDE를 쓰기 좋은 곳

### Kiro CLI

1. **DevOps/배포**: "ECS 새 버전 배포해 줘", "이 Lambda 최근 에러 로그 찾아줘"
2. **반복 터미널**: "프로젝트 초기 세팅 해줘", "테스트 돌리고 실패만 요약해줘"
3. **Git 워크플로**: "feature 브랜치 만들어서 커밋하고 PR 준비해줘"
4. **AWS 탐색·디버깅**: "VPC 안 EC2 목록", "API Gateway에 붙은 Lambda 설정 요약"
5. **인프라 스크립트 초안**: "S3 정적 사이트 배포 스크립트", "CloudWatch 알람 Bash"

### Kiro IDE

1. **기능 단위 개발**: 자연어 → 요구사항(EARS)·설계·태스크 → 에이전트가 순서대로 구현
2. **버그 수정·디자인 퍼스트**: 스펙으로 버그/디자인 명세 후 구현
3. **훅 자동화**: 저장 시 유닛 테스트·문서 생성·성능 개선 등 백그라운드 에이전트
4. **대규모/멀티 프로젝트**: 멀티루트 워크스페이스 + 스펙으로 의도 명확화
5. **배포까지 한 흐름**: 대화·스펙 → 코드 → 터미널/배포까지 IDE 안에서 진행

- - -

## 7. 장단점 요약 (도구별)

### Kiro (CLI + IDE 공통)

**장점**  

* 스펙 기반으로 의도·제약 명확화 (IDE에서 강함)  
* 터미널만 쓰려면 CLI, 구조화된 개발은 IDE로 선택 가능  
* AWS 계정 없이 시작 가능, 한국어 지원  
* 커스텀 에이전트·스티어링·MCP·(IDE) 훅·체크포인트  

**단점**  

* 코드 수준 리팩터링·깊은 이해는 Cursor/Claude Code가 유리  
* AWS 편향, 명령 실행 시 승인 신중 필요  
* IDE는 스펙 작성/유지보수 필요  

### Google Antigravity

**장점**  

* 다중 에이전트·Mission Control·아티팩트·피드백 루프  
* 개인용 프리뷰 무료, VS Code/Cursor 설정 임포트  

**단점**  

* **레이트 리밋 매우 타이트** (무료 주간, Pro도 5시간 주기·소진 빠름)  
* Thinking 토큰 포함이라 무거운 작업 시 쿼터 빠르게 소진  
* Chrome 필요  

- - -

## 8. 추천 워크플로 (5개 도구 포함, 2026년 3월)

| 목적              | 추천 도구                         | 용도                             |
| --------------- | ----------------------------- | ------------------------------ |
| 설계·리서치·문서       | Claude(챗) / Claude Code(Plan) | 아키텍처, 기술 비교, README·API 설계     |
| 코드 + 터미널 한 화면   | **Cursor**                    | 리팩토링, 테스트, 에이전트로 터미널까지 통합      |
| 스펙 기반 기능 개발     | **Kiro IDE**                  | 요구사항→설계→태스크→구현·배포, 훅 자동화       |
| 터미널만·DevOps·AWS | **Kiro CLI**                  | 에디터 없이 빌드/배포/로그/CI-CD          |
| 다중 에이전트·병렬 작업   | **Google Antigravity**        | 여러 태스크 동시 진행, 아티팩트·피드백 (쿼터 감안) |

- - -

## 9. Kiro 활용 인사이트

1. **명령 기록 = 플레이북**: Kiro가 제안·실행한 명령 히스토리를 팀 표준 DevOps 플레이북으로 활용.
2. **CI/CD 설계**: "로컬에서 하던 빌드·테스트·배포를 GitHub Actions YAML로 옮겨줘" → CLI 명령 기반 초안 생성.
3. **Git/브랜치 규칙**: "브랜치 이름은 feature/, hotfix/만 허용해" 등으로 규칙 강제.
4. **학습 도구**: "이 명령이 왜 필요하고, 어떤 옵션이 위험한지 설명해줘" → 실행 + 학습 동시에.
5. **회사 규칙 반영**: AWS 태깅·버킷 네이밍·IAM 최소 권한 등을 스티어링에 넣어 규칙 위반 명령을 줄이기.

- - -

## 10. Kiro CLI 주요 명령

* `kiro-cli chat` — 대화형 세션  
* `kiro-cli agent` — 커스텀 에이전트 관리  
* 설치·명령·권한: [Kiro CLI 설치](https://kiro.dev/docs/cli/installation/), [CLI 명령 레퍼런스](https://kiro.dev/docs/cli/reference/cli-commands)

- - -

## 11. 최종 요약 (2026년 3월)

* **코드 편집 + 터미널 한 번에 (IDE)** → **Cursor**  
* **설계·문서·리서치** → **Claude(챗)** / **Claude Code(Plan)**  
* **스펙 기반 기능 개발·훅·오토파일럿** → **Kiro IDE (Kiro App)**  
* **터미널만·DevOps·AWS** → **Kiro CLI**  
* **다중 에이전트·병렬 작업·아티팩트** → **Google Antigravity** (레이트 리밋 감안)
