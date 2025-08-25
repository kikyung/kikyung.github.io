---
title: "타입스크립트 정리 #3 - 일등함수(First-Class Function)"
date: 2025-08-26T01:05:00.000+09:00
categories:
  - 개발
  - TS
tags:
  - typescript
---
## 일등함수란?

> **함수**를 **값**처럼 취급하여 자유롭게 다룰 수 있는개념 입니다. 이는 함수를 변수에 담거나, 다른 함수의 인자로 전달하고, 반환 값으로 사용할 수 있다는 의미입니다.\
> 어제 클로저 글을 올렸는데 일등함수 부터 개념이해후 클로저를 이해하시면 더욱 좋습니다.

## 예시 (결재완료 > 푸시발송)

### 1. Java(Spring)

```java
// PaymentService 클래스 내부에 정의된 메서드
public void processPayment() {
    // 결제 로직...
    sendPushNotification(); // 특정 메서드 직접 호출
}

private void sendPushNotification() {
    // 푸시 알림 전송 로직
}
```

* processPayment 에 강하게 결합됩니다.

### 2. TypeScript

```typescript
// 1. 알림을 보내는 '함수'를 정의합니다.
const sendPushNotification = (message: string) => {
  console.log(`푸시 알림 전송: ${message}`);
};

// 2. '결제 처리'를 담당하는 함수를 정의합니다.
//    이 함수는 '알림 기능'을 인자로 받습니다.
function processPayment(paymentAmount: number, notifyFunction: (msg: string) => void) {
  console.log(`${paymentAmount}원 결제 처리 중...`);
  // 3. 전달받은 '알림 함수'를 실행합니다.
  notifyFunction("결제가 성공적으로 완료되었습니다.");
}

// 4. 결제 함수를 호출하며, 알림 함수를 '주입'합니다.
processPayment(50000, sendPushNotification);
```

* Spring의 DI 와 유사한 효과를 냅니다.

  * `processPayment` 함수는 알림 기능이 어떤 방식으로 구현되었는지 알 필요가 없습니다. 그저 `notifyFunction`이라는 이름의 **함수**가 필요하다고 선언하고, 외부에서 이 함수를 **주입** 받아 사용합니다.
  * 푸시 알림 대신 이메일 알림을 추가하고 싶다면, `sendEmailNotification` 함수만 만들어서 `processPayment`에 전달해주면 됩니다.
  * 결제 로직과 알림 로직이 **느슨하게 결합**됩니다.
