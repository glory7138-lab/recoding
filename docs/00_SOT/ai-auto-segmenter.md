# AI 기반 음성-자막 자동 타임스탬프 생성 모듈 (Auto-Segmenter) 기획안

본 문서는 NativeBOX Publisher Pro 시스템의 수동 타임스탬프 입력 작업을 자동화하기 위한 **AI 기반 음성-자막 생성 모듈**의 아키텍처 및 로드맵입니다.

## 1. 추천 기술 스택 및 구조 설계

### 기술 스택 비교 (Whisper API vs 로컬 오픈소스 모델)
| 구분 | OpenAI Whisper API | WhisperX (오픈소스 로컬 모델) ⭐선택됨 |
| :--- | :--- | :--- |
| **타임스탬프 정밀도** | 문장 단위 (단어 단위 불확실, 밀림 현상 존재) | **단어 단위 정밀 매칭 (Forced Alignment 활용)** |
| **화자 분리(Diarization)** | 미지원 | 지원 (Speaker A, Speaker B 구분 가능) |
| **비용** | 초당 과금 (유료) | 무료 (GPU 서버 구축 비용만 발생) |
| **속도** | API 응답 대기 | VRAM 기반 배치 처리로 매우 빠름 (API보다 최대 70배) |
| **보안/오프라인** | 외부 서버 전송 | 로컬/폐쇄망 처리 가능 |

### 최종 결정 구조 (Python 기반 백엔드 + WhisperX)
어학용 구간 반복을 위해서는 "단어/문장 단위의 아주 정확한 시작/종료 시간"이 필수적입니다. 따라서 음소 단위 정렬(Forced Alignment)을 지원하는 **WhisperX** 프레임워크를 표준으로 채택합니다.

- **AI STT 엔진**: Python + `whisperX` (faster-whisper + Wav2Vec2 정렬)
- **VAD (음성 활성 감지)**: `silero-vad` (묵음 구간 제거 및 정확한 문장 분할)
- **백엔드 프레임워크**: `FastAPI` (동영상 업로드 시 JSON 형태로 타임스탬프 및 텍스트 반환)

---

## 2. 문장 단위 타임스탬프 오차 최소화 (싱크 정렬) 알고리즘

어학용 플레이어에서 타임스탬프 오차를 줄이기 위해 다음 4단계 파이프라인을 적용합니다.

1. **VAD (Voice Activity Detection)**:
   오디오에서 사람이 실제로 말하는 구간만 잘라냅니다. 묵음(Silence) 구간이 STT에 들어가면 타임스탬프가 밀리는 할루시네이션(환각) 현상을 차단합니다.
2. **STT (Speech-to-Text)**:
   VAD로 잘린 오디오 청크를 Whisper 모델에 넣어 텍스트를 추출합니다.
3. **Forced Alignment (강제 정렬 - 핵심)**:
   추출된 텍스트와 원본 오디오를 Wav2Vec2 음향 모델에 다시 넣어, **각 단어별 정확한 밀리초(ms) 단위의 시작/종료 시간**을 매핑합니다.
4. **Sentence Chunking (문장 병합 알고리즘)**:
   단어 단위로 추출된 데이터를 바탕으로 구두점(`.`, `?`, `!`)과 일정 길이 이상의 묵음(예: 0.5초 이상)을 기준으로 자연스러운 한 문장으로 병합(Merge)합니다.

---

## 3. Python 기반 PoC 핵심 코드 예시 (WhisperX 활용)

오디오에서 `[시작시간, 종료시간, 텍스트]`를 추출하는 파이썬 코드 기준입니다.

```python
import whisperx
import json

def process_audio_to_timestamps(audio_file_path, language="en"):
    device = "cuda" # GPU 사용 권장
    batch_size = 16 
    compute_type = "float16"

    # 1. 오디오 로드
    audio = whisperx.load_audio(audio_file_path)

    # 2. Whisper 모델 로드 및 STT 수행 (VAD 자동 적용)
    model = whisperx.load_model("large-v2", device, compute_type=compute_type)
    result = model.transcribe(audio, batch_size=batch_size, language=language)

    # 3. Forced Alignment (음소 단위 강제 정렬)
    model_a, metadata = whisperx.load_align_model(language_code=language, device=device)
    aligned_result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    # 4. NativeBOX 포맷으로 변환
    nativebox_segments = []
    for idx, segment in enumerate(aligned_result["segments"]):
        nativebox_segments.append({
            "id": idx + 1,
            "start": round(segment["start"], 3),
            "end": round(segment["end"], 3),
            "text": segment["text"].strip(),
            "translation": "" # 번역 API 별도 연동
        })

    return json.dumps(nativebox_segments, indent=2, ensure_ascii=False)
```

---

## 4. 단계별 개발 로드맵

총 예상 공수: **약 4~5주** (1 M/M)

- **1단계: PoC 및 AI 파이프라인 검증 (1주)**
  - WhisperX 기반 로컬 Python 환경 세팅 및 GPU 연동, 문장 병합 알고리즘 개발
- **2단계: 백엔드 API 서비스 개발 (1주)**
  - FastAPI 구축, 딥플(DeepL)/OpenAI 번역 연동 및 비동기 워커 설계
- **3단계: NativeBOX Publisher Pro 연동 (1.5주)**
  - JSON ↔ `.nbc` 규격 파서 개발, Publisher Pro UI 자동 분석 연동 및 검수 에디터 연결
- **4단계: 다국어 확장 및 배포/안정화 (1주)**
  - 한국어, 태국어 등 Forced Alignment 모델 추가, 예외 케이스 처리 및 Docker 배포
