'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Square, FileText, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

export default function NativeBoxPlayer({
  videoSrc,
  videoTitle = 'About.Time.2013[1].avi',
  segments,
  currentSegmentIndex,
  onTimeUpdate,
  onSelectSegment,
  isRepeatSentence,
  setIsRepeatSentence,
  screenMode = 'normal',
  setScreenMode,
  captionMode = 'EK', // 'X' | 'E' | 'K' | 'EK'
  setCaptionMode,
  fontSize = 'medium', // 'small' | 'medium' | 'large'
  setFontSize,
  onToggleContentsList,
  showContentsList
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(104);
  const [volume, setVolume] = useState(0.8);

  // Jump to target time on segment change
  useEffect(() => {
    if (currentSegmentIndex !== null && segments[currentSegmentIndex] && videoRef.current) {
      const targetTime = segments[currentSegmentIndex].start;
      if (Math.abs(videoRef.current.currentTime - targetTime) > 0.5) {
        videoRef.current.currentTime = targetTime;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [currentSegmentIndex, segments]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlay = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate(time);

    // Sentence repeat logic
    if (isRepeatSentence && currentSegmentIndex !== null && segments[currentSegmentIndex]) {
      const seg = segments[currentSegmentIndex];
      if (time >= seg.end) {
        videoRef.current.currentTime = seg.start;
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

  const formatTimeStr = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSeg = currentSegmentIndex !== null ? segments[currentSegmentIndex] : null;

  return (
    <div className="nb-panel-outset" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* 1. Top Header Bar */}
      <div className="nb-header-bar">
        <div className="nb-header-title">
          <span className="nb-brand-name">NativeBOX.com</span>
          <span className="nb-file-title">{videoTitle || '[null]'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'monospace', color: '#10b981', background: '#000', padding: '1px 6px', borderRadius: 2 }}>
            {formatTimeStr(currentTime)} / {formatTimeStr(duration)}
          </span>
          <div className="nb-window-controls">
            <button className="nb-win-btn">-</button>
            <button className="nb-win-btn">×</button>
          </div>
        </div>
      </div>

      {/* 2. Main Middle Player Layout (Left Screen Controls - Video - Right Controls) */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 170px', gap: 8, alignItems: 'stretch' }}>
        {/* Left Side: Screen & Volume Controls */}
        <div className="nb-panel-inset" style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 'bold', color: '#444', marginBottom: 6 }}>Screen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <button
                className={`nb-bevel-btn ${screenMode === 'normal' ? 'active-green' : ''}`}
                onClick={() => setScreenMode('normal')}
              >
                <span>🟢 Normal Screen</span>
              </button>
              <button
                className={`nb-bevel-btn ${screenMode === 'big' ? 'active-green' : ''}`}
                onClick={() => setScreenMode('big')}
              >
                <span>📺 Big Screen</span>
              </button>
              <button
                className={`nb-bevel-btn ${screenMode === 'full' ? 'active-green' : ''}`}
                onClick={() => setScreenMode('full')}
              >
                <span>🖥️ Full Screen</span>
              </button>
              <button
                className={`nb-bevel-btn ${screenMode === 'caption' ? 'active-green' : ''}`}
                onClick={() => setScreenMode('caption')}
              >
                <span>💬 Caption Screen</span>
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#555' }}>
              <Volume2 size={12} />
              <span>Volume</span>
            </div>
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
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Center: Video Screen Display */}
        <div style={{
          background: '#000',
          border: '2px solid #5a5f68',
          borderRadius: 4,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          minHeight: '260px'
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
              bottom: 12,
              left: 12,
              right: 12,
              textAlign: 'center',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              {(captionMode === 'E' || captionMode === 'EK') && currentSeg.text && (
                <span style={{
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                  fontSize: 16,
                  fontFamily: 'serif',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '2px 8px',
                  borderRadius: 3,
                  alignSelf: 'center'
                }}>
                  {currentSeg.text}
                </span>
              )}
              {(captionMode === 'K' || captionMode === 'EK') && currentSeg.translation && (
                <span style={{
                  color: '#38bdf8',
                  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                  fontSize: 14,
                  background: 'rgba(0,0,0,0.6)',
                  padding: '2px 8px',
                  borderRadius: 3,
                  alignSelf: 'center'
                }}>
                  {currentSeg.translation}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Side: List, Sentence Navigation & Caption Buttons */}
        <div className="nb-panel-inset" style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'space-between' }}>
          {/* List & Edit icons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`nb-bevel-btn ${showContentsList ? 'active-green' : ''}`}
              style={{ flex: 1, padding: '6px 0' }}
              onClick={onToggleContentsList}
            >
              List
            </button>
            <button className="nb-bevel-btn" style={{ width: 36 }} title="Memo / Note">
              <FileText size={14} />
            </button>
          </div>

          {/* Previous / Next Sentence Nav Buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="nb-bevel-btn" style={{ flex: 1 }} onClick={jumpPrev} title="이전 문장">
              <ChevronLeft size={16} />
            </button>
            <button className="nb-bevel-btn" style={{ flex: 1 }} onClick={jumpNext} title="다음 문장">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Caption Mode Selector */}
          <div style={{ background: '#a7abb4', padding: 6, borderRadius: 4, border: '1px solid #7d818a' }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>Caption</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <button
                className={`nb-bevel-btn ${captionMode === 'X' ? 'active-blue' : ''}`}
                onClick={() => setCaptionMode('X')}
              >
                X
              </button>
              <button
                className={`nb-bevel-btn ${captionMode === 'E' ? 'active-green' : ''}`}
                onClick={() => setCaptionMode('E')}
              >
                E
              </button>
              <button
                className={`nb-bevel-btn ${captionMode === 'K' ? 'active-green' : ''}`}
                onClick={() => setCaptionMode('K')}
              >
                K
              </button>
              <button
                className={`nb-bevel-btn ${captionMode === 'EK' ? 'active-blue' : ''}`}
                onClick={() => setCaptionMode('EK')}
              >
                E/K
              </button>
            </div>
          </div>

          {/* Bottom Play / Stop Buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="nb-bevel-btn active-green" style={{ flex: 1, padding: '8px 0' }} onClick={togglePlay}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className="nb-bevel-btn" style={{ flex: 1, padding: '8px 0' }} onClick={stopPlay}>
              <Square size={14} fill="#666" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Timeline Scrubber & Font Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '2px 4px' }}>
        {/* Scrubber Bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
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
              accentColor: '#52d62e',
              cursor: 'pointer',
              height: 6
            }}
          />
        </div>

        {/* Font Size Controls (tT, T, T+) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className={`nb-bevel-btn ${fontSize === 'small' ? 'pressed' : ''}`}
            style={{ padding: '2px 6px', fontSize: 10 }}
            onClick={() => setFontSize('small')}
            title="작은 폰트"
          >
            tT
          </button>
          <button
            className={`nb-bevel-btn ${fontSize === 'medium' ? 'pressed' : ''}`}
            style={{ padding: '2px 6px', fontSize: 11 }}
            onClick={() => setFontSize('medium')}
            title="중간 폰트"
          >
            T
          </button>
          <button
            className={`nb-bevel-btn ${fontSize === 'large' ? 'pressed' : ''}`}
            style={{ padding: '2px 6px', fontSize: 12, fontWeight: 'bold' }}
            onClick={() => setFontSize('large')}
            title="큰 폰트"
          >
            T+
          </button>
        </div>
      </div>
    </div>
  );
}
