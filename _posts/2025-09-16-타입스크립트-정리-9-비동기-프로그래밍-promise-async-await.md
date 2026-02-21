---
slug: "20250916-2"
redirect_from:
  - "/posts/2025/09/타입스크립트-정리-9-비동기-프로그래밍-promise-async-await/"
title: "타입스크립트 정리 #9 - 비동기 프로그래밍(Promise, async, await)"
date: 2025-09-16T22:17:00.000+09:00
categories:
  - 개발
  - TS
tags:
  - typescript
  - async
---
## 1. Promise: 약속!

> Promise는 한마디로 **"미래의 어떤 시점에 결과를 돌려주겠다"**는 약속입니다. 비동기 작업의 최종 완료 또는 실패 상태를 나타내는 객체입니다.



##### Promise는 다음 세 가지 상태 중 하나를 가집니다.

* 대기(Pending): 비동기 작업이 아직 완료되지 않은 초기 상태.
* 이행(Fulfilled): 작업이 성공적으로 완료된 상태. 결과 값을 반환합니다.
* 거부(Rejected): 작업이 실패한 상태. 에러를 반환합니다.

```typescript
const fetchWithPromise = (isSuccess: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isSuccess) {
        // 성공 시 resolve 호출
        resolve("데이터를 성공적으로 가져왔습니다.");
      } else {
        // 실패 시 reject 호출
        reject(new Error("데이터를 가져오는 데 실패했습니다."));
      }
    }, 1000);
  });
};

fetchWithPromise(true)
  .then((message) => {
    // resolve가 호출될 때 실행
    console.log("성공:", message);
  })
  .catch((error) => {
    // reject가 호출될 때 실행
    console.log("실패:", error.message);
  });
```

`then`은 Promise가 성공했을 때의 로직을, `catch`는 실패했을 때의 로직을 처리합니다. 
이처럼 `Promise`를 사용하면 비동기 **작업의 성공과 실패를 명확하게 분리**하여 처리할 수 있습니다.

## 2. async & await: Promise를 더 쉽게 쓰는 방법

> async와 await는 Promise를 기반으로 동작하며, 마치 동기 코드처럼 비동기 코드를 작성할 수 있게 해주는 문법적 설탕(Syntactic Sugar)입니다.

* **async**: 함수 앞에 붙여서 해당 함수가 비동기 함수임을 선언합니다. async 함수는 **항상 Promise를 반환**합니다.
* **await**: async 함수 안에서만 사용 가능하며, Promise가 **이행(fulfilled)**될 때까지 기다렸다가 결과 값을 반환합니다. Promise가 거부(rejected)되면 에러를 던집니다.

```typescript
const fetchUserData = (userId: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`User ${userId} data`);
    }, 1000);
  });
};

const processUserData = async () => {
  console.log("데이터를 가져오는 중...");
  try {
    // await는 fetchUserData Promise가 완료될 때까지 기다림
    const userData = await fetchUserData(1);
    console.log("작업 완료:", userData);

    // 여러 개의 비동기 작업을 순차적으로 처리
    const user2Data = await fetchUserData(2);
    console.log("작업 완료:", user2Data);
    
  } catch (error) {
    // 에러 발생 시 catch 블록으로 이동
    console.error("오류 발생:", error);
  }
};

processUserData();
```

`await` 키워드 덕분에 `fetchUserData`가 끝날 때까지 기다린 후 다음 코드인 `console.log`가 실행됩니다. `try...catch` 블록으로 에러를 깔끔하게 처리할 수 있습니다.

## 개념정리

> **Promise, async, await**는 비동기 프로그래밍을 더 직관적이고 가독성 좋게 만들어주는 강력한 도구입니다. 
> 복잡한 비동기 코드를 작성해야 할 때 이 개념들을 활용하면 콜백 지옥(Callback Hell)과 같은 문제를 피하고, 유지보수가 쉬운 코드를 작성할 수 있습니다.

| **키워드** | **역할**                                                 |
| ------- | ------------------------------------------------------ |
| Promise | 비동기 작업의 상태와 결과(성공/실패)를 나타내는 객체. 비동기 작업의 본질적인 **약속** 역할 |
| async   | 함수가 비동기 함수임을 선언하는 키워드. 이 함수는 항상 Promise를 반환            |
| await   | async 함수 내에서 Promise의 결과를 기다리는 키워드. 동기적으로 읽음           |
