---
title: 개념이해하기 (RAG, LangChain, MCP)
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
# AI 개발의 핵심 개념: RAG, LangChain, MCP 이해

> AI 개발 생태계는 빠르게 진화하고 있습니다. \
> 특히 대규모 언어 모델(LLM)을 실제 애플리케이션에 통합하는 과정에서 여러 핵심 개념들이 등장했습니다.\
> **RAG, LangChain, MCP, 그리고 Function Calling**에 대해 살펴보겠습니다.

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

## 미래 전망

### RAG의 미래

* 하이브리드 검색 (키워드 + 벡터 + 그래프)
* 실시간 지식 업데이트
* 멀티모달 검색 (텍스트, 이미지, 영상 통합)

### LangChain의 미래

* 더 많은 통합 (100+ 도구 지원)
* 성능 최적화 및 경량화
* LangGraph를 통한 복잡한 워크플로우 지원

### MCP의 미래

* 산업 표준으로 자리잡기 위한 노력
* 더 많은 제공업체의 채택 (현재는 Anthropic 주도)
* 보안 및 권한 관리 강화
* 엔터프라이즈 기능 확장

## 어떤 것을 선택해야 할까?

### RAG를 사용해야 할 때

* 최신 정보나 특정 도메인 지식이 필요한 경우
* 자주 업데이트되는 데이터를 참조해야 할 때
* LLM 재학습 없이 지식을 확장하고 싶을 때

### LangChain을 사용해야 할 때

* 복잡한 LLM 파이프라인을 구축할 때
* 다양한 도구와 LLM을 통합해야 할 때
* 빠른 프로토타입 개발이 필요할 때

### MCP를 사용해야 할 때

* 최종 사용자가 직접 도구를 추가할 수 있어야 할 때
* 코드 변경 없이 확장 가능한 아키텍처가 필요할 때
* Claude Desktop처럼 플러그인 생태계를 구축하고 싶을 때

## 결론

RAG, Function Calling, LangChain, MCP는 각각 LLM 개발의 서로 다른 측면을 해결합니다. RAG는 지식 확장, Function Calling은 실행 능력, LangChain은 개발 편의성, MCP는 확장 가능한 아키텍처를 제공합니다.

현대 AI 애플리케이션은 이러한 개념들을 조합하여 구축됩니다. 각 개념의 강점을 이해하고 적재적소에 활용하는 것이 성공적인 AI 제품을 만드는 핵심입니다.

특히 MCP는 아직 초기 단계지만, LLM 생태계의 표준화라는 중요한 문제를 해결하려는 야심찬 시도입니다. REST API가 웹 서비스의 표준이 되었듯, MCP가 LLM 통합의 표준이 될 수 있을지 지켜보는 것도 흥미로운 관전 포인트입니다.
