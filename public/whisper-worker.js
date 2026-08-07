// public/whisper-worker.js
// Web Worker: runs Whisper transcription entirely in the browser, no API key needed
// Uses @xenova/transformers (Hugging Face Transformers.js)
// NOTE: Uses fetch+eval instead of importScripts for Electron asar compatibility

let transformersLoaded = false;

async function loadTransformersLibrary() {
  if (transformersLoaded) return;

  // Try multiple URL patterns to find transformers.min.js
  const urls = [
    'transformers.min.js',
    '/transformers.min.js',
    './transformers.min.js',
  ];

  const errors = [];

  for (const url of urls) {
    try {
      self.postMessage({ type: 'PROGRESS', message: `📦 라이브러리 로딩 시도: ${url}`, progress: 2 });
      const response = await fetch(url);
      if (!response.ok) {
        errors.push(`${url}: HTTP ${response.status}`);
        continue;
      }
      const scriptText = await response.text();
      if (!scriptText || scriptText.length < 1000) {
        errors.push(`${url}: 파일 크기 비정상 (${scriptText?.length || 0} bytes)`);
        continue;
      }
      // Execute in global scope (equivalent to importScripts but async-safe)
      (0, eval)(scriptText);
      transformersLoaded = true;
      self.postMessage({ type: 'PROGRESS', message: `✅ 라이브러리 로드 성공 (${url})`, progress: 4 });
      return;
    } catch (e) {
      errors.push(`${url}: ${e.message}`);
    }
  }

  throw new Error(
    `AI 라이브러리(transformers.min.js)를 로드할 수 없습니다.\n` +
    `시도한 경로: ${errors.join(' | ')}`
  );
}

let transcriber = null;

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  if (type === 'LOAD_MODEL') {
    try {
      // Step 1: Load the library
      await loadTransformersLibrary();

      if (!self.Transformers) {
        throw new Error('Transformers 라이브러리가 전역에 등록되지 않았습니다. (self.Transformers is undefined)');
      }

      const { pipeline, env } = self.Transformers;

      // Disable remote model check for faster startup after first download
      env.allowLocalModels = false;

      // Step 2: Load the whisper model
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
            const pct = Math.round((progressInfo.loaded / progressInfo.total) * 40);
            self.postMessage({
              type: 'PROGRESS',
              message: `📥 모델 다운로드 중: ${progressInfo.file} (${Math.round(progressInfo.loaded / 1024 / 1024)}MB / ${Math.round(progressInfo.total / 1024 / 1024)}MB)`,
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
