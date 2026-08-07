'use client';

import React from 'react';
import { Sparkles, FolderOpen, FileText, Download, FileCode, HelpCircle } from 'lucide-react';

export default function Header({ onExportClick, activeCount, onMediaSelect, onSubtitleSelect, onOpenGuide }) {
  const handleMediaFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onMediaSelect(url, file.name);
    }
  };

  const handleSubtitleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onSubtitleSelect(event.target.result, file.name);
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  return (
    <header className="app-header">
      <div className="brand-logo">
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <span>NativeBOX <span style={{ color: '#38bdf8' }}>AI</span></span>
          <span className="badge-ai" style={{ marginLeft: 8 }}>V1.0 PRO</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Help Guide Button */}
        <button className="btn-icon" onClick={onOpenGuide} style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
          <HelpCircle size={16} color="#a78bfa" />
          <span style={{ color: '#c084fc' }}>사용 방법</span>
        </button>

        {/* Open New Media Button */}
        <div>
          <input
            type="file"
            accept="video/*,audio/*"
            id="header-media-input"
            style={{ display: 'none' }}
            onChange={handleMediaFileChange}
          />
          <label htmlFor="header-media-input" className="btn-icon" style={{ cursor: 'pointer', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
            <FolderOpen size={16} color="#60a5fa" />
            <span>새 동영상/음성 열기</span>
          </label>
        </div>

        {/* Load Subtitle File Button */}
        <div>
          <input
            type="file"
            accept=".srt,.smi,.txt"
            id="header-subtitle-input"
            style={{ display: 'none' }}
            onChange={handleSubtitleFileChange}
          />
          <label htmlFor="header-subtitle-input" className="btn-icon" style={{ cursor: 'pointer' }}>
            <FileText size={16} color="#34d399" />
            <span>기존 자막(.srt) 불러오기</span>
          </label>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
          <FileCode size={16} color="#06b6d4" />
          <span>문장: <strong style={{ color: '#fff' }}>{activeCount}개</strong></span>
        </div>

        <button className="btn-icon btn-primary" onClick={onExportClick}>
          <Download size={16} />
          <span>SRT / SMI / NBC 내보내기</span>
        </button>
      </div>
    </header>
  );
}
