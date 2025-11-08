---
title: RAG, LangChain, MCP 개념 이해하기
date: 2025-11-09T02:59:00.000+09:00
categories:
  - 개발
  - AI
tags:
  - AI
  - RAG
  - LangChain
  - MCP
---
## 1. RAG (Retrieval-Augmented Generation): LLM의 지식 확장

> RAG는 LLM이 학습 데이터에 없는 최신 정보나 특정 도메인 지식에 접근할 수 있도록 하는 기술입니다. 마치 시험을 볼 때 교과서를 참고할 수 있게 하는 것과 같습니다.

### 작동 원리

1. **문서 준비**: 회사 문서, 매뉴얼, 최신 뉴스 등을 벡터 데이터베이스에 저장
2. **검색 단계**: 사용자 질문과 관련된 문서를 찾아냄
3. **생성 단계**: 검색된 문서를 컨텍스트로 LLM에 전달하여 답변 생성

### 실제 활용 사례

* 기업 내부 문서 검색 챗봇
* 최신 제품 정보 기반 고객 지원
* 법률/의료 분야의 전문 지식 참조 시스템

### 핵심 가치

RAG의 진정한 가치는 **LLM을 재학습시키지 않고도 최신 정보와 도메인 지식을 활용**할 수 있다는 점입니다. 모델 자체는 그대로 두고 참조할 지식만 업데이트하면 됩니다.

## 2. Function Calling: LLM이 실제 작업을 수행하게 하기

> Function Calling은 LLM이 단순히 텍스트를 생성하는 것을 넘어 실제 기능을 실행할 수 있게 하는 메커니즘입니다. LLM이 "언제 어떤 함수를 호출해야 하는지" 판단하고, 적절한 파라미터와 함께 함수 실행을 요청합니다.

### 작동 원리

```
사용자: "내일 서울 날씨 어때?"
↓
LLM: get_weather(location="서울", date="2025-11-10") 호출 필요
↓
시스템: 날씨 API 실행 → 결과 반환
↓
LLM: "내일 서울은 맑고 기온은 15도입니다."
```

### 주요 특징

* **구조화된 출력**: JSON 형태로 함수명과 파라미터 반환
* **의도 파악**: 자연어를 분석해 적절한 함수 선택
* **멀티 스텝**: 여러 함수를 순차적으로 호출 가능

## 3. LangChain: AI 애플리케이션 개발의 표준 프레임워크

> LangChain은 LLM 기반 애플리케이션을 쉽게 구축할 수 있도록 도와주는 오픈소스 프레임워크입니다. \
> 마치 웹 개발에서 Django나 React가 하는 역할과 비슷합니다.

### 해결하는 문제

LLM 개발에서 반복적으로 나타나는 패턴들을 추상화하고 표준화합니다:

* **프롬프트 관리**: 재사용 가능한 프롬프트 템플릿
* **체인 구성**: 여러 LLM 호출을 연결
* **도구 통합**: 검색, DB 접근, API 호출 등을 통합
* **메모리 관리**: 대화 맥락 유지

### 실제 코드 예시

```python
from langchain.chains import RetrievalQA
from langchain.vectorstores import Chroma
from langchain.llms import OpenAI

# RAG 파이프라인을 몇 줄로 구현
vectorstore = Chroma.from_documents(documents)
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    retriever=vectorstore.as_retriever()
)

answer = qa_chain.run("우리 회사 휴가 정책은?")
```

LangChain의 진정한 가치는 **서로 다른 LLM 제공업체(OpenAI, Anthropic, Google 등)와 다양한 도구를 일관된 인터페이스로 사용**할 수 있다는 점입니다. Python 클래스 형태로 제공되는 도구들을 import해서 바로 사용할 수 있습니다.

## 4. MCP (Model Context Protocol): 차세대 표준화의 진화

> MCP는 Anthropic이 제안한 **LLM과 외부 도구 간의 통신 표준 프로토콜**입니다. REST API가 웹 서비스 간 통신 표준이듯, MCP는 LLM 애플리케이션의 통신 표준을 정의합니다.

### LangChain과 무엇이 다른가?

이해를 돕기 위해 발전 단계를 살펴보겠습니다:

**1단계: Raw API (OpenAI, Anthropic)**

* 각 제공업체의 API로 직접 Function Calling 구현
* 문제: 제공업체마다 구현 방식이 다름, 도구 정의/실행을 직접 관리해야 함

**2단계: LangChain**

* Python 패키지로 도구들을 표준화
* 장점: `from langchain import WebSearch` 처럼 간단하게 사용
* 문제: 새 도구 추가 시 **메인 애플리케이션 코드를 수정**해야 함

**3단계: MCP**

* 별도 프로세스로 실행되는 독립적인 서버-클라이언트 아키텍처
* 핵심: **코드베이스를 건드리지 않고** 도구를 추가/제거 가능

### 아키텍처 관점에서의 차이

```
[LangChain 방식]
Your App (Python)
├─ import WebSearch
├─ import DatabaseTool
└─ import CustomTool  ← 새 도구 추가 시 코드 수정 필요

[MCP 방식]
Your App
  ↕ (MCP Protocol)
MCP Server 1 (WebSearch)
MCP Server 2 (Database)
MCP Server 3 (Custom)  ← 독립적으로 추가, 앱 코드 변경 불필요
```

### MCP의 진정한 가치

MCP를 이해하려면 **프로그램 아키텍처 관점**에서 생각해야 합니다:

1. **플러그인 아키텍처**: 마치 VSCode 확장 프로그램처럼 독립적으로 설치/제거
2. **권한 분리**: 각 MCP 서버는 자체 권한과 책임을 가짐
3. **언어 독립성**: Python으로 만든 앱에 Node.js로 만든 MCP 서버 연결 가능
4. **표준 통신**: REST API처럼 정의된 프로토콜로 통신

### MCP가 정의하는 것들

MCP는 단순한 API가 아닙니다. LLM에 최적화된 통신 계층을 정의합니다:

* **Tools**: 실행 가능한 함수들
* **Resources**: 파일, 데이터베이스 등 접근 가능한 리소스
* **Prompts**: 재사용 가능한 프롬프트 템플릿
* **Sampling**: LLM 호출 방법

### 실제 사용 사례

```
Claude Desktop App
  ↕ (MCP)
├─ Filesystem MCP Server (로컬 파일 접근)
├─ GitHub MCP Server (저장소 관리)
├─ Slack MCP Server (메시지 전송)
└─ Database MCP Server (데이터 조회)
```

사용자는 Claude Desktop 설정 파일만 수정하면 됩니다. 애플리케이션 코드는 전혀 변경되지 않습니다.

## 개념들의 관계도

이 네 가지 개념은 서로 다른 문제를 해결합니다:

```
[문제] LLM이 최신 정보를 모름
[해결] RAG → 외부 지식 검색 후 참조

[문제] LLM이 실제 작업을 못함
[해결] Function Calling → 함수 실행 능력 부여

[문제] LLM 개발이 너무 복잡함
[해결] LangChain → 개발 프레임워크 제공

[문제] 도구 추가마다 코드 수정이 필요함
[해결] MCP → 플러그인 방식의 표준 프로토콜
```

## 실전 조합 예시

실제 AI 애플리케이션에서는 이 개념들을 조합해서 사용합니다:

```
고객 지원 AI 에이전트

1. 사용자 질문 수신
2. [Function Calling] 질문 의도 파악
3. [RAG] 내부 문서에서 관련 정보 검색
4. [LangChain] 검색 결과를 정리하여 답변 생성
5. [MCP] 필요시 티켓 시스템에 자동 등록
```

## 실제 사용 시나리오로 이해하기

이 개념들이 실제로 어떻게 사용되는지 구체적인 예시로 살펴보겠습니다.

### 시나리오 1: 스타트업 고객 지원 챗봇 (RAG)

**상황**: 제품 매뉴얼이 자주 업데이트되는 SaaS 스타트업

**문제**: ChatGPT는 우리 제품을 모름, 매번 재학습은 불가능

**해결**: RAG 도입
- 제품 문서를 벡터DB에 저장
- 고객 질문이 들어오면 관련 문서 검색
- 검색된 내용을 기반으로 답변 생성
- 문서 업데이트 시 벡터DB만 갱신하면 끝

**실제 결과**: 모델 재학습 없이 최신 정보로 답변 가능

### 시나리오 2: AI 에이전트 개발 (LangChain)

**상황**: 여러 기능(검색, DB조회, 이메일 발송)을 가진 AI 비서 개발

**문제**: 각 기능을 직접 구현하면 코드가 너무 복잡함

**해결**: LangChain 사용
```python
# 복잡한 구현 없이 몇 줄로 해결
from langchain.agents import create_sql_agent
from langchain.tools import DuckDuckGoSearchRun

tools = [
    DuckDuckGoSearchRun(),
    sql_agent,
    email_tool
]
agent = create_agent(tools=tools)
```

**실제 결과**: 개발 시간 70% 단축, 유지보수 용이

### 시나리오 3: 엔터프라이즈 AI 플랫폼 (MCP)

**상황**: 대기업에서 각 부서가 자체 도구를 AI에 연결하고 싶어함

**문제**: 
- IT팀이 매번 코드를 수정할 수 없음
- 보안상 각 부서는 자기 데이터만 접근해야 함

**해결**: MCP 아키텍처
```
중앙 AI 플랫폼 (코드 변경 없음)
  ↕ MCP
├─ 재무팀 MCP Server (회계 시스템)
├─ HR팀 MCP Server (인사 DB)
└─ 영업팀 MCP Server (CRM)
```

**실제 결과**: 
- 각 팀이 독립적으로 MCP 서버 추가
- 중앙 플랫폼은 그대로 유지
- 권한 분리로 보안 강화

## 기술 선택 가이드

### "지식"이 문제라면 → RAG

**이런 경우 사용:**
- ✅ "우리 회사 휴가 정책은?" - 내부 문서 필요
- ✅ "2024년 신제품 스펙은?" - 최신 정보 필요
- ✅ "이 논문의 핵심 내용은?" - 특정 문서 분석

**이런 경우 불필요:**
- ❌ "파이썬으로 정렬 알고리즘 짜줘" - 일반 지식
- ❌ "이메일 작성해줘" - 창작 작업

### "개발 속도"가 문제라면 → LangChain

**이런 경우 사용:**
- ✅ AI 프로토타입을 빠르게 만들어야 함
- ✅ 검색, DB, API 등 여러 기능 통합 필요
- ✅ 프롬프트 관리와 체이닝이 복잡함

**이런 경우 불필요:**
- ❌ 단순한 ChatGPT API 호출만 필요
- ❌ 성능이 최우선 (LangChain은 편의성에 집중)

### "확장성"이 문제라면 → MCP

**이런 경우 사용:**
- ✅ 사용자가 직접 플러그인 추가할 수 있어야 함
- ✅ 여러 팀이 독립적으로 도구를 개발/배포
- ✅ 코드 수정 없이 기능 추가/제거 필요

**이런 경우 불필요:**
- ❌ 고정된 기능만 있는 간단한 앱
- ❌ 개발자만 사용하고 확장 계획 없음

## 조합해서 사용하기

실전에서는 여러 개념을 함께 사용합니다:

### 예시: AI 법률 비서

```
1단계: [RAG] 관련 판례 검색
   "과거 유사 케이스를 찾아봐"
   → 벡터DB에서 유사 판례 검색

2단계: [LangChain] 복잡한 분석 체인 실행
   → 판례 요약 → 쟁점 추출 → 의견서 작성

3단계: [MCP] 추가 도구 활용
   → 법률 DB MCP Server 연결
   → 문서 작성 MCP Server로 파일 저장
```

### 예시: 개인 AI 비서

```
[기본] LangChain으로 개발
   - 빠른 프로토타이핑
   - 기본 도구들 쉽게 통합

[지식] RAG 추가
   - 내 이메일, 메모, 일정 검색
   - 과거 대화 내용 참조

[확장] MCP로 진화
   - 사용자가 원하는 앱 연동 (Notion, Slack 등)
   - 설정 파일만 수정하면 새 도구 추가
```

## 결론

RAG, Function Calling, LangChain, MCP는 각각 LLM 개발의 서로 다른 측면을 해결합니다. RAG는 지식 확장, Function Calling은 실행 능력, LangChain은 개발 편의성, MCP는 확장 가능한 아키텍처를 제공합니다.

현대 AI 애플리케이션은 이러한 개념들을 조합하여 구축됩니다. 각 개념의 강점을 이해하고 적재적소에 활용하는 것이 성공적인 AI 제품을 만드는 핵심입니다.

특히 MCP는 아직 초기 단계지만, LLM 생태계의 표준화라는 중요한 문제를 해결하려는 야심찬 시도입니다. REST API가 웹 서비스의 표준이 되었듯, MCP가 LLM 통합의 표준이 될 수 있을지 지켜보는 것도 관전 포인트입니다.
