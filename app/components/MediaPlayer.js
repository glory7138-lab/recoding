'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Repeat, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

export default function MediaPlayer({
  videoSrc,
  segments,
  currentSegmentIndex,
  onTimeUpdate,
  onSelectSegment,
  isRepeatSentence,
  setIsRepeatSentence
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showKorean, setShowKorean] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Jump to start time when user selects a sentence from table
  useEffect(() => {
    if (currentSegmentIndex !== null && segments[currentSegmentIndex] && videoRef.current) {
      const targetTime = segments[currentSegmentIndex].start;
      if (Math.abs(videoRef.current.currentTime - targetTime) > 0.5) {
        videoRef.current.currentTime = targetTime;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [currentSegmentIndex]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Sync Video Time Update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate(time);

    // Sentence Level Loop Logic (구간 반복)
    if (isRepeatSentence && currentSegmentIndex !== null && segments[currentSegmentIndex]) {
      const seg = segments[currentSegmentIndex];
      if (time >= seg.end) {
        videoRef.current.currentTime = seg.start;
      }
    }
  };

  // Change Playback Speed
  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Seek to Specific Time
  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Replay Current Sentence
  const replayCurrentSentence = () => {
    if (currentSegmentIndex !== null && segments[currentSegmentIndex]) {
      seekTo(segments[currentSegmentIndex].start);
    } else {
      seekTo(0);
    }
  };

  // Jump to Prev / Next Sentence
  const jumpPrevSentence = () => {
    if (currentSegmentIndex > 0) {
      onSelectSegment(currentSegmentIndex - 1);
    }
  };

  const jumpNextSentence = () => {
    if (currentSegmentIndex < segments.length - 1) {
      onSelectSegment(currentSegmentIndex + 1);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const currentSeg = currentSegmentIndex !== null ? segments[currentSegmentIndex] : null;

  // Drag and Drop media file loading
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        onSelectSegment(0);
        if (typeof window !== 'undefined' && window.onHeaderMediaSelect) {
          window.onHeaderMediaSelect(url, file.name);
        }
      }
    }
  };

  return (
    <div className="left-panel">
      {/* Video Screen Container */}
      <div 
        className="video-container"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <video
          ref={videoRef}
          src={videoSrc || '/sample.mp4'}
          className="video-element"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current ? videoRef.current.duration : 0)}
          onClick={togglePlay}
        />

        {/* Live Subtitle Overlay */}
        {currentSeg && (
          <div className="subtitle-overlay">
            {showEnglish && currentSeg.text && (
              <div className="sub-en">{currentSeg.text}</div>
            )}
            {showKorean && currentSeg.translation && (
              <div className="sub-ko">{currentSeg.translation}</div>
            )}
          </div>
        )}
      </div>

      {/* Control Bar Panel */}
      <div className="glass-panel player-controls">
        {/* Timeline Bar */}
        <div className="timeline-bar" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          seekTo(pos * duration);
        }}>
          <div
            className="timeline-progress"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Control Buttons Row */}
        <div className="control-buttons-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button className="btn-icon btn-primary" onClick={togglePlay}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span>{isPlaying ? '일시정지' : '재생'}</span>
            </button>

            <button
              className="btn-icon"
              onClick={replayCurrentSentence}
              title="현재 문장 처음부터 다시 재생"
              style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.1)' }}
            >
              <RotateCcw size={16} />
              <span>문장 반복</span>
            </button>

            <button className="btn-icon" onClick={jumpPrevSentence} title="이전 문장">
              <SkipBack size={16} />
              <span>이전</span>
            </button>

            <button className="btn-icon" onClick={jumpNextSentence} title="다음 문장">
              <SkipForward size={16} />
              <span>다음</span>
            </button>

            <button
              className={`btn-icon ${isRepeatSentence ? 'btn-success' : ''}`}
              onClick={() => setIsRepeatSentence(!isRepeatSentence)}
              title="한 문장 무한 구간 반복"
            >
              <Repeat size={16} />
              <span>{isRepeatSentence ? '🔁 구간반복 ON' : '구간반복 OFF'}</span>
            </button>
          </div>

          {/* Speed & Subtitle Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Speed Selector */}
            <select
              value={playbackRate}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 13
              }}
            >
              <option value="0.5" style={{ background: '#121524' }}>0.5x 속도</option>
              <option value="0.75" style={{ background: '#121524' }}>0.75x 속도</option>
              <option value="1.0" style={{ background: '#121524' }}>1.0x (일반)</option>
              <option value="1.25" style={{ background: '#121524' }}>1.25x 속도</option>
              <option value="1.5" style={{ background: '#121524' }}>1.5x 속도</option>
            </select>

            {/* English Subtitle Toggle */}
            <button
              className={`btn-icon ${showEnglish ? '' : 'btn-dim'}`}
              onClick={() => setShowEnglish(!showEnglish)}
              title="영어 자막 표시/숨김"
              style={{ opacity: showEnglish ? 1 : 0.4 }}
            >
              <span>ENG</span>
            </button>

            {/* Korean Subtitle Toggle */}
            <button
              className={`btn-icon ${showKorean ? '' : 'btn-dim'}`}
              onClick={() => setShowKorean(!showKorean)}
              title="한글 자막 표시/숨김"
              style={{ opacity: showKorean ? 1 : 0.4 }}
            >
              <span>한글</span>
            </button>
          </div>
        </div>

        {/* Time info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          {currentSeg && (
            <span>선택된 구간: {currentSeg.start.toFixed(2)}s ~ {currentSeg.end.toFixed(2)}s (문장 #{currentSeg.id})</span>
          )}
        </div>
      </div>
    </div>
  );
}
