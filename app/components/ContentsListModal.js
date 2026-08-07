'use client';

import React from 'react';

export default function ContentsListModal({
  onClose,
  playlist = [],
  currentFileName = '',
  onSelectPlaylistItem,
  onAddFile,
  onDeleteFile
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 6,
        width: 320,
        background: '#181c28',
        border: '1px solid rgba(139,92,246,0.4)',
        borderRadius: 10,
        boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Dropdown Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontSize: 12,
        fontWeight: 700,
        color: '#fff'
      }}>
        <span>📋 재생 목록 ({playlist.length})</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Playlist Items */}
      <div style={{ maxHeight: 240, overflowY: 'auto', padding: 6 }}>
        {playlist && playlist.length > 0 ? (
          playlist.map((item, idx) => {
            const isSelected = item.name === currentFileName || item.url === currentFileName;
            return (
              <div
                key={item.id || idx}
                onClick={() => {
                  if (onSelectPlaylistItem) onSelectPlaylistItem(item);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(16,185,129,0.18)' : 'transparent',
                  border: `1px solid ${isSelected ? 'rgba(16,185,129,0.4)' : 'transparent'}`,
                  marginBottom: 4,
                  transition: 'all 0.15s'
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isSelected ? '#10b981' : '#4b5563'
                }} />
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: isSelected ? '#34d399' : '#e5e7eb', fontWeight: isSelected ? 600 : 400 }}>
                  {item.name}
                </div>
                {item.segments && (
                  <span style={{ fontSize: 10, color: isSelected ? '#6ee7b7' : '#9ca3af', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>
                    {item.segments.length}문장
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
            재생 목록이 비어 있습니다.
          </div>
        )}
      </div>

      {/* Footer Toolbar */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: 8,
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <button
          onClick={onAddFile}
          style={{
            flex: 1,
            padding: '6px 0',
            fontSize: 11,
            fontWeight: 600,
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.4)',
            color: '#60a5fa',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          + 파일 추가
        </button>
        <button
          onClick={onDeleteFile}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#f87171',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
