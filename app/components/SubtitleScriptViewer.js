'use client';

import React, { useRef, useEffect } from 'react';
import { Play } from 'lucide-react';

export default function SubtitleScriptViewer({
  segments = [],
  currentSegmentIndex,
  onSelectSegment,
  captionMode = 'EK',
  fontSize = 16,
  setFontSize,
  checkedIndices = [],
  setCheckedIndices,
  playerSizePercent = 100
}) {
  const activeRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll ONLY INSIDE the script container box (never scroll the main page window!)
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const item = activeRef.current;

      const itemTop = item.offsetTop - container.offsetTop;
      const itemHeight = item.offsetHeight;
      const containerHeight = container.clientHeight;

      const targetScrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }, [currentSegmentIndex]);

  const getFontSizePx = () => {
    const scale = (typeof playerSizePercent === 'number' ? playerSizePercent : 100) / 100;
    if (typeof fontSize === 'number') {
      const base = fontSize * 0.9;
      return `${Math.max(10, Math.round(base * scale))}px`;
    }
    switch (fontSize) {
      case 'small': return `${Math.round(11 * scale)}px`;
      case 'large': return `${Math.round(20 * scale)}px`;
      default: return `${Math.round(14 * scale)}px`;
    }
  };

  const formatSecs = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle individual sentence checkbox without playing video
  const toggleCheckbox = (idx, e) => {
    e.stopPropagation(); // Stop click from playing video
    if (!setCheckedIndices) return;

    let nextChecked;
    if (checkedIndices.includes(idx)) {
      nextChecked = checkedIndices.filter(i => i !== idx);
    } else {
      nextChecked = [...checkedIndices, idx].sort((a, b) => a - b);
    }
    setCheckedIndices(nextChecked);
  };

  // Master Checkbox: Select All / Clear All
  const isAllChecked = segments.length > 0 && checkedIndices.length === segments.length;

  const toggleMasterCheckbox = (e) => {
    e.stopPropagation();
    if (!setCheckedIndices || !segments) return;

    if (isAllChecked) {
      setCheckedIndices([]);
    } else {
      setCheckedIndices(segments.map((_, i) => i));
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginTop: 14 }}>
      
      {/* 📋 Master Checkbox Top Header Bar with Right-Aligned Font Size Controls */}
      <div style={{
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px 12px 0 0',
        padding: '14px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        gap: 16
      }}>
        {/* Left: Master Checkbox */}
        <div
          onClick={toggleMasterCheckbox}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
          title="클릭 시 자막 전체 선택 / 해제"
        >
          <input
            type="checkbox"
            checked={isAllChecked}
            onChange={toggleMasterCheckbox}
            style={{ width: 24, height: 24, accentColor: '#10b981', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 20, color: '#f8fafc', fontWeight: '800' }}>☐ 전체 선택</span>
          <span style={{ fontSize: 16, color: '#94a3b8', marginLeft: 6, fontWeight: '600' }}>
            ({checkedIndices.length} / {segments.length}개 선택됨)
          </span>
        </div>

        {/* Center: Hint */}
        <div style={{ fontSize: 16, color: '#38bdf8', fontWeight: '600' }}>
          💡 체크 선택 없음 ➔ 우측 [반복] 누르면 "전체 영상" 반복
        </div>

        {/* Right: Font Size Controls */}
        {setFontSize && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} title="자막 글자 크기 미세 조절">
            <span style={{ fontSize: 16, color: '#94a3b8', marginRight: 4, fontWeight: '600' }}>글자</span>
            <button
              className="nb-bevel-btn"
              style={{ padding: '4px 12px', fontSize: 16, fontWeight: 'bold' }}
              onClick={() => setFontSize(Math.max(10, (typeof fontSize === 'number' ? fontSize : 14) - 2))}
              title="글자 크기 축소 (-2px)"
            >
              -
            </button>
            <span
              onClick={() => setFontSize(14)}
              style={{ fontSize: 15, fontWeight: 'bold', color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}
              title="기본 14px 복원"
            >
              {typeof fontSize === 'number' ? `${fontSize}px` : '14px'}
            </span>
            <button
              className="nb-bevel-btn"
              style={{ padding: '4px 12px', fontSize: 16, fontWeight: 'bold' }}
              onClick={() => setFontSize(Math.min(48, (typeof fontSize === 'number' ? fontSize : 14) + 2))}
              title="글자 크기 확대 (+2px)"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Main Subtitle Script Container (Sized to fit 6~7 items simultaneously with double font scale) */}
      <div
        ref={containerRef}
        className="nb-script-container"
        style={{
          fontSize: getFontSizePx(),
          paddingLeft: 20,
          paddingRight: 20,
          borderRadius: '0 0 12px 12px',
          borderTop: 'none',
          maxHeight: Math.max(480, Math.round(520 * (playerSizePercent / 100)))
        }}
      >
        {segments && segments.length > 0 ? (
          segments.map((seg, idx) => {
            const isActive = idx === currentSegmentIndex;
            const isChecked = checkedIndices.includes(idx);

            return (
              <div
                key={seg.id || idx}
                ref={isActive ? activeRef : null}
                className={`nb-script-item ${isActive ? 'active-sentence' : ''}`}
                onClick={() => onSelectSegment(idx)} // Click text area -> Play Video Immediately!
                style={{
                  padding: '6px 10px',
                  marginBottom: 5,
                  gap: 8,
                  background: isActive ? '#ecfdf5' : isChecked ? '#f0fdf4' : '#f8fafc',
                  border: isActive
                    ? '2px solid #10b981'
                    : isChecked
                    ? '1px solid #34d399'
                    : '1px solid #e2e8f0',
                  boxShadow: isChecked ? '0 2px 8px rgba(16,185,129,0.1)' : 'none'
                }}
              >
                {/* 1. CHECKBOX (Clicking checkbox toggles selection WITHOUT playing video) */}
                <div
                  onClick={(e) => toggleCheckbox(idx, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    padding: '6px',
                    cursor: 'pointer',
                    borderRadius: 6,
                    flexShrink: 0
                  }}
                  title="체크 시 우측 플레이어 반복 버튼으로 선택 문장 묶음 재생"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleCheckbox(idx, e)}
                    style={{
                      width: 22,
                      height: 22,
                      accentColor: '#10b981',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* 2. Sentence Number & Timestamp Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 2 }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isActive || isChecked ? '#047857' : '#475569',
                    background: isActive || isChecked ? '#d1fae5' : '#e2e8f0',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: `1px solid ${isActive || isChecked ? '#6ee7b7' : '#cbd5e1'}`
                  }}>
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: isActive || isChecked ? '#059669' : '#64748b',
                    fontWeight: '600'
                  }}>
                    {formatSecs(seg.start)}
                  </span>
                </div>

                {/* 3. Subtitle Text Area (Clicking text plays video immediately) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* English Text */}
                  {(captionMode === 'E' || captionMode === 'EK' || captionMode === 'X') && (
                    <div style={{
                      color: isActive ? '#0f172a' : '#1e293b',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '1.02em',
                      lineHeight: 1.5
                    }}>
                      {seg.text}
                    </div>
                  )}

                  {/* Korean Translation */}
                  {(captionMode === 'K' || captionMode === 'EK') && seg.translation && (
                    <div style={{
                      color: isActive ? '#0369a1' : '#334155',
                      fontSize: '0.94em',
                      fontWeight: isActive ? 600 : 500,
                      lineHeight: 1.4
                    }}>
                      {seg.translation}
                    </div>
                  )}
                </div>

                {/* 4. Active Status Indicator */}
                {isActive && (
                  <div style={{
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    background: '#d1fae5',
                    padding: '3px 9px',
                    borderRadius: 12,
                    border: '1px solid #6ee7b7',
                    flexShrink: 0
                  }}>
                    <Play size={10} fill="#047857" />
                    <span>재생 중</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ color: '#64748b', textAlign: 'center', padding: 40, fontSize: 13 }}>
            자막 스크립트 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
