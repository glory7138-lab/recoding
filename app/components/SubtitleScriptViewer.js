'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SubtitleScriptViewer({
  segments,
  currentSegmentIndex,
  onSelectSegment,
  captionMode = 'EK',
  fontSize = 'medium'
}) {
  const activeRef = useRef(null);

  // Auto-scroll into view when active segment changes
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentSegmentIndex]);

  const getFontSizePx = () => {
    switch (fontSize) {
      case 'small': return '15px';
      case 'large': return '22px';
      default: return '18px';
    }
  };

  const jumpPrev = () => {
    if (currentSegmentIndex > 0) {
      onSelectSegment(currentSegmentIndex - 1);
    }
  };

  const jumpNext = () => {
    if (currentSegmentIndex < segments.length - 1) {
      onSelectSegment(currentSegmentIndex + 1);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginTop: 8 }}>
      {/* Left Large Nav Arrow Button */}
      <button
        className="nb-bevel-btn"
        onClick={jumpPrev}
        style={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 42,
          height: 42,
          borderRadius: '50%',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }}
        title="이전 문장"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Main Subtitle Script Container */}
      <div
        className="nb-script-container"
        style={{ fontSize: getFontSizePx(), paddingLeft: 28, paddingRight: 28 }}
      >
        {segments && segments.length > 0 ? (
          segments.map((seg, idx) => {
            const isActive = idx === currentSegmentIndex;
            return (
              <div
                key={seg.id || idx}
                ref={isActive ? activeRef : null}
                className={`nb-script-item ${isActive ? 'active-sentence' : ''}`}
                onClick={() => onSelectSegment(idx)}
              >
                <div className="nb-script-icon" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* English Text */}
                  {(captionMode === 'E' || captionMode === 'EK' || captionMode === 'X') && (
                    <div style={{ color: isActive ? '#0033cc' : '#222', fontWeight: isActive ? 'bold' : 'normal' }}>
                      {seg.text}
                    </div>
                  )}

                  {/* Korean Translation */}
                  {(captionMode === 'K' || captionMode === 'EK') && seg.translation && (
                    <div style={{
                      color: isActive ? '#0066cc' : '#555566',
                      fontSize: '0.88em',
                      fontFamily: 'sans-serif',
                      fontWeight: 'normal'
                    }}>
                      {seg.translation}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>
            로드된 자막이 없습니다. 영상이나 자막 파일(.srt)을 불러와 주세요.
          </div>
        )}
      </div>

      {/* Right Large Nav Arrow Button */}
      <button
        className="nb-bevel-btn"
        onClick={jumpNext}
        style={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 42,
          height: 42,
          borderRadius: '50%',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }}
        title="다음 문장"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
