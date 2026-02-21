---
slug: "20251203-1"
redirect_from:
  - "/posts/2025/12/spring-webflux-1-mono/"
title: "Spring WebFlux #1 - Mono"
date: 2025-12-03T01:32:00.000+09:00
categories:
  - 개발
  - 스프링(WebFlux)
tags:
  - Spring
  - webflux
---
## Spring WebFlux란
Spring 5부터 도입된 리액티브 프로그래밍 기반의 웹 프레임워크입니다. 기존 Spring MVC가 동기/블로킹 방식이라면, WebFlux는 비동기/논블로킹 방식으로 동작하여 적은 스레드로 많은 요청을 효율적으로 처리할 수 있습니다.

### Mono란?
Mono는 0개 또는 1개의 데이터를 비동기적으로 처리하는 Publisher입니다. 쉽게 말해 "미래에 도착할 단일 데이터"를 표현하는 컨테이너라고 생각하면 됩니다. JavaScript의 Promise나 Java의 CompletableFuture와 유사한 개념입니다.

### 핵심 특징
* **지연 실행(Lazy)** : `subscribe()`를 호출하기 전까지 실제로 실행되지 않습니다
* **체이닝** : `map(), flatMap(), filter()` 등의 연산자를 체인처럼 연결하여 데이터를 변환합니다
* **논블로킹** : 데이터를 기다리는 동안 스레드가 블로킹되지 않아 다른 작업을 처리할 수 있습니다

### Mono vs Flux

* **Mono**: 0~1개의 데이터 (단일 결과) - 예: 사용자 조회, 로그인 결과
* **Flux**: 0~N개의 데이터 (스트림) - 예: 게시글 목록, 실시간 알림

### 코드 샘플
```java
package com.example.webflux.chapter01;

import reactor.core.publisher.Mono;
import java.time.Duration;

/**
 * 챕터 1: Mono 기초
 * 
 * Mono는 0개 또는 1개의 데이터를 비동기적으로 처리하는 Publisher입니다.
 * 
 * 학습 목표:
 * - Mono 생성 방법 이해
 * - 기본 연산자 사용법 (map, flatMap, filter)
 * - subscribe()의 중요성 이해
 * - 지연 실행(Lazy Execution) 개념
 */
public class Chapter01MonoBasics {

    /**
     * 1-1. Mono.just() - 즉시 값을 가진 Mono 생성
     * 가장 기본적인 Mono 생성 방법
     */
    public static Mono<String> createSimpleMono() {
        return Mono.just("Hello, Mono!");
    }

    /**
     * 1-2. Mono.empty() - 빈 Mono 생성
     * 데이터가 없는 경우를 표현할 때 사용
     */
    public static Mono<String> createEmptyMono() {
        return Mono.empty();
    }

    /**
     * 1-3. Mono.error() - 에러를 발생시키는 Mono
     * 예외 상황을 리액티브하게 처리
     */
    public static Mono<String> createErrorMono() {
        return Mono.error(new RuntimeException("의도적인 에러 발생!"));
    }

    /**
     * 1-4. map() 연산자 - 데이터 변환
     * 동기적으로 데이터를 변환할 때 사용
     */
    public static Mono<String> transformWithMap() {
        return Mono.just("hello")
                .map(String::toUpperCase)  // "hello" -> "HELLO"
                .map(s -> s + " WORLD!");  // "HELLO" -> "HELLO WORLD!"
    }

    /**
     * 1-5. flatMap() 연산자 - 비동기 변환
     * 다른 Mono를 반환하는 비동기 작업을 체이닝할 때 사용
     * map은 일반 값을 반환, flatMap은 Mono/Flux를 반환
     */
    public static Mono<String> transformWithFlatMap() {
        return Mono.just("user123")
                .flatMap(userId -> fetchUserName(userId))  // Mono<String> 반환
                .flatMap(userName -> fetchUserEmail(userName));  // Mono<String> 반환
    }

    // 비동기 작업을 시뮬레이션하는 헬퍼 메소드
    private static Mono<String> fetchUserName(String userId) {
        return Mono.just("홍길동")
                .delayElement(Duration.ofMillis(100));  // 100ms 지연
    }

    private static Mono<String> fetchUserEmail(String userName) {
        return Mono.just(userName + "@example.com");
    }

    /**
     * 1-6. filter() 연산자 - 조건부 필터링
     * 조건을 만족하지 않으면 Mono.empty() 반환
     */
    public static Mono<Integer> filterExample() {
        return Mono.just(42)
                .filter(num -> num > 10)  // 조건 만족: 값 통과
                .map(num -> num * 2);     // 42 * 2 = 84
    }

    /**
     * 1-7. defaultIfEmpty() - 빈 값일 때 기본값 제공
     */
    public static Mono<String> withDefaultValue() {
        return Mono.<String>empty()
                .defaultIfEmpty("기본값");
    }

    /**
     * 1-8. delayElement() - 지연 실행
     * 특정 시간만큼 데이터 방출을 지연
     */
    public static Mono<String> delayedMono() {
        return Mono.just("지연된 메시지")
                .delayElement(Duration.ofSeconds(2));
    }

    /**
     * 1-9. doOnNext(), doOnError(), doOnSuccess() - 부수 효과
     * 데이터 흐름을 변경하지 않고 로깅이나 모니터링 수행
     */
    public static Mono<String> withSideEffects() {
        return Mono.just("데이터")
                .doOnSubscribe(s -> System.out.println("구독 시작!"))
                .doOnNext(data -> System.out.println("데이터 수신: " + data))
                .doOnSuccess(data -> System.out.println("성공적으로 완료: " + data))
                .doOnError(error -> System.err.println("에러 발생: " + error.getMessage()));
    }

    /**
     * 1-10. 실습: subscribe()의 중요성
     * 
     * 중요! Mono는 subscribe()가 호출되기 전까지 아무 일도 일어나지 않습니다.
     * 이를 "지연 실행(Lazy Execution)"이라고 합니다.
     */
    public static void demonstrateLazyExecution() {
        System.out.println("=== Mono 지연 실행 데모 ===");
        
        // 이 코드는 실행되지 않습니다! (subscribe 없음)
        Mono<String> mono = Mono.just("실행 안됨")
                .map(s -> {
                    System.out.println("이 메시지는 출력되지 않습니다");
                    return s;
                });
        
        System.out.println("Mono 생성 완료 (아직 실행 안됨)");
        
        // subscribe()를 호출해야 실제로 실행됩니다
        mono.subscribe(
                data -> System.out.println("✅ 데이터 수신: " + data),
                error -> System.err.println("❌ 에러: " + error),
                () -> System.out.println("✔️ 완료!")
        );
    }

    /**
     * 메인 메소드 - 모든 예제 실행
     */
    public static void main(String[] args) throws InterruptedException {
        System.out.println("\n📖 Chapter 1: Mono 기초 학습\n");

        // 1-1. 기본 Mono
        createSimpleMono().subscribe(System.out::println);

        // 1-2. 빈 Mono
        createEmptyMono().subscribe(
                data -> System.out.println("데이터: " + data),
                error -> System.err.println("에러: " + error),
                () -> System.out.println("빈 Mono 완료")
        );

        // 1-3. 에러 Mono
        createErrorMono().subscribe(
                data -> System.out.println("데이터: " + data),
                error -> System.err.println("에러 캐치: " + error.getMessage())
        );

        // 1-4. map 변환
        transformWithMap().subscribe(System.out::println);

        // 1-5. flatMap 비동기 변환
        transformWithFlatMap().subscribe(System.out::println);

        // 1-6. filter
        filterExample().subscribe(num -> System.out.println("필터 결과: " + num));

        // 1-7. 기본값
        withDefaultValue().subscribe(System.out::println);

        // 1-8. 지연 실행
        System.out.println("지연 시작...");
        delayedMono().subscribe(System.out::println);

        // 1-9. 부수 효과
        withSideEffects().subscribe();

        // 1-10. 지연 실행 데모
        demonstrateLazyExecution();

        // 비동기 작업 완료 대기
        Thread.sleep(3000);
        System.out.println("\n✅ Chapter 1 완료!\n");
    }
}

```
