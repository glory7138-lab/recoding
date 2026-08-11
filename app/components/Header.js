'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, FolderOpen, FileText, Download, HelpCircle, Sliders, ListFilter, Cpu, Film, CheckCircle2, X } from 'lucide-react';

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
  const [showLoader, setShowLoader] = useState(false);
  const [pendingVideo, setPendingVideo] = useState(null);   // { file, name, url }
  const [pendingSubtitle, setPendingSubtitle] = useState(null); // { content, name }
  const videoInputRef = useRef(null);
  const subtitleInputRef = useRef(null);
  const multiFileInputRef = useRef(null);

  const handleMultiFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (window.onHeaderMultiFileLoad) {
        window.onHeaderMultiFileLoad(e.target.files);
      }
      setShowLoader(false);
      e.target.value = '';
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingVideo({ file, name: file.name, url });
    e.target.value = '';
  };

  const handleSubtitleSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingSubtitle({ content: ev.target.result, name: file.name });
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleLoad = () => {
    if (pendingVideo) {
      onMediaSelect(pendingVideo.url, pendingVideo.name, pendingVideo.file);
    }
    if (pendingSubtitle) {
      onSubtitleSelect(pendingSubtitle.content, pendingSubtitle.name);
    }
    setPendingVideo(null);
    setPendingSubtitle(null);
    setShowLoader(false);
  };

  const handleClose = () => {
    setPendingVideo(null);
    setPendingSubtitle(null);
    setShowLoader(false);
  };

  return (
    <>
      <header className="app-header" style={{
        padding: '8px 20px',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        gap: 16,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 25px rgba(0,0,0,0.3)'
      }}>
        {/* Zone 1: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} title="NativeBOX AI Player v1.0">
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
            }}>
              <Sparkles size={17} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: '800', letterSpacing: '-0.3px', color: '#f8fafc' }}>
              NativeBOX <span style={{ color: '#38bdf8' }}>AI</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Mode Navigation Tabs */}
        {setActiveTab && (
          <div style={{
            display: 'flex', gap: 6, alignItems: 'center',
            background: 'rgba(0,0,0,0.4)', padding: '4px',
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              className={`nb-bevel-btn ${activeTab === 'nativebox' ? 'active-green' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 11, fontWeight: '700', borderRadius: 6 }}
              onClick={() => setActiveTab('nativebox')}
              title="NativeBOX 메인 레트로 플레이어 뷰"
            >
              <Sliders size={13} />
              <span>레트로 스킨 뷰</span>
            </button>
            <button
              className={`nb-bevel-btn ${activeTab === 'editor' ? 'active-blue' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 11, fontWeight: '700', borderRadius: 6 }}
              onClick={() => setActiveTab('editor')}
              title="타임라인 대본 에디터 뷰"
            >
              <ListFilter size={13} />
              <span>자막 에디터</span>
            </button>
            <button
              className={`nb-bevel-btn ${activeTab === 'ai' ? 'pressed' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 11, fontWeight: '700', borderRadius: 6 }}
              onClick={() => setActiveTab('ai')}
              title="AI 음성인식 대사 파싱 도구"
            >
              <Cpu size={13} />
              <span>AI 문장 분할기</span>
            </button>
          </div>
        )}

        {/* Zone 3: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Export Button */}
          <button
            className="nb-bevel-btn active-blue"
            onClick={onExportClick}
            style={{ padding: '5px 12px', fontSize: 10, fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            title="자막 내보내기"
          >
            <Download size={13} />
            <span>내보내기</span>
          </button>

          {/* Guide Button */}
          <button
            className="nb-bevel-btn"
            onClick={onOpenGuide}
            style={{ padding: '5px 8px' }}
            title="사용법 안내"
          >
            <HelpCircle size={14} color="#94a3b8" />
          </button>
        </div>
      </header>

    </>
  );
}
