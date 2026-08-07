'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MediaPlayer from './components/MediaPlayer';
import AiSegmenter from './components/AiSegmenter';
import SubtitleEditor from './components/SubtitleEditor';
import ExportModal from './components/ExportModal';
import GuideModal from './components/GuideModal';
import { Cpu, ListFilter } from 'lucide-react';

export default function Home() {
  const [videoSrc, setVideoSrc] = useState('/sample.mp4');
  const [videoTitle, setVideoTitle] = useState('기본 제공 샘플 영상 (sample.mp4)');
  const [segments, setSegments] = useState([
    {
      id: 1,
      start: 8.93,
      end: 11.24,
      text: "footage never before seen by civilized humanity.",
      translation: "문명사회에서 한 번도 본 적 없는 영상입니다.",
      memo: "도입 문장"
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
  ]);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isRepeatSentence, setIsRepeatSentence] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'ai'
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Expose global callback for drag and drop media loading
  useEffect(() => {
    window.onHeaderMediaSelect = (url, name) => {
      handleMediaSelect(url, name);
    };
  }, []);

  const handleMediaSelect = (url, fileName) => {
    setVideoSrc(url);
    setVideoTitle(fileName);
  };

  const handleSubtitleSelect = (fileContent, fileName) => {
    try {
      const parsed = parseSRTContent(fileContent);
      if (parsed && parsed.length > 0) {
        setSegments(parsed);
        setCurrentSegmentIndex(0);
        alert(`자막 파일(${fileName})에서 총 ${parsed.length}개 문장을 성공적으로 불러왔습니다!`);
      } else {
        alert('자막 파싱 실패: SRT 타임라인 형식을 확인해 주세요.');
      }
    } catch (e) {
      alert(`자막 읽기 오류: ${e.message}`);
    }
  };

  const parseSRTContent = (text) => {
    const blocks = text.trim().replace(/\r\n/g, '\n').split(/\n\s*\n/);
    const result = [];

    blocks.forEach((block, idx) => {
      const lines = block.trim().split('\n');
      if (lines.length < 2) return;
      let timeLineIdx = lines[0].includes('-->') ? 0 : 1;
      if (!lines[timeLineIdx] || !lines[timeLineIdx].includes('-->')) return;

      const [startStr, endStr] = lines[timeLineIdx].split('-->').map(s => s.trim());
      const parseTime = (str) => {
        const clean = str.replace(',', '.');
        const parts = clean.split(':');
        if (parts.length === 3) {
          return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
      };

      const textLines = lines.slice(timeLineIdx + 1);
      const origText = textLines[0] || '';
      const transText = textLines.slice(1).join(' ') || '';

      result.push({
        id: idx + 1,
        start: parseTime(startStr),
        end: parseTime(endStr),
        text: origText,
        translation: transText,
        memo: ''
      });
    });

    return result;
  };

  // Sync active segment index based on media player current time
  const handleTimeUpdate = (currentTime) => {
    const idx = segments.findIndex((s) => currentTime >= s.start && currentTime <= s.end);
    if (idx !== -1 && idx !== currentSegmentIndex) {
      setCurrentSegmentIndex(idx);
    }
  };

  const handleUpdateSegment = (idx, field, value) => {
    const next = [...segments];
    next[idx][field] = value;
    setSegments(next);
  };

  const handleDeleteSegment = (idx) => {
    const next = segments.filter((_, i) => i !== idx);
    setSegments(next);
    if (currentSegmentIndex >= next.length) {
      setCurrentSegmentIndex(Math.max(0, next.length - 1));
    }
  };

  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? parseFloat((lastSeg.end + 0.1).toFixed(2)) : 0;
    const newEnd = parseFloat((newStart + 3.0).toFixed(2));
    const newSeg = {
      id: Date.now(),
      start: newStart,
      end: newEnd,
      text: "New English sentence here.",
      translation: "새로운 한글 번역 문장",
      memo: ""
    };
    setSegments([...segments, newSeg]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onExportClick={() => setShowExportModal(true)}
        activeCount={segments.length}
        onMediaSelect={handleMediaSelect}
        onSubtitleSelect={handleSubtitleSelect}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Video Title Bar */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid var(--border-color)',
        padding: '6px 24px',
        fontSize: 12,
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>현재 재생 중: <strong style={{ color: '#38bdf8' }}>{videoTitle}</strong></span>
        <span>💡 상단 <strong style={{ color: '#c084fc' }}>[사용 방법]</strong> 버튼을 누르면 언제든지 가이드를 확인하실 수 있습니다.</span>
      </div>

      <main className="main-container">
        {/* Left Side: Media Player & Live Overlay */}
        <MediaPlayer
          videoSrc={videoSrc}
          segments={segments}
          currentSegmentIndex={currentSegmentIndex}
          onTimeUpdate={handleTimeUpdate}
          onSelectSegment={(idx) => setCurrentSegmentIndex(idx)}
          isRepeatSentence={isRepeatSentence}
          setIsRepeatSentence={setIsRepeatSentence}
        />

        {/* Right Side: AI Segmenter & Subtitle Editor */}
        <div className="right-panel">
          {/* Navigation Tabs */}
          <div className="tab-container">
            <button
              className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <ListFilter size={16} />
              <span>NativeBOX 자막 타임라인</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <Cpu size={16} color="#a78bfa" />
              <span>AI 자동 문장 분할기</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'ai' ? (
            <AiSegmenter
              onMediaLoaded={(url) => setVideoSrc(url)}
              onSegmentsGenerated={(newSegments) => {
                setSegments(newSegments);
                setCurrentSegmentIndex(0);
                setActiveTab('editor');
              }}
            />
          ) : (
            <SubtitleEditor
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              onSelectSegment={(idx) => setCurrentSegmentIndex(idx)}
              onUpdateSegment={handleUpdateSegment}
              onDeleteSegment={handleDeleteSegment}
              onAddSegment={handleAddSegment}
            />
          )}
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          segments={segments}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <GuideModal
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </div>
  );
}
