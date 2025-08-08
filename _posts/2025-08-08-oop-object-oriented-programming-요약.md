---
title: OOP(Object-Oriented Programming) 요약
date: 2025-08-08T23:31:00.000+09:00
categories:
  - Programming
tags:
  - OOP
  - Java
---
# 객체지향 프로그래밍

* 프로그램을 **현실 세계처럼 객체중심**으로 만들어요.
* 객체는 `속성(정보)`과 `행동(기능)`을 가지고 있어요!

## 1. 클래스(Class)와 객체(Object)

### 📦 클래스 란?

* **설계도** 예요!

  ```java
  // 예: "자동차"라는 설계도
  public class Car {
      String color;     // 속성
      int speed;
      void drive() {    // 행동
          System.out.println("부릉부릉! 주행 중 🚗");
      }
  }
  ```

### 🚗 객체 란?

* 클래스를 바탕으로 만들어진 **실제 물건** 이에요!

  ```java
  public class Main {
      public static void main(String[] args) {
          Car myCar = new Car();  // Car 객체 만들기
          myCar.color = "Red";
          myCar.speed = 100;
          myCar.drive();          // 행동 실행
      }
  }
  ```

- - -

## 2. 캡슐화 (Encapsulation)

* 데이터(속성)를 **숨기고**, **메서드로만 다루게 해요.**
* 데이터 보호와 실수 방지를 위한 기능이에요.

  ```java
  public class Student {
    private String name;

    public void setName(String newName) {
        name = newName;
    }

    public String getName() {
        return name;
    }
  }
  ```

- - -

## 3. 상속(Inheritance)

* **부모 클래스의 특징을 자식 클래스가 물려받는 것**이에요.

  ```java
  public class Animal {
      void sound() {
          System.out.println("동물이 소리를 낸다");
      }
  }

  public class Dog extends Animal {
      void bark() {
          System.out.println("멍멍!");
      }
  }

  public class Cat extends Animal {
      void yaOng() {
          System.out.println("냐옹!");
      }
  }
  ```

  ```java
  public class Main {
      public static void main(String[] args) {
          Dog dog = new Dog();
          dog.sound();  // 부모 메서드 사용
          dog.bark();   // 자식 메서드 사용

          Cat cat = new Cat();
          cat.sound();
          cat.yaOng();
      }
  }
  ```

- - -

## 🎭 4. 다형성(Polymorphism)

> 여러 가지(Poly) 형태(Morph) 라는 뜻

* **하나의 메서드가 여러 클래스에서 다르게 동작**할 수 있어요!

  ```java
  class Animal {
      void sound() {
          System.out.println("동물 소리");
      }
  }

  class Cat extends Animal {
      void sound() {
          System.out.println("야옹!");
      }
  }

  class Cow extends Animal {
      void sound() {
          System.out.println("음메~");
      }
  }
  ```

  ```java
  public class Main {
      public static void main(String[] args) {
          Animal a1 = new Cat();
          Animal a2 = new Cow();

          a1.sound();  // 야옹!
          a2.sound();  // 음메~
      }
  }
  ```

## 💡 정리 요약

| 개념  | 뜻               | 예시                         |
| --- | --------------- | -------------------------- |
| 클래스 | 설계도             | Car, Animal 등              |
| 객체  | 클래스로 만든 실제 물건   | new Car(), new Dog() 등     |
| 캡슐화 | 속성은 숨기고 메서드로 조작 | `private`, `get`, `set` 사용 |
| 상속  | 부모 기능을 자식이 물려받음 | `extends` 키워드              |
| 다형성 | 같은 메서드, 다른 행동   | `sound()`가 동물마다 다르게 작동     |
