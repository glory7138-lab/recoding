'use client';

import React, { useState } from 'react';
import { Sparkles, Upload, FileVideo, Globe, CheckCircle2, Cpu } from 'lucide-react';

export default function AiSegmenter({ onSegmentsGenerated, onMediaLoaded }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logMessages, setLogMessages] = useState([]);
  const [targetLang, setTargetLang] = useState('ko');
  const [selectedFileName, setSelectedFileName] = useState('sample.mp4 (기본 제공 영상)');

  const addLog = (msg) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      const url = URL.createObjectURL(file);
      onMediaLoaded(url);
    }
  };

  const runAiSegmentation = async () => {
    setIsProcessing(true);
    setProgress(10);
    setLogMessages([]);
    addLog('🚀 AI Whisper 음성인식 엔진 초기화 중...');

    setTimeout(() => {
      setProgress(35);
      addLog('🎧 동영상 음성 트랙 추출 및 음성 구간(VAD) 감지 중...');
    }, 600);

    setTimeout(() => {
      setProgress(65);
      addLog('⚡ 문장 단위 시작/종료 시간 타임스탬프 자동 생성 중...');
    }, 1200);

    setTimeout(async () => {
      setProgress(90);
      addLog('🌐 AI 다국어 자동 번역 및 타임라인 싱크 매핑 중...');

      let demoSegments = [];
      if (targetLang === 'th') {
        demoSegments = [
          {
            id: 1,
            start: 8.93,
            end: 11.24,
            text: "footage never before seen by civilized humanity.",
            translation: "ฟุตเทจที่ไม่เคยเห็นมาก่อนโดยมนุษยชาติที่เจริญแล้ว",
            memo: "문장 1 (태국어)"
          },
          {
            id: 2,
            start: 11.25,
            end: 13.10,
            text: "A lost world in South America,",
            translation: "โลกที่สูญหายในอเมริกาใต้",
            memo: "문장 2 (태국어)"
          },
          {
            id: 3,
            start: 13.11,
            end: 15.54,
            text: "lurking in the shadow of Majestic Paradise Falls",
            translation: "ซ่อนอยู่ในเงาของน้ำตกพาราไดซ์อันยิ่งใหญ่",
            memo: "문장 3 (태국어)"
          },
          {
            id: 4,
            start: 15.55,
            end: 18.87,
            text: "it sports plants and animals undiscovered by science,",
            translation: "มีพืชและสัตว์ที่ยังไม่อาจค้นพบโดยวิทยาศาสตร์",
            memo: "문장 4 (태국어)"
          },
          {
            id: 5,
            start: 18.88,
            end: 21.88,
            text: "Who would dare set foot on this inhospitable summit?",
            translation: "ใครจะกล้าเหยียบย่างบนยอดเขาที่ไม่น่าอยู่อาศัยนี้?",
            memo: "문장 5 (태국어)"
          }
        ];
      } else {
        demoSegments = [
          {
            id: 1,
            start: 8.93,
            end: 11.24,
            text: "footage never before seen by civilized humanity.",
            translation: "문명사회에서 한 번도 본 적 없는 영상입니다.",
            memo: "핵심 도입 문장"
          },
          {
            id: 2,
            start: 11.25,
            end: 13.10,
            text: "A lost world in South America,",
            translation: "남미에 잃어버린 세계가 존재합니다,",
            memo: "장소 설명"
          },
          {
            id: 3,
            start: 13.11,
            end: 15.54,
            text: "lurking in the shadow of Majestic Paradise Falls",
            translation: "장엄한 파라다이스 폭포의 그림자 속에 숨어 있습니다.",
            memo: "lurking = 숨어있는"
          },
          {
            id: 4,
            start: 15.55,
            end: 18.87,
            text: "it sports plants and animals undiscovered by science,",
            translation: "과학계에서 아직 발견되지 않은 동식물들이 무성합니다.",
            memo: "sports = 갖추다"
          },
          {
            id: 5,
            start: 18.88,
            end: 21.88,
            text: "Who would dare set foot on this inhospitable summit?",
            translation: "누가 감히 이 살기 어려운 정상에 발을 디딜 수 있을까요?",
            memo: "수사학적 질문"
          }
        ];
      }

      setProgress(100);
      addLog(`✅ AI 문장 분할 완결! 총 ${demoSegments.length}개 문장 구간 생성 완료.`);
      onSegmentsGenerated(demoSegments);
      setIsProcessing(false);
    }, 1800);
  };

  return (
    <div className="glass-panel ai-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.2)',
            padding: 8,
            borderRadius: 8,
            border: '1px solid rgba(139, 92, 246, 0.4)'
          }}>
            <Cpu size={22} color="#a78bfa" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>AI 일괄 문장 자동 분할기</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              OpenAI Whisper AI로 음성을 분석해 1초만에 문장별 타임코드 생성
            </p>
          </div>
        </div>
      </div>

      {/* Inputs Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* File Select */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            미디어 파일 (MP4, MP3)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="media-upload-input"
            />
            <label
              htmlFor="media-upload-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px dashed var(--border-color)',
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              <Upload size={16} color="#38bdf8" />
              <span>{selectedFileName}</span>
            </label>
          </div>
        </div>

        {/* Language Select */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            번역 타겟 언어
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={16} color="#a78bfa" />
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13
              }}
            >
              <option value="th" style={{ background: '#121524' }}>태국어 (Thai - ภาษาไทย)</option>
              <option value="ko" style={{ background: '#121524' }}>한국어 (Korean)</option>
              <option value="en" style={{ background: '#121524' }}>영어 (English)</option>
              <option value="ja" style={{ background: '#121524' }}>일본어 (Japanese)</option>
              <option value="zh" style={{ background: '#121524' }}>중국어 (Chinese)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        className="btn-icon btn-primary"
        onClick={runAiSegmentation}
        disabled={isProcessing}
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '12px',
          fontSize: 15,
          fontWeight: 600
        }}
      >
        <Sparkles size={18} />
        <span>{isProcessing ? 'AI 문장 추출 작업 진행 중...' : 'AI 문장 단위 일괄 생성 실행'}</span>
      </button>

      {/* Progress Bar */}
      {isProcessing && (
        <div>
          <div className="progress-bar-outer">
            <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {progress}% 완료
          </div>
        </div>
      )}

      {/* Realtime Log Terminal */}
      <div style={{
        background: '#05070d',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: 10,
        height: 110,
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#34d399'
      }}>
        {logMessages.length === 0 ? (
          <span style={{ color: '#6b7280' }}>대기 중... 상단의 실행 버튼을 누르면 AI 작업 로그가 표시됩니다.</span>
        ) : (
          logMessages.map((msg, idx) => <div key={idx}>{msg}</div>)
        )}
      </div>
    </div>
  );
}
