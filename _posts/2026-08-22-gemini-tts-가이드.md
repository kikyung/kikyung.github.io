---
title: Gemini TTS 활용 정리
date: 2026-08-22T23:00:00.000+09:00
categories:
  - 개발·기술
tags:
  - AI
  - TTS
  - Gemini
  - "2026"
---

<div class="note note-tip">
  <span class="note-title">한 줄 요약</span>
  ElevenLabs 대비 Gemini가 자연어로 톤,감정 조절에 강점이 있습니다.
</div>

## 개요

간혹 텍스트 씹히거나 생성 에러 나는 경우도 있지만, gemini-tts 만의 강점을 확실히 체감했습니다.  
샘플로 하나하나 확인해보면 많은 도움이 됩니다.

---

## 사용 가능한 모델

| 모델명 | 단일 화자 | 다중 화자 | 스트리밍 |
|--------|:---------:|:---------:|:--------:|
| `gemini-3.1-flash-tts-preview` | ✅ | ✅ | ✅ |
| `gemini-2.5-flash-preview-tts` | ✅ | ✅ | ❌ |
| `gemini-2.5-pro-preview-tts` | ✅ | ✅ | ❌ |

- 컨텍스트 윈도우: 32k 토큰

---
## 보이스 목록 (30개)

자주 쓰는 것 위주로 기억해두면 편할것 같습니다.  
샘플 음성은 [AI Studio](https://aistudio.google.com)에서 직접 들어볼 수 있습니다.

| 보이스 | 톤/분위기 | 보이스 | 톤/분위기 |
|--------|----------|--------|----------|
| **Zephyr** | 밝고 화사한 | **Puck** | 경쾌하고 활기찬 |
| **Charon** | 정보 전달에 적합한, 또박또박 | **Kore** | 단단하고 차분한 |
| **Fenrir** | 들뜬, 흥분한 | **Leda** | 젊고 발랄한 |
| **Orus** | 단단하고 진중한 | **Aoede** | 상쾌하고 가벼운 |
| **Callirrhoe** | 느긋하고 여유로운 | **Autonoe** | 밝고 명랑한 |
| **Enceladus** | 숨결 섞인 부드러운 | **Iapetus** | 선명하고 깨끗한 |
| **Umbriel** | 느긋하고 편안한 | **Algieba** | 부드럽고 매끄러운 |
| **Despina** | 매끄럽고 유려한 | **Erinome** | 또렷하고 명확한 |
| **Algenib** | 걸걸하고 낮은 | **Rasalgethi** | 정보 전달형, 차분한 |
| **Laomedeia** | 밝고 경쾌한 | **Achernar** | 부드럽고 조용한 |
| **Alnilam** | 단호하고 힘있는 | **Schedar** | 균형 잡힌, 안정적인 |
| **Gacrux** | 성숙하고 무게감 있는 | **Pulcherrima** | 앞으로 나서는, 적극적인 |
| **Achird** | 친근하고 다정한 | **Zubenelgenubi** | 캐주얼하고 편한 |
| **Vindemiatrix** | 부드럽고 온화한 | **Sadachbia** | 생기 있고 활발한 |
| **Sadaltager** | 지적이고 신뢰감 있는 | **Sulafat** | 따뜻하고 포근한 |

### 용도별 추천 조합

- 팟캐스트/대화형: Kore + Puck (단단한 + 경쾌한 조합)
- 내레이션: Charon, Rasalgethi (정보 전달형)
- 밝고 친근한: Zephyr, Achird, Sadachbia
- 차분하고 부드러운: Achernar, Vindemiatrix, Sulafat
- 성숙한 느낌: Gacrux, Schedar

---

## 비용

### 모델별 가격 (1백만 토큰당)

| 모델 | Input | Output | Batch API Input | Batch API Output |
|------|-------|--------|-----------------|------------------|
| `gemini-3.1-flash-tts-preview` | $1.00 | $20.00 | $0.50 | $10.00 |
| `gemini-2.5-flash-preview-tts` | $0.50 | $10.00 | $0.25 | $5.00 |
| `gemini-2.5-pro-preview-tts` | $1.00 | $20.00 | $0.50 | $10.00 |

### 토큰 계산법

- **오디오 토큰**: 1초당 25토큰
- 예: 1분 오디오 = 1,500 토큰

### 실제 비용 체감

**10분 오디오 생성 시:**
- 오디오 토큰: 10분 × 60초 × 25토큰 = 15,000 토큰
- 2.5 Flash 기준: 15,000 / 1,000,000 × $10 = $0.15
- 3.1 Flash 기준: 15,000 / 1,000,000 × $20 = $0.30

**Free Tier 있음** — 모든 TTS 모델에서 무료 할당량 제공됩니다. 테스트용으로는 충분.

---

## 기본 사용법

### 단일 화자

```python
from google import genai
import wave
import base64

def wave_file(filename, pcm, channels=1, rate=24000, sample_width=2):
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm)

client = genai.Client()

interaction = client.interactions.create(
    model="gemini-3.1-flash-tts-preview",
    input="오늘 저녁은 무엇을 먹을까?",
    response_format={"type": "audio"},
    generation_config={
        "speech_config": [
            {"voice": "Kore"}
        ]
    }
)

wave_file('out.wav', base64.b64decode(interaction.output_audio.data))
```

### 다중 화자 (최대 2명)

```python
prompt = """다음 대화를 TTS로 변환해줘. 화자는 아빠와 아들이야:
아빠: 오늘 뭐 먹을까?
아들: 중화요리! 짜장면, 탕수육?
아빠: 짬뽕도 먹을까?
아들: 좋아요~"""

interaction = client.interactions.create(
    model="gemini-3.1-flash-tts-preview",
    input=prompt,
    response_format={"type": "audio"},
    generation_config={
        "speech_config": [
            {"speaker": "아빠", "voice": "Kore"},
            {"speaker": "아들", "voice": "Puck"}
        ]
    }
)
```

**주의**: 프롬프트에서 쓴 화자 이름(`아빠`, `아들`)과 `speech_config`의 `speaker` 값이 일치해야 합니다.

### 스트리밍

```python
stream = client.interactions.create(
    model="gemini-3.1-flash-tts-preview",
    input="[excited] 오늘 중화요리먹었으니 내일은 고기먹을까?",
    response_format={"type": "audio"},
    generation_config={
        "speech_config": [{"voice": "Kore"}]
    },
    stream=True
)

for event in stream:
    if event.event_type == "step.delta":
        if event.delta.type == "audio":
            audio_data = base64.b64decode(event.delta.data)
            # 오디오 청크 처리
```

## 오디오 출력 포맷

| 항목 | 값 |
|------|-----|
| 포맷 | PCM (raw audio) |
| 샘플 레이트 | 24000 Hz |
| 채널 | 1 (모노) |
| 비트 깊이 | 16-bit |

WAV 파일로 저장할 때 위 값들 맞춰주면 됩니다.

---

## 프롬프트로 스타일 조절하기

Gemini TTS의 장점이 이 부분인 것 같습니다.  
기존 TTS처럼 SSML 태그 사용하는 게 아닌 자연어로 편하게 지정가능한 부분이 활용도가 좋습니다.

### 오디오 태그 (인라인 수정자)

- [whispers] 비밀인데요...
- [shouting] 이거 진짜 대박이에요!
- [sarcastically] 오, 정말 대단하시네요.
- [excitedly] 드디어 완성했어요!
- [tired] 오늘 너무 힘들었어요...

**자주 쓰는 태그:**

| 감정 | | 행동 | | 속도 | |
|------|------|------|------|------|------|
| `[amazed]` | 놀란 | `[sighs]` | 한숨 | `[very fast]` | 아주 빠르게 |
| `[excited]` | 신난 | `[laughs]` | 웃음 | `[very slow]` | 아주 느리게 |
| `[curious]` | 궁금한 | `[gasp]` | 헉 (놀람) | `[one word at a time]` | 한 단어씩 |
| `[panicked]` | 당황한 | `[cough]` | 기침 | | |
| `[sarcastic]` | 비꼬는 | `[giggles]` | 킥킥 웃음 | | |

**팁**: 오디오 태그는 영어로 사용해야 명확하게 지정됩니다.

### 상세 프롬프트 구조

복잡한 연출이 필요할 때 이런 구조도 사용가능 하다고 합니다. (예시 인용)

```
# AUDIO PROFILE: [캐릭터 이름]
## "[역할/아키타입]"

## THE SCENE: [장소]
[장면 설명 - 환경, 분위기, 상황]

### DIRECTOR'S NOTES
Style: [스타일 설명]
Pace: [속도 및 리듬]
Accent: [악센트/억양]

### SAMPLE CONTEXT
[맥락 설명]

#### TRANSCRIPT
[실제 읽을 텍스트]
```

예시:
```
# AUDIO PROFILE: 진수
## "테크 유튜버"

## THE SCENE: 홈 스튜디오
조용한 방, 모니터 불빛만 켜진 밤 11시. 편안한 분위기.

### DIRECTOR'S NOTES
Style: 차분하지만 열정적인 개발자. 기술 설명할 때 약간 신나는 느낌.
Pace: 중간 속도, 중요한 부분에서 살짝 느려짐
Accent: 서울 표준어

#### TRANSCRIPT
[excited] 자, 오늘은 Gemini TTS API를 직접 써봤는데요. 
[impressed] 솔직히 이 정도일 줄은 몰랐습니다.
```

---

## 제약 사항

| 항목 | 내용 |
|------|------|
| 컨텍스트 윈도우 | 32k 토큰 |
| 최대 화자 수 | 2명 |
| 입력 | 텍스트만 (이미지, 오디오 입력 안 됨) |
| 긴 출력 | 수 분 이상 되면 품질/일관성 저하될 수 있다고 합니다. (청크단위 권장)|

---

## 참고 링크

- [Gemini TTS 공식 문서](https://ai.google.dev/gemini-api/docs/speech-generation)
- [AI Studio에서 보이스 미리듣기](https://aistudio.google.com)
- [Gemini Cookbook TTS 예제](https://github.com/google-gemini/cookbook)


