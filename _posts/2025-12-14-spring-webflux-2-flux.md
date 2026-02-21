---
slug: "20251214-1"
redirect_from:
  - "/posts/2025/12/spring-webflux-2-flux/"
title: "Spring WebFlux #2 - Flux"
date: 2025-12-15T00:41:00.000+09:00
categories:
  - 개발
  - 스프링(WebFlux)
tags:
  - Spring
  - webflux
---
## **Flux**란

Flux는 0개 이상의 데이터를 비동기적으로 처리하는 Publisher입니다. Mono가 `단일 데이터`를 다룬다면, Flux는 `데이터 스트림`을 다룹니다.

### **Mono vs Flux 비교**

* **Mono**: 0~1개 데이터 (예: 사용자 조회, 로그인 결과)
* **Flux**: 0~N개 데이터 (예: 게시글 목록, 실시간 알림, 채팅 메시지)

### **이번 글에서 다룰 내용**

* Flux 생성 방법 (`just`, `fromIterable`, `range`, `interval`)
* 핵심 연산자 (`map`, `filter`, `flatMap`, `concatMap`)
* 스트림 결합 (`zip`, `merge`)
* 백프레셔(`Back Pressure`) 개념
* 실무에서 자주 사용하는 패턴들

Flux는 실시간 데이터 처리, 대용량 데이터 스트리밍, 이벤트 기반 시스템에서 핵심적인 역할을 합니다.

```java
package com.example.webflux.chapter02;

import reactor.core.publisher.Flux;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * 챕터 2: Flux 기초
 * 
 * Flux는 0개 이상의 데이터를 비동기적으로 처리하는 Publisher입니다.
 * 
 * 학습 목표:
 * - Flux 생성 방법 이해
 * - 스트림 연산자 활용
 * - 백프레셔(Back Pressure) 개념
 * - Flux와 Mono의 차이점 이해
 */
public class Chapter02FluxBasics {

    /**
     * 2-1. Flux.just() - 여러 값을 가진 Flux 생성
     */
    public static Flux<String> createSimpleFlux() {
        return Flux.just("Apple", "Banana", "Cherry", "Durian");
    }

    /**
     * 2-2. Flux.fromIterable() - 컬렉션에서 Flux 생성
     */
    public static Flux<Integer> createFromList() {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        return Flux.fromIterable(numbers);
    }

    /**
     * 2-3. Flux.range() - 범위 기반 Flux 생성
     * range(시작값, 개수)
     */
    public static Flux<Integer> createRange() {
        return Flux.range(1, 10);  // 1부터 10까지
    }

    /**
     * 2-4. Flux.interval() - 주기적으로 값을 방출
     * 실시간 스트리밍 시뮬레이션에 유용
     */
    public static Flux<Long> createInterval() {
        return Flux.interval(Duration.ofSeconds(1))
                .take(5);  // 5개만 가져오기
    }

    /**
     * 2-5. map() - 각 요소 변환
     */
    public static Flux<String> transformWithMap() {
        return Flux.just("apple", "banana", "cherry")
                .map(String::toUpperCase)
                .map(s -> "과일: " + s);
    }

    /**
     * 2-6. filter() - 조건에 맞는 요소만 통과
     */
    public static Flux<Integer> filterEvenNumbers() {
        return Flux.range(1, 10)
                .filter(num -> num % 2 == 0);  // 짝수만
    }

    /**
     * 2-7. flatMap() - 각 요소를 Flux로 변환 후 평탄화
     * 비동기 작업을 병렬로 처리할 때 사용
     */
    public static Flux<String> transformWithFlatMap() {
        return Flux.just("user1", "user2", "user3")
                .flatMap(userId -> fetchUserDetails(userId));
    }

    private static Flux<String> fetchUserDetails(String userId) {
        return Flux.just(
                userId + ": 이름",
                userId + ": 이메일",
                userId + ": 전화번호"
        ).delayElements(Duration.ofMillis(100));
    }

    /**
     * 2-8. concatMap() - flatMap과 유사하지만 순서 보장
     * flatMap은 순서가 섞일 수 있지만, concatMap은 순서를 유지
     */
    public static Flux<String> transformWithConcatMap() {
        return Flux.just("A", "B", "C")
                .concatMap(letter -> Flux.just(letter + "1", letter + "2")
                        .delayElements(Duration.ofMillis(100)));
    }

    /**
     * 2-9. take() / skip() - 요소 개수 제어
     */
    public static Flux<Integer> takeAndSkip() {
        return Flux.range(1, 10)
                .skip(3)   // 처음 3개 건너뛰기
                .take(4);  // 4개만 가져오기 (4, 5, 6, 7)
    }

    /**
     * 2-10. distinct() / distinctUntilChanged() - 중복 제거
     */
    public static Flux<Integer> removeDuplicates() {
        return Flux.just(1, 2, 2, 3, 3, 3, 4, 5, 5)
                .distinct();  // 중복 제거: 1, 2, 3, 4, 5
    }

    /**
     * 2-11. collectList() - Flux를 Mono<List>로 변환
     * 모든 요소를 수집하여 리스트로 만듦
     */
    public static void collectToList() {
        Flux.just("A", "B", "C")
                .collectList()
                .subscribe(list -> System.out.println("수집된 리스트: " + list));
    }

    /**
     * 2-12. zip() - 여러 Flux를 결합
     * 각 Flux에서 하나씩 가져와 튜플로 결합
     */
    public static Flux<String> zipExample() {
        Flux<String> names = Flux.just("홍길동", "김철수", "이영희");
        Flux<Integer> ages = Flux.just(25, 30, 28);
        
        return Flux.zip(names, ages)
                .map(tuple -> tuple.getT1() + " (" + tuple.getT2() + "세)");
    }

    /**
     * 2-13. merge() - 여러 Flux를 하나로 병합
     * zip과 달리 순서 상관없이 도착하는 대로 방출
     */
    public static Flux<String> mergeExample() {
        Flux<String> flux1 = Flux.just("A", "B").delayElements(Duration.ofMillis(100));
        Flux<String> flux2 = Flux.just("1", "2").delayElements(Duration.ofMillis(150));
        
        return Flux.merge(flux1, flux2);
    }

    /**
     * 2-14. buffer() - 요소를 그룹으로 묶기
     * 배치 처리에 유용
     */
    public static Flux<List<Integer>> bufferExample() {
        return Flux.range(1, 10)
                .buffer(3);  // 3개씩 묶기: [1,2,3], [4,5,6], [7,8,9], [10]
    }

    /**
     * 2-15. window() - Flux를 여러 Flux로 분할
     * buffer는 List로 묶지만, window는 Flux로 묶음
     */
    public static Flux<Flux<Integer>> windowExample() {
        return Flux.range(1, 10)
                .window(3);
    }

    /**
     * 2-16. 백프레셔(Back Pressure) 데모
     * 
     * 백프레셔는 소비자가 처리할 수 있는 만큼만 데이터를 요청하는 메커니즘
     * 이를 통해 시스템 과부하를 방지
     */
    public static void demonstrateBackPressure() {
        System.out.println("\n=== 백프레셔 데모 ===");
        
        Flux.range(1, 100)
                .doOnNext(num -> System.out.println("생성: " + num))
                .subscribe(
                        num -> {
                            System.out.println("  소비: " + num);
                            try {
                                Thread.sleep(100);  // 느린 소비자 시뮬레이션
                            } catch (InterruptedException e) {
                                e.printStackTrace();
                            }
                        }
                );
    }

    /**
     * 메인 메소드 - 모든 예제 실행
     */
    public static void main(String[] args) throws InterruptedException {
        System.out.println("\n📖 Chapter 2: Flux 기초 학습\n");

        // 2-1. 기본 Flux
        System.out.println("=== 2-1. 기본 Flux ===");
        createSimpleFlux().subscribe(System.out::println);

        // 2-2. 리스트에서 생성
        System.out.println("\n=== 2-2. 리스트에서 Flux 생성 ===");
        createFromList().subscribe(System.out::println);

        // 2-3. 범위
        System.out.println("\n=== 2-3. 범위 Flux ===");
        createRange().subscribe(System.out::println);

        // 2-5. map 변환
        System.out.println("\n=== 2-5. map 변환 ===");
        transformWithMap().subscribe(System.out::println);

        // 2-6. filter
        System.out.println("\n=== 2-6. 짝수 필터링 ===");
        filterEvenNumbers().subscribe(System.out::println);

        // 2-7. flatMap
        System.out.println("\n=== 2-7. flatMap (순서 보장 안됨) ===");
        transformWithFlatMap().subscribe(System.out::println);
        Thread.sleep(1000);

        // 2-8. concatMap
        System.out.println("\n=== 2-8. concatMap (순서 보장) ===");
        transformWithConcatMap().subscribe(System.out::println);
        Thread.sleep(1000);

        // 2-9. take/skip
        System.out.println("\n=== 2-9. take/skip ===");
        takeAndSkip().subscribe(System.out::println);

        // 2-10. distinct
        System.out.println("\n=== 2-10. 중복 제거 ===");
        removeDuplicates().subscribe(System.out::println);

        // 2-11. collectList
        System.out.println("\n=== 2-11. 리스트로 수집 ===");
        collectToList();

        // 2-12. zip
        System.out.println("\n=== 2-12. zip 결합 ===");
        zipExample().subscribe(System.out::println);

        // 2-13. merge
        System.out.println("\n=== 2-13. merge 병합 ===");
        mergeExample().subscribe(System.out::println);
        Thread.sleep(1000);

        // 2-14. buffer
        System.out.println("\n=== 2-14. buffer 그룹화 ===");
        bufferExample().subscribe(System.out::println);

        // 2-4. interval (마지막에 실행 - 시간이 걸림)
        System.out.println("\n=== 2-4. interval (5초 소요) ===");
        createInterval().subscribe(num -> System.out.println("Tick: " + num));
        Thread.sleep(6000);

        System.out.println("\n✅ Chapter 2 완료!\n");
    }
}
```
