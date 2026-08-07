// app/workers/whisper.worker.js
// Web Worker for Whisper speech recognition using Next.js Webpack bundling
import { pipeline, env } from '@xenova/transformers';

// Disable checking for remote models after initial download to speed up loading
env.allowLocalModels = false;

let transcriber = null;

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  if (type === 'LOAD_MODEL') {
    try {
      const { modelSize } = payload;
      const modelMap = {
        tiny: 'Xenova/whisper-tiny',
        small: 'Xenova/whisper-small',
        medium: 'Xenova/whisper-medium',
      };
      const modelId = modelMap[modelSize] || 'Xenova/whisper-small';

      self.postMessage({ type: 'PROGRESS', message: `🤖 Whisper ${modelSize} 모델 로딩 중... (최초 실행 시 자동 다운로드됩니다)`, progress: 5 });

      transcriber = await pipeline('automatic-speech-recognition', modelId, {
        quantized: true,
        progress_callback: (progressInfo) => {
          if (progressInfo.status === 'downloading') {
            const pct = Math.round((progressInfo.loaded / (progressInfo.total || 1)) * 40);
            self.postMessage({
              type: 'PROGRESS',
              message: `📥 모델 다운로드 중: ${progressInfo.file} (${Math.round((progressInfo.loaded || 0) / 1024 / 1024)}MB / ${Math.round((progressInfo.total || 0) / 1024 / 1024)}MB)`,
              progress: 5 + pct
            });
          } else if (progressInfo.status === 'loading') {
            self.postMessage({ type: 'PROGRESS', message: `⚙️ 모델 초기화 중...`, progress: 50 });
          }
        }
      });

      self.postMessage({ type: 'MODEL_LOADED', message: '✅ 모델 준비 완료!', progress: 55 });

    } catch (err) {
      self.postMessage({ type: 'ERROR', message: `모델 로딩 실패: ${err.message}` });
    }
  }

  if (type === 'TRANSCRIBE') {
    if (!transcriber) {
      self.postMessage({ type: 'ERROR', message: '모델이 로드되지 않았습니다. 먼저 모델을 로드해주세요.' });
      return;
    }

    try {
      const { audioData, sourceLang } = payload;

      self.postMessage({ type: 'PROGRESS', message: '🎧 음성 분석 및 문장 단위 분리 중...', progress: 60 });

      const result = await transcriber(audioData, {
        return_timestamps: true,
        chunk_length_s: 30,
        stride_length_s: 5,
        language: sourceLang || 'english',
        task: 'transcribe',
      });

      self.postMessage({ type: 'PROGRESS', message: '⚡ 타임스탬프 매핑 완료!', progress: 90 });
      self.postMessage({ type: 'RESULT', result });

    } catch (err) {
      self.postMessage({ type: 'ERROR', message: `음성 인식 실패: ${err.message}` });
    }
  }
});
