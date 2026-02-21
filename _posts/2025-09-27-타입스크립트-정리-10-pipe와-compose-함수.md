---
slug: "20250927-1"
redirect_from:
  - "/posts/2025/09/타입스크립트-정리-10-pipe와-compose-함수/"
title: "타입스크립트 정리 #10 - Pipe와 Compose 함수"
date: 2025-09-27T23:07:00.000+09:00
categories:
  - 개발
  - TS
tags:
  - typescript
---
## 1. Pipe와 Compose란?

> 데이터가 수많은 함수를 거치면서 "이게 지금 무슨 일을 하고 있는 거지?" 의문을 가졌던 경우가 있었을 겁니다. 함수만으로 분석하고 이해하기 어려울때 필요한것이 바로 **pipe**와 **compose** 함수예요. 이 도구는 복잡한 로직을 마치 **수도관처럼(pipe)** 또는 **레고 블록처럼(compose) 연결**해서 깔끔하고, 무엇보다 읽기 쉬운 코드로 만들어 줍니다.

### Pipe 함수

* **방향** : 왼쪽에서 오른쪽으로 실행
* **특징** : 데이터가 첫 번째 함수를 거쳐 두 번째 함수로, 그 다음 세 번째 함수로 순차적으로 전달
* **가독성** : 코드를 읽는 순서와 실행 순서가 일치

### Compose 함수

* **방향** : 오른쪽에서 왼쪽으로 실행
* **특징** : 마지막 함수부터 역순으로 실행
* **수학적** : 수학의 함수 합성과 동일한 개념

## 2. 기본 구현 방법

### Pipe 함수 구현

```typescript
type PipeFunction<T, R> = (arg: T) => R;

function pipe<T>(value: T): T;
function pipe<T, A>(value: T, fn1: PipeFunction<T, A>): A;
function pipe<T, A, B>(value: T, fn1: PipeFunction<T, A>, fn2: PipeFunction<A, B>): B;
function pipe<T, A, B, C>(value: T, fn1: PipeFunction<T, A>, fn2: PipeFunction<A, B>, fn3: PipeFunction<B, C>): C;
// ... 더 많은 오버로드

function pipe(value: any, ...fns: Array<(arg: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}
```

### Compose 함수 구현

```typescript
type ComposeFunction<T, R> = (arg: T) => R;

function compose<T>(value: T): T;
function compose<T, A>(fn1: ComposeFunction<T, A>): ComposeFunction<T, A>;
function compose<T, A, B>(fn2: ComposeFunction<A, B>, fn1: ComposeFunction<T, A>): ComposeFunction<T, B>;
// ... 더 많은 오버로드

function compose(...fns: Array<(arg: any) => any>): (arg: any) => any {
  return (value: any) => fns.reduceRight((acc, fn) => fn(acc), value);
}
```

## 3. 실사용 예제

### 기본적인 숫자 계산

```typescript
const add = (a: number) => (b: number): number => a + b;
const multiply = (a: number) => (b: number): number => a * b;
const square = (num: number): number => num * num;
const double = (num: number): number => num * 2;

// Pipe 사용 (왼쪽에서 오른쪽으로)
const result1 = pipe(
  5,
  add(3),        // 5 + 3 = 8
  multiply(2),   // 8 * 2 = 16
  square,        // 16 * 16 = 256
  double         // 256 * 2 = 512
);

// Compose 사용 (오른쪽에서 왼쪽으로)
const composedCalculation = compose(
  double,         // 마지막에 실행
  square,         // 그 다음
  multiply(2),    // 그 다음
  add(3)          // 첫 번째로 실행
);

const result2 = composedCalculation(5);
```

### 문자열 처리

```typescript
const toUpperCase = (str: string): string => str.toUpperCase();
const addExclamation = (str: string): string => str + '!';
const reverse = (str: string): string => str.split('').reverse().join('');

// Pipe로 문자열 처리
const result = pipe(
  "hello world",
  toUpperCase,      // "HELLO WORLD"
  addExclamation,   // "HELLO WORLD!"
  reverse           // "!DLROW OLLEH"
);
```

## 4. 고급 활용

### 사용자 데이터 처리

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

const users: User[] = [
  { id: 1, name: "홍길동", email: "hong@example.com", age: 25, isActive: true },
  { id: 2, name: "김길동", email: "kim@example.com", age: 30, isActive: false },
  { id: 3, name: "이길동", email: "lee@example.com", age: 28, isActive: true },
  // ... 더 많은 사용자
];

// 유틸리티 함수들
const filterActive = (users: User[]): User[] => 
  users.filter(user => user.isActive);

const filterByAge = (minAge: number) => (users: User[]): User[] => 
  users.filter(user => user.age >= minAge);

const sortByName = (users: User[]): User[] => 
  [...users].sort((a, b) => a.name.localeCompare(b.name));

const mapToNames = (users: User[]): string[] => 
  users.map(user => user.name);

const addPrefix = (prefix: string) => (names: string[]): string[] => 
  names.map(name => `${prefix} ${name}`);

// 활성 사용자 중 25세 이상인 사용자들의 이름을 정렬하고 접두사 추가
const activeUsersOver25 = pipe(
  users,
  filterActive,           // 활성 사용자만 필터링
  filterByAge(25),        // 25세 이상 필터링
  sortByName,             // 이름으로 정렬
  mapToNames,             // 이름만 추출
  addPrefix("👤")         // 접두사 추가
);
```
