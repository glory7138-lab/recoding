'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Square, FileText, ChevronLeft, ChevronRight, Volume2, Plus, List, CheckCircle2, Music, Trash2, Monitor } from 'lucide-react';

export default function NativeBoxPlayer({
  videoSrc,
  videoTitle = 'About.Time.2013[1].avi',
  segments,
  currentSegmentIndex,
  seekTrigger,
  onTimeUpdate,
  onSelectSegment,
  isRepeatSentence,
  setIsRepeatSentence,
  screenMode = 'normal',
  setScreenMode,
  playerSizePercent = 100,
  setPlayerSizePercent,
  captionMode = 'EK', // 'X' | 'E' | 'K' | 'EK'
  setCaptionMode,
  fontSize = 'medium', // 'small' | 'medium' | 'large'
  setFontSize,
  playlist = [],
  onSelectPlaylistItem,
  onAddFile,
  onDeleteFile,
  checkedIndices = []
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(104);
  const [volume, setVolume] = useState(0.8);
  const [playOnceUntil, setPlayOnceUntil] = useState(null);
  const [repeatTargetCount, setRepeatTargetCountState] = useState('infinite'); // 'infinite' | 1 | 2 | 3 ... 10
  const [repeatCurrentCount, setRepeatCurrentCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load saved repeat count and sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nb_repeat_target_count');
      if (saved !== null) {
        if (saved === 'infinite') {
          setRepeatTargetCountState('infinite');
        } else if (!isNaN(Number(saved))) {
          const num = Number(saved);
          if (num >= 1 && num <= 10) {
            setRepeatTargetCountState(num);
          }
        }
      }
      const savedSidebar = localStorage.getItem('nb_sidebar_open');
      if (savedSidebar !== null) {
        setIsSidebarOpen(savedSidebar === 'true');
      }
    } catch (e) {}
  }, []);

  const setRepeatTargetCount = (val) => {
    setRepeatTargetCountState(val);
    try {
      localStorage.setItem('nb_repeat_target_count', String(val));
    } catch (e) {}
  };

  // Calculate range timestamps if checkboxes are selected
  const hasChecked = checkedIndices && checkedIndices.length > 0 && segments && segments.length > 0;
  const minCheckedIdx = hasChecked ? Math.min(...checkedIndices) : null;
  const maxCheckedIdx = hasChecked ? Math.max(...checkedIndices) : null;
  const checkedStartTime = hasChecked && segments[minCheckedIdx] ? segments[minCheckedIdx].start : null;
  const checkedEndTime = hasChecked && segments[maxCheckedIdx] ? segments[maxCheckedIdx].end : null;

  // Jump to target time unconditionally when user explicitly clicks a sentence
  useEffect(() => {
    if (seekTrigger && seekTrigger.time !== undefined && videoRef.current) {
      setPlayOnceUntil(null);
      setRepeatCurrentCount(0);
      videoRef.current.currentTime = seekTrigger.time;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [seekTrigger]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    setPlayOnceUntil(null);
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (isRepeatSentence && hasChecked && checkedStartTime !== null) {
        if (videoRef.current.currentTime < checkedStartTime - 0.3) {
          videoRef.current.currentTime = checkedStartTime;
        }
      }
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlay = () => {
    if (!videoRef.current) return;
    setPlayOnceUntil(null);
    setRepeatCurrentCount(0);
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate(time);

    // 1회 재생 멈춤 로직 (Play once until target end)
    if (playOnceUntil !== null) {
      if (hasChecked && checkedStartTime !== null && time < checkedStartTime - 0.3) {
        videoRef.current.currentTime = checkedStartTime;
        return;
      }
      if (time >= playOnceUntil) {
        videoRef.current.pause();
        setIsPlaying(false);
        setPlayOnceUntil(null);
        return;
      }
    }

    // N회 반복 / ∞ 무한 반복 로직
    if (isRepeatSentence) {
      let targetEndTime = null;
      let targetStartTime = 0;

      if (hasChecked && checkedStartTime !== null && checkedEndTime !== null) {
        targetStartTime = checkedStartTime;
        targetEndTime = checkedEndTime;
      } else {
        targetStartTime = 0;
        targetEndTime = duration || (segments && segments.length > 0 ? segments[segments.length - 1].end : 0);
      }

      // 체크된 시작 시점보다 현재 재생 시간이 이전인 경우( time < targetStartTime - 0.3 )
      // Electron 비동기 seek 타이밍 문제로 1번 문장이 먼저 재생되는 현상을 완벽히 차단하고 즉시 targetStartTime으로 이동
      if (hasChecked && targetStartTime !== null && time < targetStartTime - 0.3) {
        videoRef.current.currentTime = targetStartTime;
        return;
      }

      if (targetEndTime !== null && time >= targetEndTime) {
        const nextDoneCount = repeatCurrentCount + 1;
        setRepeatCurrentCount(nextDoneCount);

        if (repeatTargetCount !== 'infinite' && nextDoneCount >= Number(repeatTargetCount)) {
          // 지정한 N회 반복 완성 ➔ 멈춤 및 반복 해제
          videoRef.current.pause();
          setIsPlaying(false);
          setIsRepeatSentence(false);
          setRepeatCurrentCount(0);
        } else {
          // 다시 시작 시점으로 되돌아가 다음 반복 시작
          videoRef.current.currentTime = targetStartTime;
        }
      }
    }
  };

  const jumpPrev = () => {
    if (currentSegmentIndex > 0) {
      onSelectSegment(currentSegmentIndex - 1);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const jumpNext = () => {
    if (currentSegmentIndex < segments.length - 1) {
      onSelectSegment(currentSegmentIndex + 1);
    }
  };

  // Handle '1회' Play Button Click
  const handlePlayOnce = () => {
    if (!videoRef.current) return;

    if (hasChecked && checkedStartTime !== null && checkedEndTime !== null) {
      // 체크 선택 있음 ➔ 선택 구간 1회 재생 후 멈춤
      videoRef.current.currentTime = checkedStartTime;
      setPlayOnceUntil(checkedEndTime);
      if (minCheckedIdx !== null && onSelectSegment) onSelectSegment(minCheckedIdx);
    } else {
      // 체크 선택 없음 ➔ 전체 영상 1회 재생 후 멈춤
      const videoTotalEnd = duration || (segments && segments.length > 0 ? segments[segments.length - 1].end : 0);
      videoRef.current.currentTime = 0;
      setPlayOnceUntil(videoTotalEnd);
      if (segments && segments.length > 0 && onSelectSegment) onSelectSegment(0);
    }
    const playPromise = videoRef.current.play();
    if (playPromise && playPromise.then) {
      playPromise.then(() => {
        if (videoRef.current && hasChecked && checkedStartTime !== null) {
          if (videoRef.current.currentTime < checkedStartTime - 0.3) {
            videoRef.current.currentTime = checkedStartTime;
          }
        }
      }).catch(() => {});
    }
    setIsPlaying(true);
  };

  const formatTimeStr = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSeg = currentSegmentIndex !== null ? segments[currentSegmentIndex] : null;

  return (
    <div className="nb-panel-outset" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* 1. Top Header Bar (Doubled Font & Element Sizes) */}
      <div className="nb-header-bar" style={{ minHeight: 48, padding: '8px 14px' }}>
        <div className="nb-header-title" style={{ gap: 14 }}>
          <span className="nb-brand-name" style={{ fontSize: 20, fontWeight: '800' }}>NativeBOX AI Player</span>
          <span className="nb-file-title" style={{ fontSize: 16, padding: '4px 12px' }}>{videoTitle || '[null]'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            className={`nb-bevel-btn ${isSidebarOpen ? 'active-green' : ''}`}
            onClick={() => {
              const next = !isSidebarOpen;
              setIsSidebarOpen(next);
              try { localStorage.setItem('nb_sidebar_open', String(next)); } catch (e) {}
            }}
            style={{ padding: '8px 16px', fontSize: 16, fontWeight: '800' }}
            title={isSidebarOpen ? "우측 제어창/목록 접기 (영상을 100% 가득 찬 상태로 크게 보기)" : "우측 제어창/목록 펼치기"}
          >
            {isSidebarOpen ? '▶ 제어창/목록 접기' : '◀ 제어창/목록 펼치기'}
          </button>
          <span style={{ fontFamily: 'monospace', color: '#10b981', background: 'rgba(0,0,0,0.6)', padding: '6px 14px', borderRadius: 6, fontSize: 18, fontWeight: '700' }}>
            {formatTimeStr(currentTime)} / {formatTimeStr(duration)}
          </span>
          <div className="nb-window-controls" style={{ gap: 6 }}>
            <button className="nb-win-btn" style={{ width: 26, height: 26, fontSize: 16 }}>-</button>
            <button className="nb-win-btn" style={{ width: 26, height: 26, fontSize: 16 }}>×</button>
          </div>
        </div>
      </div>

      {/* 2. Main Middle Player Layout (Video 1fr - Collapsible Right Controls 435px [1.5x Scale]) */}
      <div style={{ display: 'grid', gridTemplateColumns: isSidebarOpen ? '1fr 435px' : '1fr', gap: 12, alignItems: 'stretch', transition: 'all 0.3s ease' }}>

        {/* Center: Video Screen Display */}
        <div style={{
          background: '#000',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          overflow: 'hidden',
          aspectRatio: '16/9',
          width: '100%',
          maxHeight: isSidebarOpen ? Math.round(440 * (playerSizePercent / 100)) : Math.round(560 * (playerSizePercent / 100)),
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
        }}>
          <video
            ref={videoRef}
            src={videoSrc || '/sample.mp4'}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current ? videoRef.current.duration : 0)}
            onClick={togglePlay}
          />

          {/* Live Subtitle Overlay on Video */}
          {currentSeg && captionMode !== 'X' && (
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              textAlign: 'center',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              {(captionMode === 'E' || captionMode === 'EK') && currentSeg.text && (
                <span style={{
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.95)',
                  fontSize: 17,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 12px',
                  borderRadius: 6,
                  alignSelf: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {currentSeg.text}
                </span>
              )}
              {(captionMode === 'K' || captionMode === 'EK') && currentSeg.translation && (
                <span style={{
                  color: '#38bdf8',
                  textShadow: '0 2px 8px rgba(0,0,0,0.95)',
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 12px',
                  borderRadius: 6,
                  alignSelf: 'center',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}>
                  {currentSeg.translation}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Embedded LIST (Playlist) & Modern Player Controls (Collapsible - 435px Wide & 1.5x Font Sizes) */}
        {isSidebarOpen && (
          <div className="nb-panel-inset" style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'space-between', padding: 12 }}>
            {/* Scrollable Playlist Header */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 15, fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <List size={17} color="#10b981" />
                  <span>강의 / 재생 목록</span>
                  <span style={{ fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.2)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                    {playlist.length}
                  </span>
                </div>
                <button
                  className="nb-bevel-btn active-green"
                  style={{ padding: '3px 8px', fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={onAddFile}
                  title="새 파일 추가"
                >
                  <Plus size={14} />
                  <span>추가</span>
                </button>
              </div>

              {/* Scrollable Playlist Item List Box (Height reduced by ~25%) */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 6,
                height: Math.max(78, Math.round(92 * (playerSizePercent / 100))),
                overflowY: 'auto',
                padding: 4
              }}>
                {playlist && playlist.length > 0 ? (
                  playlist.map((item, idx) => {
                    const isSelected = item.name === videoTitle || item.url === videoSrc;
                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => onSelectPlaylistItem && onSelectPlaylistItem(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '5px 8px',
                          borderRadius: 5,
                          marginBottom: 3,
                          background: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                          border: isSelected ? '1.5px solid #10b981' : '1px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          background: isSelected ? '#10b981' : '#64748b',
                          flexShrink: 0
                        }} />
                        <span style={{
                          fontSize: 14,
                          color: isSelected ? '#34d399' : '#e2e8f0',
                          fontWeight: isSelected ? 'bold' : '500',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </span>
                        {item.segmentCount && (
                          <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                            {item.segmentCount}문장
                          </span>
                        )}
                        {playlist.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFile && onDeleteFile(item.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: 8 }}>목록 없음</div>
                )}
              </div>
            </div>

            {/* Screen Size Slider */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Monitor size={17} color="#10b981" />
                  <span>화면 배율 (Screen Size)</span>
                </span>
                <span style={{ fontSize: 15, fontWeight: '800', color: '#10b981' }}>{playerSizePercent}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="140"
                step="5"
                value={playerSizePercent}
                onChange={(e) => setPlayerSizePercent(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer', height: 6, marginBottom: 6 }}
                title="화면 크기 조절 슬라이더"
              />
              <div style={{ display: 'flex', gap: 5 }}>
                <button
                  className={`nb-bevel-btn ${playerSizePercent === 70 ? 'active-green' : ''}`}
                  style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 'bold' }}
                  onClick={() => setPlayerSizePercent(70)}
                >
                  70% (소)
                </button>
                <button
                  className={`nb-bevel-btn ${playerSizePercent === 100 ? 'active-green' : ''}`}
                  style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 'bold' }}
                  onClick={() => setPlayerSizePercent(100)}
                >
                  100%
                </button>
                <button
                  className={`nb-bevel-btn ${playerSizePercent === 120 ? 'active-green' : ''}`}
                  style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 'bold' }}
                  onClick={() => setPlayerSizePercent(120)}
                >
                  120% (대)
                </button>
                <button
                  className={`nb-bevel-btn ${playerSizePercent === 140 ? 'active-green' : ''}`}
                  style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 'bold' }}
                  onClick={() => setPlayerSizePercent(140)}
                >
                  140%
                </button>
              </div>
            </div>

            {/* Caption Language Mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 15, color: '#f8fafc', fontWeight: 800 }}>Caption Language</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                <button
                  className={`nb-bevel-btn ${captionMode === 'X' ? 'active-green' : ''}`}
                  style={{ fontSize: 13, padding: '9px 0', fontWeight: '800' }}
                  onClick={() => setCaptionMode('X')}
                >
                  OFF
                </button>
                <button
                  className={`nb-bevel-btn ${captionMode === 'E' ? 'active-green' : ''}`}
                  style={{ fontSize: 13, padding: '9px 0', fontWeight: '800' }}
                  onClick={() => setCaptionMode('E')}
                >
                  ENG
                </button>
                <button
                  className={`nb-bevel-btn ${captionMode === 'K' ? 'active-green' : ''}`}
                  style={{ fontSize: 13, padding: '9px 0', fontWeight: '800' }}
                  onClick={() => setCaptionMode('K')}
                >
                  KOR
                </button>
                <button
                  className={`nb-bevel-btn ${captionMode === 'EK' ? 'active-blue' : ''}`}
                  style={{ fontSize: 13, padding: '9px 0', fontWeight: '800' }}
                  onClick={() => setCaptionMode('EK')}
                >
                  E/K
                </button>
              </div>
            </div>

            {/* 🔁 Repeat Controls & Repeat Iteration Slider Card (1.5x Scale) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(16, 185, 129, 0.18) 100%)',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              {/* Top Row: Sentence Nav & Main Repeat Button */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="nb-bevel-btn" style={{ padding: '8px 14px' }} onClick={jumpPrev} title="이전 문장">
                  <ChevronLeft size={18} />
                </button>
                <button className="nb-bevel-btn" style={{ padding: '8px 14px' }} onClick={jumpNext} title="다음 문장">
                  <ChevronRight size={18} />
                </button>

                <button
                  className={`nb-bevel-btn ${isRepeatSentence ? 'active-green' : ''}`}
                  style={{ flex: 1, padding: '9px 0', fontSize: 14, fontWeight: '800' }}
                  onClick={() => {
                    const nextState = !isRepeatSentence;
                    setIsRepeatSentence(nextState);
                    setRepeatCurrentCount(0);
                    if (nextState && videoRef.current) {
                      const targetTime = (hasChecked && checkedStartTime !== null) ? checkedStartTime : 0;
                      if (hasChecked && minCheckedIdx !== null && onSelectSegment) {
                        onSelectSegment(minCheckedIdx);
                      }
                      videoRef.current.currentTime = targetTime;
                      const playPromise = videoRef.current.play();
                      if (playPromise && playPromise.then) {
                        playPromise.then(() => {
                          if (videoRef.current && Math.abs(videoRef.current.currentTime - targetTime) > 0.3) {
                            videoRef.current.currentTime = targetTime;
                          }
                        }).catch(() => {});
                      }
                      setIsPlaying(true);
                    }
                  }}
                  title={hasChecked ? `체크된 ${checkedIndices.length}개 문장 지정 횟수 반복` : "전체 영상 지정 횟수 반복"}
                >
                  {isRepeatSentence
                    ? (repeatTargetCount === 'infinite'
                        ? (hasChecked ? `🔁 구간(∞)` : '🔁 전체(∞)')
                        : `🔁 ${repeatCurrentCount + 1}/${repeatTargetCount}회`)
                    : '🔁 반복 실행'}
                </button>
              </div>

              {/* Bottom Row: Smooth Horizontal Repeat Count Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#10b981' }}>🔁</span> 반복 횟수 조절 (1회~10회, ∞)
                  </span>
                  <span style={{ fontSize: 13, fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.25)', padding: '2px 8px', borderRadius: 5 }}>
                    {repeatTargetCount === 'infinite' ? '∞ 무한' : `${repeatTargetCount}회`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="11"
                  step="1"
                  value={repeatTargetCount === 'infinite' ? 11 : repeatTargetCount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const target = val === 11 ? 'infinite' : val;
                    setRepeatTargetCount(target);
                    setRepeatCurrentCount(0);
                  }}
                  style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer', height: 6 }}
                  title="반복 횟수를 슬라이더로 조절하세요 (1회~10회 또는 ∞ 무한)"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#e2e8f0', padding: '0 2px', fontWeight: '700' }}>
                  <span>1회</span>
                  <span>3회</span>
                  <span>5회</span>
                  <span>10회</span>
                  <span style={{ color: '#10b981', fontWeight: '800' }}>∞ 무한</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 3. Integrated Bottom Toolbar (Timeline Scrubber matches exact video screen width) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isSidebarOpen ? '1fr 290px' : '1fr 250px',
        gap: 10,
        alignItems: 'center',
        padding: '6px 8px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.06)',
        marginTop: 4,
        transition: 'all 0.3s ease'
      }}>
        
        {/* Timeline Scrubber Bar (Exact 100% Width of Video Screen) */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '0 2px' }}>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value);
              setCurrentTime(t);
              if (videoRef.current) videoRef.current.currentTime = t;
            }}
            style={{
              width: '100%',
              accentColor: '#10b981',
              cursor: 'pointer',
              height: 6
            }}
            title="탐색 바 (Timeline Scrubber - 비디오 화면 가로폭과 100% 동일)"
          />
        </div>

        {/* Play / Pause, Stop & Volume Controls (Perfectly balanced with Repeat Card above) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          background: 'rgba(15, 23, 42, 0.4)',
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.06)',
          width: '100%'
        }}>
          {/* Play / Pause & Stop Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1.2 }}>
            <button
              className="nb-bevel-btn active-green"
              style={{ flex: 1.5, padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onClick={togglePlay}
              title={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span style={{ fontSize: 11, fontWeight: '700' }}>{isPlaying ? '일시정지' : '재생'}</span>
            </button>
            <button
              className="nb-bevel-btn"
              style={{ padding: '6px 10px' }}
              onClick={stopPlay}
              title="정지"
            >
              <Square size={13} fill="#64748b" />
            </button>
          </div>

          {/* Volume Control Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end', marginLeft: 8 }}>
            <Volume2 size={13} color="#94a3b8" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (videoRef.current) videoRef.current.volume = v;
              }}
              style={{ width: '100%', maxWidth: 90, accentColor: '#10b981', cursor: 'pointer', height: 4 }}
              title="음량 조절"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
