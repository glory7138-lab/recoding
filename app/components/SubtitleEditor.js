'use client';

import React from 'react';
import { Plus, Trash2, Clock, Edit2, Play, ArrowDown, ArrowUp } from 'lucide-react';

export default function SubtitleEditor({
  segments,
  currentSegmentIndex,
  onSelectSegment,
  onUpdateSegment,
  onDeleteSegment,
  onAddSegment
}) {
  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, overflow: 'hidden' }}>
      {/* Table Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
            NativeBOX 문장 자막 타임라인
          </h3>
          <span style={{
            fontSize: 12,
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--accent-blue)',
            padding: '2px 8px',
            borderRadius: 12,
            border: '1px solid var(--border-active)'
          }}>
            총 {segments.length}문장
          </span>
        </div>

        <button className="btn-icon" onClick={onAddSegment} style={{ fontSize: 12 }}>
          <Plus size={14} color="#10b981" />
          <span>문장 추가</span>
        </button>
      </div>

      {/* Table Wrapper */}
      <div className="table-wrapper">
        <table className="nativebox-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>시작</th>
              <th style={{ width: 110 }}>시작 시간</th>
              <th style={{ width: 110 }}>종료 시간</th>
              <th>원어 자막 (A) / 한글 자막 (카)</th>
              <th style={{ width: 130 }}>주석문</th>
              <th style={{ width: 50, textAlign: 'center' }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {segments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  등록된 문장이 없습니다. AI 자동 생성 버튼을 눌러보세요.
                </td>
              </tr>
            ) : (
              segments.map((seg, idx) => {
                const isActive = currentSegmentIndex === idx;
                return (
                  <tr
                    key={seg.id || idx}
                    className={`sentence-row ${isActive ? 'active-row' : ''}`}
                    onClick={() => onSelectSegment(idx)}
                  >
                    {/* Play Btn */}
                    <td>
                      <button
                        style={{
                          background: isActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.06)',
                          border: 'none',
                          color: '#fff',
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSegment(idx);
                        }}
                      >
                        <Play size={12} fill="#fff" />
                      </button>
                    </td>

                    {/* Start Time */}
                    <td>
                      <span className="time-badge">{formatTime(seg.start)}</span>
                    </td>

                    {/* End Time */}
                    <td>
                      <span className="time-badge">{formatTime(seg.end)}</span>
                    </td>

                    {/* Subtitle Content (En & Ko) */}
                    <td>
                      <div className="text-en-field">
                        <input
                          type="text"
                          value={seg.text}
                          onChange={(e) => onUpdateSegment(idx, 'text', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: 13,
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div className="text-ko-field">
                        <input
                          type="text"
                          value={seg.translation || ''}
                          placeholder="한글 번역 입력..."
                          onChange={(e) => onUpdateSegment(idx, 'translation', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#38bdf8',
                            fontSize: 12,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </td>

                    {/* Memo */}
                    <td>
                      <input
                        type="text"
                        value={seg.memo || ''}
                        placeholder="메모..."
                        onChange={(e) => onUpdateSegment(idx, 'memo', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 4,
                          color: 'var(--text-muted)',
                          fontSize: 11,
                          padding: '4px 6px'
                        }}
                      />
                    </td>

                    {/* Delete */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSegment(idx);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          opacity: 0.6
                        }}
                        title="문장 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
