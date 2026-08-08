'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Upload, Globe, Cpu, Key, Zap, HelpCircle, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

// --- Translation via MyMemory API (Free, No Key Required) ---
async function translateFree(text, sourceLang, targetLang) {
  if (sourceLang === targetLang || !text.trim()) return text;
  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
    );
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    return text;
  } catch {
    return text;
  }
}

// --- Translation via OpenAI GPT (Paid) ---
async function translateOpenAI(text, targetLang, apiKey) {
  const langNames = { ko: '한국어', th: 'Thai', en: 'English', ja: '日本語', zh: '中文' };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Translate to ${langNames[targetLang] || targetLang}. Return only the translation, no explanations.` },
        { role: 'user', content: text }
      ],
      max_tokens: 256,
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}

// Extract audio from video/audio file as Float32Array (16kHz mono)
async function extractAudio(file) {
  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err) {
    // Fallback using FileReader if direct arrayBuffer() fails (e.g. temporary file lock or Chrome File handle issue)
    arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다. (다운로드 중이거나 다른 프로그램에서 사용 중인 파일일 수 있습니다.)'));
      reader.readAsArrayBuffer(file);
    });
  }

  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtxClass({ sampleRate: 16000 });
  
  try {
    const audioBuffer = await new Promise((resolve, reject) => {
      audioCtx.decodeAudioData(arrayBuffer, resolve, (decodeErr) => {
        reject(new Error('오디오 코덱을 해독할 수 없습니다. (MP3/WAV/AAC 형식 지원)'));
      });
    });
    
    // Get mono channel data
    const channelData = audioBuffer.getChannelData(0);
    audioCtx.close();
    return channelData;
  } catch (decodeErr) {
    audioCtx.close();
    throw decodeErr;
  }
}

const ENGINE_OPTIONS = [
  {
    id: 'local',
    label: '🆓 무료 로컬 (권장)',
    sublabel: 'Whisper AI - 브라우저에서 직접 실행',
    desc: 'API 키 불필요. 최초 실행 시 모델 자동 다운로드 (244MB). 이후 오프라인 동작.',
    color: '#10b981',
    requiresKey: false,
  },
  {
    id: 'openai',
    label: '💳 유료 (OpenAI)',
    sublabel: 'OpenAI Whisper API - 최고 정확도',
    desc: 'OpenAI API Key 필요. $0.006/분 과금. 가장 빠르고 정확한 결과.',
    color: '#3b82f6',
    requiresKey: true,
    keyLabel: 'OpenAI API Key (sk-...)',
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    id: 'hf',
    label: '🆓 무료 클라우드 (HF)',
    sublabel: 'Hugging Face API - 무료 계정 토큰',
    desc: 'HF 무료 계정 토큰 사용. 월 사용량 제한 있음. 계정 없으면 로컬 옵션 사용 권장.',
    color: '#f59e0b',
    requiresKey: true,
    keyLabel: 'Hugging Face 토큰 (hf_...)',
    keyPlaceholder: 'hf_xxxxxxxxxxxxxxxxxxxxxxxx',
  },
];

const MODEL_OPTIONS = [
  { id: 'tiny', label: 'Tiny (75MB) - 빠름, 낮은 정확도' },
  { id: 'small', label: 'Small (244MB) - 권장 ⭐' },
  { id: 'medium', label: 'Medium (769MB) - 느림, 높은 정확도' },
];

const SOURCE_LANG_OPTIONS = [
  { value: 'english', label: '🇺🇸 영어 (English)' },
  { value: 'thai', label: '🇹🇭 태국어 (Thai)' },
  { value: 'japanese', label: '🇯🇵 일본어 (Japanese)' },
  { value: 'chinese', label: '🇨🇳 중국어 (Chinese)' },
  { value: 'korean', label: '🇰🇷 한국어 (Korean)' },
  { value: 'french', label: '🇫🇷 프랑스어 (French)' },
  { value: 'spanish', label: '🇪🇸 스페인어 (Spanish)' },
];

const TARGET_LANG_OPTIONS = [
  { value: 'ko', label: '🇰🇷 한국어 (Korean)', code: 'ko' },
  { value: 'th', label: '🇹🇭 태국어 (Thai)', code: 'th' },
  { value: 'en', label: '🇺🇸 영어 (English)', code: 'en' },
  { value: 'ja', label: '🇯🇵 일본어 (Japanese)', code: 'ja' },
  { value: 'zh', label: '🇨🇳 중국어 (Chinese)', code: 'zh' },
];

// Simple inline help tooltip
function InlineHelp({ children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle', marginLeft: 6 }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.4)',
          borderRadius: '50%',
          width: 18, height: 18,
          color: '#a78bfa',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1
        }}
        title="도움말"
      >?</button>
      {show && (
        <div style={{
          position: 'absolute',
          left: 22, top: -6,
          background: '#1e2640',
          border: '1px solid rgba(139,92,246,0.5)',
          borderRadius: 8,
          padding: '8px 12px',
          zIndex: 999,
          width: 260,
          fontSize: 12,
          color: '#d1d5db',
          lineHeight: 1.5,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {children}
          <div style={{ marginTop: 6, textAlign: 'right' }}>
            <button onClick={() => setShow(false)} style={{ fontSize: 10, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}>닫기</button>
          </div>
        </div>
      )}
    </span>
  );
}

export default function AiSegmenter({ onSegmentsGenerated, onMediaLoaded }) {
  const [selectedEngine, setSelectedEngine] = useState('local');
  const [apiKey, setApiKey] = useState('');
  const [modelSize, setModelSize] = useState('small');
  const [sourceLang, setSourceLang] = useState('english');
  const [targetLang, setTargetLang] = useState('ko');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [logMessages, setLogMessages] = useState([]);
  const [error, setError] = useState('');
  const [showEngineHelp, setShowEngineHelp] = useState(false);

  const workerRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  React.useEffect(() => {
    if (isProcessing) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isProcessing]);

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const addLog = useCallback((msg) => {
    setLogMessages(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const handleFileChange = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'wma'];
    const isValidType = (file.type && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) || validExts.includes(ext);

    if (!isValidType) {
      setError('동영상(mp4, avi, mkv 등) 또는 오디오(mp3, wav, m4a 등) 파일만 업로드 가능합니다.');
      return;
    }
    setError('');
    setSelectedFile(file);
    setSelectedFileName(file.name);
    const url = URL.createObjectURL(file);
    onMediaLoaded(url);
    addLog(`📁 파일 선택됨: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  // Auto-load saved API key from localStorage when engine changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(`nativebox_${selectedEngine}_key`) || '';
      setApiKey(savedKey);
    }
  }, [selectedEngine]);

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`nativebox_${selectedEngine}_key`, val.trim());
    }
  };

  // ── OPENAI ENGINE ──
  const runOpenAI = async (audioBlob) => {
    if (!apiKey.trim()) throw new Error('OpenAI API Key를 입력해주세요.');
    addLog('🚀 OpenAI Whisper API로 음성 인식 중...');
    setProgress(40);

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp4');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `OpenAI API 오류 (${res.status})`);
    }

    const data = await res.json();
    setProgress(75);
    addLog(`✅ 음성 인식 완료! 총 ${data.segments?.length || 0}개 문장 감지`);
    return data.segments || [];
  };

  // ── HF ENGINE ──
  const runHuggingFace = async (file) => {
    if (!apiKey.trim()) throw new Error('Hugging Face 토큰을 입력해주세요.');

    // Determine language code for Whisper
    const langCodeMap = {
      english: 'english', thai: 'thai', japanese: 'japanese',
      chinese: 'chinese', korean: 'korean', french: 'french', spanish: 'spanish'
    };
    const whisperLang = langCodeMap[sourceLang] || 'english';
    addLog(`🚀 Hugging Face Whisper Cloud API 호출 중... [언어: ${whisperLang}]`);
    setProgress(30);

    // ── Step 1: Try JSON body with return_timestamps + language hint ──
    let data = null;
    let usedJsonMode = false;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const jsonRes = await fetch(
        'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: base64,
            parameters: {
              language: whisperLang,
              return_timestamps: true,
              task: 'transcribe',
            },
          }),
        }
      );
      if (jsonRes.ok) {
        data = await jsonRes.json();
        usedJsonMode = true;
        addLog(`✅ JSON 모드 응답 수신 (타임스탬프 포함)`);
      } else {
        addLog(`⚠️ JSON 모드 실패 (${jsonRes.status}), 바이너리 모드로 재시도...`);
      }
    } catch (e) {
      addLog(`⚠️ JSON 모드 오류: ${e.message}, 바이너리 모드로 재시도...`);
    }

    // ── Step 2: Fallback to binary body ──
    if (!data) {
      const arrayBuffer = await file.arrayBuffer();
      const res = await fetch(
        'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            'Content-Type': 'audio/mpeg',
          },
          body: arrayBuffer,
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        let msg = `Hugging Face API 오류 (${res.status})`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) msg = `Hugging Face 오류: ${parsed.error}`;
        } catch {}
        throw new Error(msg);
      }
      data = await res.json();
      addLog(`✅ 바이너리 모드 응답 수신`);
    }

    setProgress(75);

    // ── Parse chunks with timestamps (JSON mode returns { chunks: [{timestamp:[s,e], text}] }) ──
    if (usedJsonMode && data.chunks && Array.isArray(data.chunks) && data.chunks.length > 0) {
      addLog(`✅ 타임스탬프 기반 세그먼트 파싱 (${data.chunks.length}개)`);
      return data.chunks.map((chunk, i) => ({
        text: (chunk.text || '').trim(),
        start: Array.isArray(chunk.timestamp) ? (chunk.timestamp[0] ?? i * 3) : (i * 3),
        end: Array.isArray(chunk.timestamp) ? (chunk.timestamp[1] ?? (i + 1) * 3) : ((i + 1) * 3),
      })).filter(c => c.text);
    }

    // ── Fallback: split fullText by language-aware rules ──
    const fullText = typeof data === 'string' ? data : (data.text || '');
    addLog(`⚠️ 타임스탬프 없음. 텍스트 규칙 분할 (${fullText.length}자)`);

    let sentences;
    if (sourceLang === 'thai') {
      // Thai: no sentence-ending punctuation; split by Thai-specific patterns:
      // Thai full stop '।', double-space, line break, or every ~60 characters at word boundary
      const thaiFull = fullText
        .replace(/\s*\n\s*/g, '\n')
        .split(/(?<=\s{2,})|(?<=\u0E4F)|(?<=\u0E2F)|(?<=\.\s)|(?<=!\s)|(?<=\?\s)|\n/)
        .map(s => s.trim())
        .filter(s => s.length > 1);

      // If split produced only 1 chunk, chunk by ~50 Thai characters
      if (thaiFull.length <= 1 && fullText.length > 50) {
        sentences = [];
        let remaining = fullText.trim();
        while (remaining.length > 0) {
          let chunk = remaining.slice(0, 60);
          // Try to break at a space near char 60
          const lastSpace = chunk.lastIndexOf(' ');
          if (lastSpace > 20 && remaining.length > 60) {
            chunk = chunk.slice(0, lastSpace);
          }
          sentences.push(chunk.trim());
          remaining = remaining.slice(chunk.length).trim();
        }
      } else {
        sentences = thaiFull;
      }
    } else {
      // English / other: standard sentence boundary
      sentences = fullText.match(/[^.!?。！？]+[.!?。！？]+/g) || [fullText];
    }

    const avgDuration = 3.5; // average seconds per sentence estimate
    return sentences.map((s, i) => ({
      text: s.trim(),
      start: Math.round(i * avgDuration * 10) / 10,
      end: Math.round((i + 1) * avgDuration * 10) / 10,
    })).filter(c => c.text);
  };

  // ── LOCAL ENGINE (WebWorker + transformers.js CDN) ──
  const runLocal = (audioData) => {
    return new Promise((resolve, reject) => {
      if (workerRef.current) workerRef.current.terminate();

      let worker;
      try {
        worker = new Worker(new URL('../workers/whisper.worker.js', import.meta.url));
      } catch (e) {
        try {
          worker = new Worker('./whisper-worker.js');
        } catch (e2) {
          reject(new Error('AI 인식 워커 스크립트를 로드할 수 없습니다.'));
          return;
        }
      }
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, message, progress: prog, result } = e.data;
        if (type === 'PROGRESS') {
          addLog(message);
          setProgress(prog || 0);
        } else if (type === 'MODEL_LOADED') {
          addLog(message);
          worker.postMessage({ type: 'TRANSCRIBE', payload: { audioData, sourceLang } });
        } else if (type === 'RESULT') {
          worker.terminate();
          resolve(result);
        } else if (type === 'ERROR') {
          worker.terminate();
          reject(new Error(message));
        }
      };

      worker.onerror = (err) => {
        worker.terminate();
        reject(new Error(`WebWorker 오류: ${err.message || '알 수 없는 오류'}`));
      };

      worker.postMessage({ type: 'LOAD_MODEL', payload: { modelSize } });
    });
  };

  const runSegmentation = async () => {
    if (!selectedFile && selectedEngine === 'local') {
      // Use default sample for demo
      addLog('📁 파일이 없어 기본 샘플 데이터를 사용합니다.');
      runDemoSegmentation();
      return;
    }

    if (!selectedFile) {
      setError('처리할 파일을 먼저 업로드해주세요.');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setError('');
    setLogMessages([]);
    addLog(`🎯 선택된 엔진: ${ENGINE_OPTIONS.find(e => e.id === selectedEngine)?.label}`);
    addLog(`📁 파일: ${selectedFile.name}`);

    try {
      let rawSegments = [];

      if (selectedEngine === 'openai') {
        rawSegments = await runOpenAI(selectedFile);
      } else if (selectedEngine === 'hf') {
        rawSegments = await runHuggingFace(selectedFile);
      } else {
        // local - extract audio first
        addLog('🔊 동영상에서 음성 추출 중...');
        setProgress(10);
        let audioData;
        try {
          audioData = await extractAudio(selectedFile);
          addLog(`✅ 음성 추출 완료 (${(audioData.length / 16000).toFixed(1)}초 분량)`);
        } catch (ex) {
          throw new Error(`음성 추출 실패: ${ex.message}. MP3/WAV 파일로 변환 후 다시 시도해보세요.`);
        }
        const result = await runLocal(audioData);
        rawSegments = result.chunks || [];
      }

      // Normalize segments
      setProgress(88);
      addLog(`🌐 번역 중... (${TARGET_LANG_OPTIONS.find(l => l.value === targetLang)?.label})`);

      const segments = [];
      const srcCode = { english: 'en', thai: 'th', japanese: 'ja', chinese: 'zh', korean: 'ko', french: 'fr', spanish: 'es' }[sourceLang] || 'en';

      for (let i = 0; i < rawSegments.length; i++) {
        const raw = rawSegments[i];
        const text = (raw.text || raw.transcription || '').trim();
        if (!text) continue;

        const start = raw.timestamp?.[0] ?? raw.start ?? i * 3;
        const end = raw.timestamp?.[1] ?? raw.end ?? start + 3;

        let translation = '';
        try {
          if (selectedEngine === 'openai' && apiKey) {
            translation = await translateOpenAI(text, targetLang, apiKey);
          } else {
            translation = await translateFree(text, srcCode, targetLang);
          }
        } catch {
          translation = text;
        }

        segments.push({ id: i + 1, start, end, text, translation, memo: '' });
        setProgress(88 + Math.round((i / rawSegments.length) * 10));
        addLog(`✅ 문장 ${i + 1}/${rawSegments.length}: ${text.slice(0, 40)}...`);
      }

      setProgress(100);
      addLog(`🎉 완료! 총 ${segments.length}개 문장 구간 생성. 클릭하여 바로 학습하세요!`);
      const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : '/sample.mp4';
      const fileName = selectedFileName || 'intern.mp4';
      onSegmentsGenerated(segments, fileUrl, fileName);

    } catch (err) {
      setError(`오류: ${err.message}`);
      addLog(`❌ 오류 발생: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Demo fallback (no file)
  const runDemoSegmentation = () => {
    setIsProcessing(true);
    setProgress(10);
    setLogMessages([]);
    addLog('🎬 기본 샘플 영상으로 데모 실행 중...');

    const demoByLang = {
      ko: [
        { id: 1, start: 8.93, end: 11.24, text: "I always knew we were a fairly odd family.", translation: "나는 우리가 꽤 특이한 가족이라는 걸 항상 알고 있었다.", memo: "" },
        { id: 2, start: 11.25, end: 13.10, text: "First there was me.", translation: "첫 번째로 내가 있었다.", memo: "" },
        { id: 3, start: 13.11, end: 15.54, text: "Too tall. Too skinny. Too orange.", translation: "너무 키가 크고. 너무 말랐고. 너무 주황색 머리였다.", memo: "" },
        { id: 4, start: 15.55, end: 18.87, text: "My mum was lovely, but not like other mums.", translation: "우리 엄마는 사랑스러웠지만, 다른 엄마들과는 달랐다.", memo: "" },
        { id: 5, start: 18.88, end: 21.88, text: "There was something solid about her.", translation: "엄마에게는 단호한 면이 있었다.", memo: "" },
      ],
      th: [
        { id: 1, start: 8.93, end: 11.24, text: "I always knew we were a fairly odd family.", translation: "ฉันรู้มาตลอดว่าเราเป็นครอบครัวที่แปลกพอสมควร", memo: "" },
        { id: 2, start: 11.25, end: 13.10, text: "First there was me.", translation: "อย่างแรกคือตัวฉันเอง", memo: "" },
        { id: 3, start: 13.11, end: 15.54, text: "Too tall. Too skinny. Too orange.", translation: "สูงเกินไป ผอมเกินไป และมีผมสีส้มเกินไป", memo: "" },
        { id: 4, start: 15.55, end: 18.87, text: "My mum was lovely, but not like other mums.", translation: "แม่ของฉันน่ารัก แต่ไม่เหมือนแม่คนอื่น", memo: "" },
        { id: 5, start: 18.88, end: 21.88, text: "There was something solid about her.", translation: "มีบางอย่างที่มั่นคงในตัวเธอ", memo: "" },
      ],
    };

    setTimeout(() => {
      setProgress(100);
      const segs = demoByLang[targetLang] || demoByLang.ko;
      addLog(`✅ 샘플 데이터 ${segs.length}개 문장 로드 완료!`);
      addLog('👆 각 문장을 클릭하면 해당 구간으로 바로 이동합니다.');
      onSegmentsGenerated(segs);
      setIsProcessing(false);
    }, 1200);
  };

  const selectedEngineInfo = ENGINE_OPTIONS.find(e => e.id === selectedEngine);

  return (
    <div className="glass-panel ai-card" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ background: 'rgba(139,92,246,0.2)', padding: 8, borderRadius: 8, border: '1px solid rgba(139,92,246,0.4)' }}>
          <Cpu size={22} color="#a78bfa" />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>AI 일괄 문장 자동 분할기</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            동영상/음성을 업로드하면 AI가 자동으로 문장 단위로 끊고 번역까지 생성합니다
          </p>
        </div>
      </div>

      {/* ── STEP 1: Engine Selection ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>1</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>AI 엔진 선택</span>
            <InlineHelp>
              <strong>AI 엔진이란?</strong><br />
              동영상/음성의 말소리를 텍스트로 변환하는 음성인식 AI입니다.<br /><br />
              • <strong>무료 로컬</strong>: API 키 없이 사용. 브라우저에서 직접 실행.<br />
              • <strong>유료(OpenAI)</strong>: 가장 정확. API 키 필요.<br />
              • <strong>무료(HF)</strong>: 클라우드. 무료 계정 토큰 필요.
            </InlineHelp>
          </div>
          <button
            onClick={() => setShowEngineHelp(!showEngineHelp)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
          >
            {showEngineHelp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showEngineHelp ? '접기' : '비교 보기'}
          </button>
        </div>

        {/* Engine Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {ENGINE_OPTIONS.map(engine => (
            <button
              key={engine.id}
              onClick={() => setSelectedEngine(engine.id)}
              style={{
                background: selectedEngine === engine.id ? `rgba(${engine.id === 'local' ? '16,185,129' : engine.id === 'openai' ? '59,130,246' : '245,158,11'},0.15)` : 'rgba(255,255,255,0.04)',
                border: `2px solid ${selectedEngine === engine.id ? engine.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10,
                padding: '10px 10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedEngine === engine.id ? engine.color : '#fff', marginBottom: 3 }}>
                {engine.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {engine.sublabel}
              </div>
            </button>
          ))}
        </div>

        {/* Engine Detail */}
        {showEngineHelp && (
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: selectedEngineInfo?.color }}>{selectedEngineInfo?.label}</strong> — {selectedEngineInfo?.desc}
          </div>
        )}

        {/* API Key Input (if engine requires) */}
        {selectedEngineInfo?.requiresKey && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
              <Key size={12} color="#f59e0b" />
              {selectedEngineInfo.keyLabel}
              <InlineHelp>
                {selectedEngine === 'openai'
                  ? <>OpenAI API Key는 <strong>platform.openai.com</strong>에서 발급 받을 수 있습니다. sk-로 시작합니다.</>
                  : <>Hugging Face 토큰은 <strong>huggingface.co/settings/tokens</strong>에서 무료 발급 가능합니다. hf_로 시작합니다.</>}
              </InlineHelp>
            </label>
            <input
              type="password"
              placeholder={selectedEngineInfo.keyPlaceholder}
              value={apiKey}
              onChange={e => handleApiKeyChange(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
                color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace'
              }}
            />
          </div>
        )}

        {/* Model size (local only) */}
        {selectedEngine === 'local' && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
              <Cpu size={12} color="#a78bfa" />
              Whisper 모델 크기
              <InlineHelp>
                <strong>모델 크기 선택 가이드:</strong><br />
                • <strong>Tiny (75MB)</strong>: 빠르지만 인식률 낮음<br />
                • <strong>Small (244MB)</strong>: 속도/정확도 균형 (권장)<br />
                • <strong>Medium (769MB)</strong>: 높은 정확도, 느림<br /><br />
                최초 실행 시 선택한 모델이 자동으로 다운로드됩니다.
              </InlineHelp>
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {MODEL_OPTIONS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModelSize(m.id)}
                  style={{
                    flex: 1, padding: '6px 4px', fontSize: 11, borderRadius: 6,
                    background: modelSize === m.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${modelSize === m.id ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`,
                    color: modelSize === m.id ? '#a78bfa' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── STEP 2: File Upload ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>2</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>동영상/음성 파일 업로드</span>
          <InlineHelp>
            <strong>지원 파일 형식:</strong><br />
            • <strong>동영상</strong>: MP4, AVI, MKV, MOV, WebM<br />
            • <strong>오디오</strong>: MP3, WAV, M4A, OGG<br /><br />
            파일을 드래그해서 이 영역에 놓거나, 클릭해서 선택하세요.<br /><br />
            ⚠️ 무료 로컬 엔진은 <strong>MP3, WAV, M4A</strong> 형식을 권장합니다.
          </InlineHelp>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${selectedFileName ? '#10b981' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 10,
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: selectedFileName ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*"
            onChange={e => handleFileChange(e.target.files[0])}
            style={{ display: 'none' }}
          />
          {selectedFileName ? (
            <div>
              <CheckCircle size={28} color="#10b981" style={{ marginBottom: 6 }} />
              <div style={{ color: '#10b981', fontWeight: 600, fontSize: 14 }}>{selectedFileName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>클릭하여 다른 파일 선택</div>
            </div>
          ) : (
            <div>
              <Upload size={28} color="#38bdf8" style={{ marginBottom: 6 }} />
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>동영상 / 오디오 파일을 여기에 끌어다 놓기</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>또는 클릭하여 파일 선택 (MP4, MP3, WAV 등)</div>
            </div>
          )}
        </div>
      </div>

      {/* ── STEP 3: Language Settings ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>3</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>언어 설정</span>
          <InlineHelp>
            <strong>언어 설정 가이드:</strong><br />
            • <strong>원본 언어</strong>: 동영상 속 화자가 말하는 언어<br />
            (예: 영어 영화 → 영어 선택)<br /><br />
            • <strong>번역 언어</strong>: 자막으로 표시할 언어<br />
            (예: 한국어로 번역하고 싶으면 한국어 선택)<br /><br />
            원본=번역이면 번역 없이 원문만 표시됩니다.
          </InlineHelp>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>📹 영상 원본 언어</label>
            <select value={sourceLang} onChange={e => setSourceLang(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
              {SOURCE_LANG_OPTIONS.map(l => <option key={l.value} value={l.value} style={{ background: '#121524' }}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>🌐 번역 대상 언어</label>
            <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
              {TARGET_LANG_OPTIONS.map(l => <option key={l.value} value={l.value} style={{ background: '#121524' }}>{l.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── STEP 4: Run Button ── */}
      <button
        className="btn-icon btn-primary"
        onClick={runSegmentation}
        disabled={isProcessing}
        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, fontWeight: 700 }}
      >
        <Sparkles size={18} />
        <span>
          {isProcessing
            ? '🤖 AI 처리 중...'
            : selectedFile
              ? '🚀 AI 자동 문장 분할 실행'
              : '🎬 샘플 영상으로 데모 실행'}
        </span>
      </button>

      {/* Progress Bar & Elapsed Time */}
      {isProcessing && (
        <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#93c5fd', marginBottom: 6, fontWeight: 600 }}>
            <span>⏱️ 경과 시간: {formatTime(elapsedSeconds)}</span>
            <span>
              {progress > 5 && progress < 100
                ? `⏳ 예상 남은 시간: 약 ${formatTime(Math.max(1, Math.round((elapsedSeconds / Math.max(1, progress)) * (100 - progress))))}`
                : '🤖 처리 진행 중...'}
              &nbsp;({progress}%)
            </span>
          </div>
          <div className="progress-bar-outer">
            <div className="progress-bar-inner" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      {/* Log Terminal */}
      <div style={{
        background: '#05070d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
        padding: 10, height: 130, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11, color: '#34d399'
      }}>
        {logMessages.length === 0 ? (
          <span style={{ color: '#6b7280' }}>
            대기 중... 파일 없이 실행하면 샘플 데이터로 기능을 먼저 체험할 수 있습니다.
          </span>
        ) : (
          logMessages.map((msg, idx) => <div key={idx}>{msg}</div>)
        )}
      </div>
    </div>
  );
}
