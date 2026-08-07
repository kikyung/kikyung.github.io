---
title: "파이썬 정리 #1 - Hello python, venv"
date: 2025-09-30T23:52:00.000+09:00
categories:
  - 개발
tags:
  - python
  - venv
  - pip
series: "파이썬 정리"
---
# 파이썬 설치 및 기초

## 1. 목표

* 파이썬 설치와 가상환경 설정
* 기본 문법과 실행 방법 이해
* 첫 번째 콘솔 프로그램 실행

## 2. 개발 환경

```bash
# macOS (Homebrew)
brew install python@3.11

# 프로젝트 디렉토리
mkdir python-study && cd python-study

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 진입
python3
```

## 3. Hello, Python! 출력

```python
print("Hello, Python!")

# 종료
quit
```

## 4. 핵심 포인트

* 세미콜론 없이 줄바꿈으로 문장 종료
* 들여쓰기가 문법(블록 구분)에 포함됨
* 동적 타이핑, 간결한 표기

## 5. venv 란?

> Python 프로젝트마다 독립적인 실행 환경(파이썬 + 라이브러리 세트)을 만들어 주는 `가상환경` 도구.

* 왜 필요한가?

  * **의존성 분리**: 프로젝트 A의 `Django 3`와 프로젝트 B의 `Django 4`를 충돌 없이 동시에 사용.  
  * **재현성 보장**: 팀원이 같은 버전의 라이브러리를 쉽게 맞춤.  
  * **시스템 오염 방지**: 전역 Python 설치를 건드리지 않음.

## 6. venv 기본 사용법

```bash
# 1. 가상환경 생성
python3 -m venv .venv

# 2. 활성화
# 프롬프트에 (.venv)가 보이면 활성화된 것.
source .venv/bin/activate

# 3. pip 업데이트 및 패키지 설치
# pip? 파이썬 패키지를 검색하고 설치하는 데 사용되는 도구.
python -m pip install --upgrade pip
pip install requests

# 4. 현재 의존성 저장
pip freeze > requirements.txt

# 5. 비활성화
deactivate

# 6. 다시 작업할 때(프로젝트 열었을 때 재활성화)
source .venv/bin/activate
```

### 팁

* **프로젝트마다 1개의 venv**를 생성, 프로젝트 루트에 보통 `.venv`로 둡니다.
* **IDE/에디터**에서 인터프리터를 `.venv`의 Python으로 지정합니다.
* **의존성 공유**: `requirements.txt`를 커밋하고, 팀원은 `pip install -r requirements.txt`로 동일 환경을 구성합니다.
* 가상환경 삭제는 `.venv` 폴더를 지우면 됩니다. 필요 시 다시 생성/설치하세요.
