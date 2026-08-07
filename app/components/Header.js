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
      padding: '12px 28px',
      height: '76px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 25px rgba(0,0,0,0.3)'
    }}>
      {/* Zone 1: Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} title="NativeBOX AI Player v1.0">
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: '800', letterSpacing: '-0.3px', color: '#f8fafc' }}>
            NativeBOX <span style={{ color: '#38bdf8' }}>AI</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Mode Navigation Tabs (Center Segmented Control) */}
      {setActiveTab && (
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          background: 'rgba(0,0,0,0.4)',
          padding: '6px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            className={`nb-bevel-btn ${activeTab === 'nativebox' ? 'active-green' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', fontSize: 15, fontWeight: '700', borderRadius: 8 }}
            onClick={() => setActiveTab('nativebox')}
            title="NativeBOX 메인 레트로 플레이어 뷰"
          >
            <Sliders size={18} />
            <span>레트로 스킨 뷰</span>
          </button>
          <button
            className={`nb-bevel-btn ${activeTab === 'editor' ? 'active-blue' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', fontSize: 15, fontWeight: '700', borderRadius: 8 }}
            onClick={() => setActiveTab('editor')}
            title="타임라인 대본 에디터 뷰"
          >
            <ListFilter size={18} />
            <span>자막 에디터</span>
          </button>
          <button
            className={`nb-bevel-btn ${activeTab === 'ai' ? 'pressed' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', fontSize: 15, fontWeight: '700', borderRadius: 8 }}
            onClick={() => setActiveTab('ai')}
            title="AI 음성인식 대사 파싱 도구"
          >
            <Cpu size={18} />
            <span>AI 문장 분할기</span>
          </button>
        </div>
      )}

      {/* Zone 3: Global Media / Subtitle Import & Export Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Media File Open Button */}
        <div>
          <input
            type="file"
            accept="video/*,audio/*"
            id="header-media-input"
            style={{ display: 'none' }}
            onChange={handleMediaFileChange}
          />
          <label htmlFor="header-media-input" className="nb-bevel-btn" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.35)', color: '#93c5fd' }}>
            <FolderOpen size={18} color="#60a5fa" />
            <span>동영상 열기</span>
          </label>
        </div>

        {/* Load Subtitle File Button */}
        <div>
          <input
            type="file"
            accept="*/*,.srt,.smi,.vtt,.ass,.ssa,.txt,.json,.nbc,.tsv,.csv"
            id="header-subtitle-input"
            style={{ display: 'none' }}
            onChange={handleSubtitleFileChange}
          />
          <label htmlFor="header-subtitle-input" className="nb-bevel-btn" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.35)', color: '#6ee7b7' }}>
            <FileText size={18} color="#34d399" />
            <span>자막 불러오기</span>
          </label>
        </div>

        {/* Export Subtitle Button */}
        <button className="nb-bevel-btn active-blue" onClick={onExportClick} style={{ padding: '8px 18px', fontSize: 14, fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: 8 }} title="내보내기">
          <Download size={18} />
          <span>내보내기</span>
        </button>

        {/* User Guide Button */}
        <button
          className="nb-bevel-btn"
          onClick={onOpenGuide}
          style={{ padding: '8px 12px' }}
          title="사용법 안내"
        >
          <HelpCircle size={20} color="#94a3b8" />
        </button>
      </div>
    </header>
  );
}
