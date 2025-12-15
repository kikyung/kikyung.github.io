---
title: "Spring WebFlux #3 - HTTP"
date: 2025-12-16T01:31:00.000+09:00
categories:
  - 개발
  - 스프링(WebFlux)
tags:
  - Spring
  - webflux
---
### 이번 글에서 다룰 내용

* 어노테이션 기반 WebFlux 컨트롤러의 기본 문법 숙지 
* 리액티브 타입(Mono/Flux)을 HTTP API에  적용
* ResponseEntity + 리액티브 조합으로 상태 코드 제어하는 패턴
* Server-Sent Events, 지연 응답으로 비동기, 스트리밍의 예시
* WebTestClient로 엔드포인트를 통합 테스트

### Flux/Mono로 CRUD 예시

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private String id;
    private String name;
    private Integer price;
    
    // ...
}

@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
}


// 단순 문자열 응답
@GetMapping("/hello")
public Mono<String> hello() {
    return Mono.just("Hello, WebFlux with @RestController!");
}

// PathVariable
@GetMapping("/greet/{name}")
public Mono<String> greet(@PathVariable String name) {
    return Mono.just("안녕하세요, " + name + "님!");
}

// RequestParam
@GetMapping("/search")
public Mono<String> search(@RequestParam String keyword) {
    return Mono.just("검색어: " + keyword);
}

/** CRUD 예시 */
private final Map<String, Product> productStore = new ConcurrentHashMap<>();

// 전체 조회 (Flux)
@GetMapping("/products")
public Flux<Product> getAllProducts() {
    return Flux.fromIterable(productStore.values());
}

// 단일 조회 (Mono)
@GetMapping("/products/{id}")
public Mono<Product> getProduct(@PathVariable String id) {
    return Mono.justOrEmpty(productStore.get(id));
}

// 생성 (POST)
@PostMapping("/products")
public Mono<Product> createProduct(@RequestBody Product product) {
    return Mono.just(product)
            .doOnNext(p -> productStore.create(p));
}

// 수정 (PUT)
@PutMapping("/products/{id}")
public Mono<Product> updateProduct(@PathVariable String id,
                                   @RequestBody Product product) {
    return Mono.justOrEmpty(productStore.get(id))
            .flatMap(existing -> {
                product.setId(id);
                productStore.put(id, product);
                return Mono.just(product);
            })
            .switchIfEmpty(Mono.error(new RuntimeException("상품을 찾을 수 없습니다: " + id)));
}

// 삭제 (DELETE)
@DeleteMapping("/products/{id}")
public Mono<Void> deleteProduct(@PathVariable String id) {
    return Mono.fromRunnable(() -> productStore.remove(id));
}

// HttpStatus 코드 제어
// 값이 있으면 200 OK, 없으면 404 Not Found
@GetMapping("/products-with-status/{id}")
public Mono<ResponseEntity<Product>> getProductWithStatus(@PathVariable String id) {
    return Mono.justOrEmpty(productStore.get(id))
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
}

// 스트리밍: 1초마다 문자열을 계속 push하는 스트림 응답
@GetMapping(value = "/stream", produces = "text/event-stream")
public Flux<String> streamData() {
    return Flux.interval(Duration.ofSeconds(1))
            .map(seq -> "데이터 #" + seq + " - " + System.currentTimeMillis());
}

// 지연응답: 스레드 블로킹 없이 2초 뒤 응답, 비동기 처리의 느낌
@GetMapping("/delayed")
public Mono<String> delayedResponse() {
    return Mono.just("2초 후 응답")
            .delayElement(Duration.ofSeconds(2));
}

// 의도적 에러 발생
@GetMapping("/error")
public Mono<String> errorExample() {
    return Mono.error(new RuntimeException("의도적인 에러!"))
            .cast(String.class);
}

// 전역 예외 처리기
@ExceptionHandler(RuntimeException.class)
public Mono<ResponseEntity<ErrorResponse>> handleException(RuntimeException ex) {
    ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            ex.getMessage()
    );
    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error));
}
```

### Tests

```java
@Autowired
private WebTestClient webTestClient;

// GET + 문자열 응답 검증
@Test
void testHelloEndpoint() {
    webTestClient.get()
            .uri("/hello")
            .exchange()
            .expectStatus().isOk()
            .expectBody(String.class)
            .isEqualTo("Hello, WebFlux with @RestController!");
}

// PathVariable
@Test
void testGreetEndpoint() {
    webTestClient.get()
            .uri("/greet/기경")
            .exchange()
            .expectStatus().isOk()
            .expectBody(String.class)
            .isEqualTo("안녕하세요, 기경님!");
}

// RequestParam
@Test
void testSearchEndpoint() {
    webTestClient.get()
            .uri("/search?keyword=맥북")
            .exchange()
            .expectStatus().isOk()
            .expectBody(String.class)
            .isEqualTo("검색어: 맥북");
}

// Flux 응답 리스트 검증
@Test
void testGetAllProducts() {
    webTestClient.get()
            .uri("/products")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(Product.class)
            .hasSize(3);
}

@Test
void testCreateProduct() {
    Product newProduct = new Product("4", "모니터", 300000);

    webTestClient.post()
            .uri("/products")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(newProduct)
            .exchange()
            .expectStatus().isOk()
            .expectBody(Product.class)
            .value(product -> {
                assert product.getId().equals("4");
            });
}
```
