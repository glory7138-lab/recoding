'use client';

import React from 'react';
import { Sparkles, FolderOpen, FileText, Download, FileCode, HelpCircle, Sliders, ListFilter, Cpu } from 'lucide-react';

export default function Header({
  onExportClick,
  activeCount,
  onMediaSelect,
  onSubtitleSelect,
  onOpenGuide,
  activeTab = 'nativebox',
  setActiveTab,
  videoTitle = ''
}) {
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
    <header className="app-header" style={{
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
    }}>
      {/* Zone 1: Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="brand-logo" style={{ gap: 8, cursor: 'pointer' }} title="NativeBOX AI Player v1.0">
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
          }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: '800', letterSpacing: '-0.3px', color: '#f8fafc' }}>
            NativeBOX <span style={{ color: '#38bdf8' }}>AI</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Mode Navigation Tabs (Center Segmented Control) */}
      {setActiveTab && (
        <div style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          background: 'rgba(0,0,0,0.4)',
          padding: '3px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            className={`nb-bevel-btn ${activeTab === 'nativebox' ? 'active-green' : ''}`}
            style={{ padding: '5px 12px', fontSize: 11, fontWeight: '700', borderRadius: 7 }}
            onClick={() => setActiveTab('nativebox')}
            title="NativeBOX 메인 레트로 플레이어 뷰"
          >
            <Sliders size={13} />
            <span>레트로 스킨 뷰</span>
          </button>
          <button
            className={`nb-bevel-btn ${activeTab === 'editor' ? 'active-blue' : ''}`}
            style={{ padding: '5px 12px', fontSize: 11, fontWeight: '700', borderRadius: 7 }}
            onClick={() => setActiveTab('editor')}
            title="타임라인 대본 에디터 뷰"
          >
            <ListFilter size={13} />
            <span>자막 에디터</span>
          </button>
          <button
            className={`nb-bevel-btn ${activeTab === 'ai' ? 'pressed' : ''}`}
            style={{ padding: '5px 12px', fontSize: 11, fontWeight: '700', borderRadius: 7 }}
            onClick={() => setActiveTab('ai')}
            title="AI 브라우저 음성 인식 문장 분할기"
          >
            <Cpu size={13} color="#a78bfa" />
            <span>AI 문장 분할기</span>
          </button>
        </div>
      )}

      {/* Zone 3: Essential Top Action Buttons (Right Group) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Open New Media Button */}
        <div>
          <input
            type="file"
            accept="video/*,audio/*"
            id="header-media-input"
            style={{ display: 'none' }}
            onChange={handleMediaFileChange}
          />
          <label htmlFor="header-media-input" className="btn-icon" style={{ padding: '5px 11px', fontSize: 11, cursor: 'pointer', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#93c5fd' }}>
            <FolderOpen size={14} color="#60a5fa" />
            <span>동영상 열기</span>
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
          <label htmlFor="header-subtitle-input" className="btn-icon" style={{ padding: '5px 11px', fontSize: 11, cursor: 'pointer', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#6ee7b7' }}>
            <FileText size={14} color="#34d399" />
            <span>자막 불러오기</span>
          </label>
        </div>

        {/* Export Subtitle Button */}
        <button className="btn-icon btn-primary" onClick={onExportClick} style={{ padding: '5px 13px', fontSize: 11, fontWeight: 'bold' }} title="현재 파싱된 자막을 .srt / .smi 자막 파일 또는 .json 프로젝트 파일로 다운로드합니다.">
          <Download size={14} />
          <span>내보내기</span>
        </button>

        {/* Help Guide Button */}
        <button className="btn-icon" onClick={onOpenGuide} style={{ padding: '5px 9px', fontSize: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} title="NativeBOX 사용 방법 가이드">
          <HelpCircle size={14} color="#cbd5e1" />
        </button>
      </div>
    </header>
  );
}
