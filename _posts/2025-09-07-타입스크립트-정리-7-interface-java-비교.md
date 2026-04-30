---
title: "타입스크립트 정리 #7 - Interface (java 비교)"
date: 2025-09-08T00:12:00.000+09:00
categories:
  - 개발
  - TS
tags:
  - typescript
series: "타입스크립트 정리"
---
## 인터페이스란?

### TypeScript

객체의 "형태(shape)"를 정의하는 타입 계약. 컴파일 시 제거되어 런타임 비용 없음.

### Java

클래스가 구현해야 하는 메서드 시그니처를 정의하는 참조 타입. 바이트코드로 남아 런타임에 존재.

- - -

## 구조적(Structural) vs 명목적(Nominal) 타이핑

### TypeScript (구조적)

> 구조가 같으면 같은 타입으로 간주.

```typescript
interface User { 
  id: number; 
  name: string; 
}

const obj = { id: 1, name: "홍길동", extra: true };
const u: User = obj; // OK (필수 구조 충족)
```

### Java (명목적)

> 선언된 타입 이름의 일치가 중요. 구조가 같아도 타입이 다르면 호환 안 됨.

```java
interface User { 
  int getId(); 
  String getName(); 
}

class Person { 
  int getId() { return 1; } 
  String getName() { return "홍길동"; } 
}
// Person은 User를 implements 하지 않으면 User로 취급 불가
```

- - -

## 선언과 기본 사용

```typescript
// TypeScript
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;     // 선택적
  readonly sku: string;     // 읽기 전용
}
```

```java
// Java
public interface Product {
  int getId();
  String getName();
  int getPrice();
  default String getDescription() { return null; } // default 메서드 허용
}
```

- - -

## 선택적(옵셔널)과 읽기 전용

### TypeScript

* `prop?: T` 선택적 속성
* `readonly prop: T` 읽기 전용 속성

```typescript
interface Config {
  readonly apiUrl: string;
  timeout?: number;
}
```

### Java

* 선택적/읽기 전용은 키워드로 표현하지 않음. 게터만 제공하고 세터 생략 등으로 관례적으로 불변 설계.

- - -

## 함수 타입과 호출 시그니처

### TypeScript

인터페이스로 함수 형태를 직접 정의 가능.

```typescript
interface Calculator {
  add(a: number, b: number): number;
  subtract: (a: number, b: number) => number;
}
```

### Java

함수 타입 인터페이스는 SAM(단일 추상 메서드) + 람다로 대체.

```java
@FunctionalInterface
interface Calculator {
  int apply(int a, int b);
}
```

- - -

## 인덱스 시그니처와 딕셔너리 패턴 (TS 고유)

### TypeScript

```typescript
interface NumberDictionary {
  [key: string]: number;
  length: number;
}
```

### Java

`Map<K,V>` 등의 제네릭 컬렉션 사용.

- - -

## 유니온/판별식 유니온과 타입 내협력 (TS 고유)

### TypeScript

```typescript
interface Square { kind: "square"; size: number; }
interface Circle { kind: "circle"; radius: number; }
type Shape = Square | Circle;

function area(s: Shape) {
  switch (s.kind) {
    case "square": return s.size * s.size;
    case "circle": return Math.PI * s.radius * s.radius;
  }
}
```

### Java

유니온 타입 없음. 계층/상속, sealed classes(최근 Java)로 유사 모델링.

- - -

## 제네릭

### TypeScript

```typescript
interface Box<T> {
  contents: T;
  getContents(): T;
}
```

### Java

```java
interface Box<T> {
  T getContents();
}
```

둘 다 제네릭 지원. TS는 타입 소거 후 JS로 컴파일, Java는 타입 소거(Type Erasure) 기반 바이트코드.

- - -

## 확장(extends)과 구현(implements)

### TypeScript

* 인터페이스가 인터페이스를 `extends`로 다중 상속 가능.
* 클래스는 인터페이스를 `implements`로 다중 구현 가능.
* 인터페이스는 속성/메서드 시그니처만, 구현은 없음.

```typescript
interface A { a: number }
interface B { b: number }
interface C extends A, B { c: number }
class Foo implements C { a=1; b=2; c=3 }
```

### Java

* 인터페이스가 인터페이스를 `extends`로 다중 상속 가능.
* 클래스는 인터페이스를 `implements`로 다중 구현 가능.
* 인터페이스는 `default`/`static` 메서드 구현 가능.

```java
interface A { int a(); }
interface B { int b(); }
interface C extends A, B { int c(); }
class Foo implements C { /* 모든 메서드 구현 */ }
```

- - -

## 런타임 존재 여부와 리플렉션

### TypeScript

인터페이스는 컴파일 시 제거(emit 안 됨). 런타임 타입 검사/리플렉션 불가.

### Java

인터페이스는 바이트코드로 존재. 리플렉션/프록시/DI 프레임워크에서 적극 활용.

- - -

## 접근 제한자/상수/메서드 특성 (Java 중심)

### Java

* 인터페이스의 필드는 묵시적으로 `public static final` (상수).
* 메서드는 기본 `public abstract`, `default`/`static` 가능.
* 어노테이션, sealed 인터페이스, record와의 결합 등 풍부한 런타임 메타데이터 생태계.

### TypeScript

* 인터페이스에는 접근 제한자 개념 없음(타입 수준 계약).
* 속성/메서드 시그니처만 존재, 구현/상수/어노테이션 없음.

- - -

## 선언 병합(Declaration Merging, TS 고유)

### TypeScript

```typescript
interface User { id: number }
interface User { name: string }
// 병합 결과: { id: number; name: string }
```

### Java

동일 이름 인터페이스 재선언 불가.

- - -

## 인터페이스 vs 타입 별칭 (TypeScript에서)

### 인터페이스를 선택할 때

* 선언 병합이 유리하거나, 확장/계약 중심 모델링, 라이브러리 공개 API.

### 타입 별칭을 선택할 때

* 유니온/인터섹션/조건부/매핑 타입 등 고급 타입 조합 필요.

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

- - -

## 흔한 실수와 팁

### 구조적 타이핑 주의

필요한 구조만 맞으면 통과하므로, 의도치 않은 호환성 발생 가능. 명확한 속성 좁히기/판별 키 사용.

### readonly는 얕음

중첩 객체까지 불변 보장 아님. `Readonly<T>`/불변 모델링 고려.

### 런타임 검사 필요 시

TS 인터페이스만으로는 부족. `zod`, `io-ts`, 사용자 정의 타입 가드로 런타임 검증.

### 함수 타입은 인터페이스/타입 모두 가능

일관성 유지.

### 라이브러리 공개 타입

선언 병합 확장 가능성을 주려면 인터페이스가 적합.

- - -

## 예제 모음 (TS)

```typescript
// 선택적/readonly
interface Config { 
  readonly apiUrl: string; 
  timeout?: number; 
}

// 함수 시그니처
interface Calculator {
  add(a: number, b: number): number;
  subtract: (a: number, b: number) => number;
}

// 인덱스 시그니처
interface NumberDictionary {
  [key: string]: number;
  length: number;
}

// 판별식 유니온
interface Square { kind: "square"; size: number }
interface Circle { kind: "circle"; radius: number }
type Shape = Square | Circle;
```
