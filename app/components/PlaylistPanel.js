'use client';

import React from 'react';
import { List, Plus, Trash2, X, Music, CheckCircle2 } from 'lucide-react';

export default function PlaylistPanel({
  playlist = [],
  currentFileName = '',
  onSelectPlaylistItem,
  onAddFile,
  onDeleteFile,
  onClose
}) {
  return (
    <div
      className="nb-panel-outset"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 560,
        background: '#121622',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <List size={18} color="#00ff66" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
            재생 목록 (PLAYLIST)
          </span>
          <span
            style={{
              fontSize: 10,
              color: '#00ff66',
              background: 'rgba(0,255,102,0.12)',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 600
            }}
          >
            {playlist.length}개
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="목록 접기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Playlist File Items Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {playlist && playlist.length > 0 ? (
          playlist.map((item, idx) => {
            const isSelected = item.name === currentFileName || item.url === currentFileName;
            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectPlaylistItem && onSelectPlaylistItem(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: isSelected
                    ? 'linear-gradient(90deg, rgba(0,255,102,0.15) 0%, rgba(0,255,102,0.05) 100%)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? '#00ff66' : 'rgba(255,255,255,0.06)'}`,
                  marginBottom: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 10px rgba(0,255,102,0.1)' : 'none'
                }}
              >
                <div style={{ color: isSelected ? '#00ff66' : '#6b7280', display: 'flex', alignItems: 'center' }}>
                  {isSelected ? <CheckCircle2 size={16} /> : <Music size={14} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#00ff66' : '#e5e7eb',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.segments && item.segments.length > 0
                      ? `✅ ${item.segments.length}개 문장 구간 분할됨`
                      : '문장 미분할 파일'}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            등록된 재생 목록이 없습니다.
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div
        style={{
          padding: 10,
          background: 'rgba(0,0,0,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: 8
        }}
      >
        <button
          onClick={onAddFile}
          className="nb-bevel-btn active-green"
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: 4
          }}
        >
          <Plus size={14} />
          <span>파일 추가</span>
        </button>
        <button
          onClick={onDeleteFile}
          className="nb-bevel-btn"
          style={{
            padding: '10px 14px',
            fontSize: 12,
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
          title="선택된 파일 삭제"
        >
          <Trash2 size={14} />
          <span>삭제</span>
        </button>
      </div>
    </div>
  );
}
