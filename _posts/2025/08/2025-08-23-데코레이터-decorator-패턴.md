---
title: 데코레이터(Decorator) 패턴
date: 2025-08-24T00:05:00.000+09:00
categories:
  - 개발
  - 디자인패턴
tags:
  - 디자인패턴
---
## **데코레이터 패턴이란?**

> 객체에 **동적으로 새로운 기능을 추가**할 수 있게 해주는 패턴입니다. \
> 기존 객체의 구조를 변경하지 않고도, 객체의 기능을 확장할 수 있다는 점이 가장 큰 특징\
> 말 그대로, '장식(decorate)'을 하듯 원래 객체에 새로운 기능을 덧붙이는 거예요.

## **커피 전문점예시**

![Decorator Pattern](/assets/img/uploads/design_pattern_decorator.png)

1. **기본 객체(Component)**

   * 가장 기본적인 **아메리카노**가 있어요. 이게 바로 데코레이션을 할 대상, 즉 기본 객체입니다.

     * `아메리카노 = 4,000원`
2. **데코레이터(Decorator)**

   * 여기에 **우유**, **시럽**, **휘핑크림** 같은 토핑을 추가할 수 있어요. 각각의 토핑이 바로 **데코레이터**예요.

     * `우유 추가 = 500원`
     * `시럽 추가 = 300원`
     * `휘핑크림 추가 = 700원`

고객이 **아메리카노에 우유와 시럽을 추가**하고 싶다면 어떻게 될까요?

* 먼저 **아메리카노**를 준비해요.
* 여기에 **우유 데코레이터**를 덧씌워요. `아메리카노 + 우유`가 되죠.
* 다시 여기에 **시럽 데코레이터**를 덧씌워요. `(아메리카노 + 우유) + 시럽`이 됩니다.

이렇게 **데코레이터는 다른 데코레이터나 기본 객체를 감싸는(wrapping)** 구조를 가집니다.

* 최종 가격은 기본 아메리카노 가격에 추가된 토핑 가격을 더해서 계산해요.
* `4,000원(아메리카노) + 500원(우유) + 300원(시럽) = 총 4,800원`

데코레이터 패턴은 이처럼 **새로운 기능을 더할 때마다 새로운 클래스를 만들 필요 없이**, 기존 객체를 감싸는 데코레이터 클래스를 추가하는 방식으로 기능을 확장합니다.

- - -

## 데코레이터 패턴의 핵심 구조

데코레이터 패턴의 핵심은 세 가지 역할로 나눌 수 있어요.

1. **컴포넌트(Component)**

   1. 데코레이션의 대상이 되는 기본 기능들의 공통 인터페이스입니다. 
   2. 예: `음료` 인터페이스
2. **구체적인 컴포넌트(Concrete Component)**

   1. 기본 기능을 구현하는 클래스입니다. 
   2. 예: `아메리카노` 클래스
3. **데코레이터(Decorator)**

   1. 컴포넌트와 동일한 인터페이스를 가지며, 새로운 기능을 추가하는 역할을 합니다. 
   2. 항상 다른 **컴포넌트 객체**를 참조합니다. 

      1. 예: `우유` 데코레이터, `시럽` 데코레이터

## 예시 코드

**1. 컴포넌트 인터페이스: 음료**

```java
// 모든 음료의 공통 인터페이스
public interface Beverage {
    String getName(); // 음료 이름
    int getCost();    // 음료 가격
}
```

**2. 구체적인 컴포넌트: 아메리카노**

```java
// 기본 음료인 아메리카노 클래스
public class Americano implements Beverage {

    @Override
    public String getName() {
        return "아메리카노";
    }

    @Override
    public int getCost() {
        return 4000;
    }
}
```

**3. 데코레이터 추상 클래스: 토핑**

```java
// 모든 데코레이터(토핑)의 부모 클래스. Beverage 인터페이스를 구현합니다.
public abstract class ToppingDecorator implements Beverage {
    // 감쌀 Beverage 객체를 참조합니다.
    protected Beverage beverage;

    public ToppingDecorator(Beverage beverage) {
        this.beverage = beverage;
    }
}
```

**4. 구체적인 데코레이터: 우유, 시럽**

```java
// 우유 토핑 데코레이터
public class Milk extends ToppingDecorator {
    public Milk(Beverage beverage) {
        super(beverage);
    }

    @Override
    public String getName() {
        // 기존 이름에 새로운 이름 추가
        return beverage.getName() + " + 우유";
    }

    @Override
    public int getCost() {
        // 기존 가격에 새로운 가격 추가
        return beverage.getCost() + 500;
    }
}

// 시럽 토핑 데코레이터
public class Syrup extends ToppingDecorator {
    public Syrup(Beverage beverage) {
        super(beverage);
    }

    @Override
    public String getName() {
        return beverage.getName() + " + 시럽";
    }

    @Override
    public int getCost() {
        return beverage.getCost() + 300;
    }
}
```

**5. 사용 예시**

```java
public class Cafe {
    public static void main(String[] args) {
        // 1. 아메리카노 기본 객체 생성
        Beverage americano = new Americano();
        System.out.println("주문: " + americano.getName() + ", 가격: " + americano.getCost() + "원");

        // 2. 우유 토핑을 추가
        Beverage americanoWithMilk = new Milk(americano);
        System.out.println("주문: " + americanoWithMilk.getName() + ", 가격: " + americanoWithMilk.getCost() + "원");

        // 3. 우유가 추가된 커피에 시럽 토핑을 추가
        Beverage americanoWithMilkAndSyrup = new Syrup(americanoWithMilk);
        System.out.println("주문: " + americanoWithMilkAndSyrup.getName() + ", 가격: " + americanoWithMilkAndSyrup.getCost() + "원");
    }
}
```

**실행 결과:**

* `주문: 아메리카노, 가격: 4000원`
* `주문: 아메리카노 + 우유, 가격: 4500원`
* ` 주문: 아메리카노 + 우유 + 시럽, 가격: 4800원`

핵심은 보시는 것처럼, **기존의 `Americano` 클래스는 그대로 두고** `Milk`와 `Syrup`이라는 새로운 클래스를 추가해서 기능을 확장한 부분을 중점적으로 봐주시면 됩니다!
