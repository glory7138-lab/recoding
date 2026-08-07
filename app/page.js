'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NativeBoxPlayer from './components/NativeBoxPlayer';
import SubtitleScriptViewer from './components/SubtitleScriptViewer';
import PlaylistPanel from './components/PlaylistPanel';
import AiSegmenter from './components/AiSegmenter';
import SubtitleEditor from './components/SubtitleEditor';
import ExportModal from './components/ExportModal';
import GuideModal from './components/GuideModal';
import { Cpu, ListFilter, Sliders } from 'lucide-react';

export default function Home() {
  const initialSegments = [
    {
      id: 1,
      start: 8.93,
      end: 11.24,
      text: "I always knew we were a fairly odd family.",
      translation: "나는 우리가 꽤 특이한 가족이라는 걸 항상 알고 있었다.",
      memo: "도입 문장"
    },
    {
      id: 2,
      start: 11.25,
      end: 13.10,
      text: "First there was me.",
      translation: "첫 번째로 내가 있었다.",
      memo: "인물 소개"
    },
    {
      id: 3,
      start: 13.11,
      end: 15.54,
      text: "Too tall. Too skinny. Too orange.",
      translation: "너무 키가 크고. 너무 말랐고. 너무 주황색 머리였다.",
      memo: "외모 묘사"
    },
    {
      id: 4,
      start: 15.55,
      end: 18.87,
      text: "My mum was lovely, but not like other mums.",
      translation: "우리 엄마는 사랑스러웠지만, 다른 엄마들과는 달랐다.",
      memo: "엄마 소개"
    },
    {
      id: 5,
      start: 18.88,
      end: 21.88,
      text: "There was something solid about her. Some busy and unsentimental.",
      translation: "엄마에게는 단호한 면이 있었다. 바쁘고 감정적이지 않았다.",
      memo: "성격 묘사"
    }
  ];

  const [playlist, setPlaylist] = useState([
    { id: 'default', name: 'About.Time.2013[1].avi', url: '/sample.mp4', segments: initialSegments }
  ]);
  const [videoSrc, setVideoSrc] = useState('/sample.mp4');
  const [videoTitle, setVideoTitle] = useState('About.Time.2013[1].avi');
  const [segments, setSegments] = useState(initialSegments);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [seekTrigger, setSeekTrigger] = useState(null);
  const [isRepeatSentence, setIsRepeatSentence] = useState(false);
  const [checkedIndices, setCheckedIndices] = useState([]);

  const handleSelectSegment = (idx) => {
    setCurrentSegmentIndex(idx);
    if (segments[idx]) {
      setSeekTrigger({ time: segments[idx].start, ts: Date.now() });
    }
  };
  const [screenMode, setScreenMode] = useState('normal'); // 'normal' | 'big' | 'full' | 'caption'
  const [captionMode, setCaptionMode] = useState('EK'); // 'X' | 'E' | 'K' | 'EK'
  const [fontSize, setFontSizeState] = useState(14); // Font size in pixels (default 14px for 4-item view)
  const [playerSizePercent, setPlayerSizePercentState] = useState(100); // Player width size % (60%~140%)

  // Load saved font size and player screen size from localStorage on mount
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem('nb_font_size');
      if (savedFont && !isNaN(Number(savedFont))) {
        setFontSizeState(Number(savedFont));
      }
      const savedPlayerSize = localStorage.getItem('nb_player_size');
      if (savedPlayerSize && !isNaN(Number(savedPlayerSize))) {
        setPlayerSizePercentState(Number(savedPlayerSize));
      }
    } catch (e) {}
  }, []);

  const setFontSize = (newSize) => {
    const val = typeof newSize === 'number' ? newSize : 16;
    setFontSizeState(val);
    try {
      localStorage.setItem('nb_font_size', String(val));
    } catch (e) {}
  };

  const setPlayerSizePercent = (newSize) => {
    const val = typeof newSize === 'number' ? Math.max(60, Math.min(140, newSize)) : 100;
    setPlayerSizePercentState(val);
    try {
      localStorage.setItem('nb_player_size', String(val));
    } catch (e) {}
  };
  const [showContentsList, setShowContentsList] = useState(true);
  const [activeTab, setActiveTab] = useState('nativebox'); // 'nativebox' | 'editor' | 'ai'
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Drag and Drop media loading & auto-load pre-parsed intern.mp4
  useEffect(() => {
    window.onHeaderMediaSelect = (url, name) => {
      handleMediaSelect(url, name);
    };

    fetch('/intern_output.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const internItem = {
            id: 'intern-mp4',
            name: 'intern.mp4',
            url: '/intern.mp4',
            segments: data
          };
          setPlaylist(prev => {
            const filtered = prev.filter(p => p.name !== 'intern.mp4');
            return [...filtered, internItem];
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleMediaSelect = (url, fileName) => {
    setVideoSrc(url);
    setVideoTitle(fileName);
    setPlaylist(prev => {
      const exists = prev.find(p => p.name === fileName);
      if (exists) return prev;
      return [...prev, { id: Date.now(), name: fileName, url, segments: [] }];
    });
  };

  const handleSelectPlaylistItem = (item) => {
    setVideoSrc(item.url);
    setVideoTitle(item.name);
    if (item.segments && item.segments.length > 0) {
      setSegments(item.segments);
    }
    setCurrentSegmentIndex(0);
  };

  const handleAddFileToPlaylist = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,audio/*';
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        const newItem = { id: Date.now(), name: file.name, url, segments: [] };
        setPlaylist(prev => [...prev, newItem]);
        handleSelectPlaylistItem(newItem);
      }
    };
    input.click();
  };

  const handleDeletePlaylistItem = () => {
    if (playlist.length <= 1) return;
    const nextList = playlist.filter(p => p.name !== videoTitle);
    setPlaylist(nextList);
    if (nextList[0]) handleSelectPlaylistItem(nextList[0]);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0e1117' }}>
      {/* App Header Toolbar (Always Visible) */}
      <Header
        onExportClick={() => setShowExportModal(true)}
        activeCount={segments.length}
        onMediaSelect={handleMediaSelect}
        onSubtitleSelect={handleSubtitleSelect}
        onOpenGuide={() => setShowGuideModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        videoTitle={videoTitle}
      />


      {/* Main Content Body */}
      <main style={{ flex: 1, padding: 16, position: 'relative', overflowX: 'hidden' }}>
        {activeTab === 'nativebox' && (
          <div className="nativebox-skin" style={{ width: '100%', maxWidth: playerSizePercent >= 100 ? '100%' : `${playerSizePercent}%`, margin: '0 auto', transition: 'max-width 0.2s ease' }}>
            <NativeBoxPlayer
              videoSrc={videoSrc}
              videoTitle={videoTitle}
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              seekTrigger={seekTrigger}
              onTimeUpdate={handleTimeUpdate}
              onSelectSegment={handleSelectSegment}
              isRepeatSentence={isRepeatSentence}
              setIsRepeatSentence={setIsRepeatSentence}
              screenMode={screenMode}
              setScreenMode={setScreenMode}
              playerSizePercent={playerSizePercent}
              setPlayerSizePercent={setPlayerSizePercent}
              captionMode={captionMode}
              setCaptionMode={setCaptionMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
              playlist={playlist}
              onSelectPlaylistItem={handleSelectPlaylistItem}
              onAddFile={handleAddFileToPlaylist}
              onDeleteFile={handleDeletePlaylistItem}
              checkedIndices={checkedIndices}
            />

            <SubtitleScriptViewer
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              onSelectSegment={handleSelectSegment}
              captionMode={captionMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
              checkedIndices={checkedIndices}
              setCheckedIndices={setCheckedIndices}
              playerSizePercent={playerSizePercent}
            />
          </div>
        )}

        {activeTab === 'editor' && (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <SubtitleEditor
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              onSelectSegment={handleSelectSegment}
              onUpdateSegment={handleUpdateSegment}
              onDeleteSegment={handleDeleteSegment}
              onAddSegment={handleAddSegment}
            />
          </div>
        )}

        {activeTab === 'ai' && (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <AiSegmenter
              onMediaLoaded={(url) => setVideoSrc(url)}
              onSegmentsGenerated={(newSegments, mediaUrl, mediaFileName) => {
                setSegments(newSegments);
                setVideoSrc(mediaUrl);
                setVideoTitle(mediaFileName);
                setPlaylist(prev => {
                  const filtered = prev.filter(p => p.name !== mediaFileName);
                  return [...filtered, { id: Date.now(), name: mediaFileName, url: mediaUrl, segments: newSegments }];
                });
                setCurrentSegmentIndex(0);
                setActiveTab('nativebox');
              }}
            />
          </div>
        )}
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
