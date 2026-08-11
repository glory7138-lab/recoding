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

          {/* ✅ Unified Load Button */}
          <button
            className={`nb-bevel-btn ${showLoader ? 'active-green' : ''}`}
            style={{
              padding: '5px 12px', fontSize: 10, fontWeight: 'bold',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: showLoader ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.18)',
              borderColor: showLoader ? '#10b981' : 'rgba(59,130,246,0.5)',
              color: showLoader ? '#34d399' : '#93c5fd',
            }}
            onClick={() => setShowLoader(!showLoader)}
            title="영상 + 자막 동시 로드 (같은 이름의 파일 쌍으로 보관 권장)"
          >
            <Film size={13} />
            <span>🎬 영상+자막 로드</span>
          </button>

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

      {/* ✅ Unified Inline File Loader Panel (Dropdown below header) */}
      {showLoader && (
        <div style={{
          position: 'fixed',
          top: 76,
          right: 24,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1.5px solid rgba(59,130,246,0.5)',
          borderRadius: 16,
          padding: '20px 22px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          minWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Panel Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Film size={18} color="#60a5fa" />
              <span style={{ fontSize: 16, fontWeight: '800', color: '#f8fafc' }}>영상 + 자막 동시 로드</span>
            </div>
            <button
              onClick={handleClose}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* 🔥 1-Click Multi-File Simultaneous Select Button */}
          <div>
            <input
              type="file"
              multiple
              accept="video/*,audio/*,.mp4,.mkv,.avi,.mov,.webm,.mp3,.wav,.m4a,.json,.nbc,.smi,.vtt,.ass,.ssa,.srt,.csv,.tsv"
              ref={multiFileInputRef}
              style={{ display: 'none' }}
              onChange={handleMultiFileSelect}
            />
            <button
              className="nb-bevel-btn active-green"
              style={{
                width: '100%',
                padding: '10px 0',
                fontSize: 13,
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(59,130,246,0.3) 100%)',
                border: '1.5px solid #10b981',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)'
              }}
              onClick={() => multiFileInputRef.current?.click()}
            >
              <FolderOpen size={18} color="#34d399" />
              <span>⚡ 영상 & 자막 동시 한꺼번에 선택 (추천)</span>
            </button>
          </div>

          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
            💡 파일 창이 열리면 <code style={{ color: '#34d399', fontSize: 11 }}>Ctrl+클릭</code>으로 <code style={{ color: '#60a5fa', fontSize: 11 }}>동영상(.mp4)</code>과 <code style={{ color: '#34d399', fontSize: 11 }}>자막(.srt/.vtt/.json)</code>을 한꺼번에 함께 선택하세요!
          </p>

          {/* Step 1: Video */}
          <div style={{
            background: pendingVideo ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${pendingVideo ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 10, padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                {pendingVideo
                  ? <CheckCircle2 size={16} color="#10b981" />
                  : <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #3b82f6', display: 'inline-block' }} />
                }
                Step 1 · 영상 파일 선택
              </span>
              {pendingVideo && (
                <button onClick={() => setPendingVideo(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2, fontSize: 11 }}>
                  취소
                </button>
              )}
            </div>
            {pendingVideo ? (
              <div style={{ fontSize: 13, color: '#60a5fa', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                🎬 {pendingVideo.name}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="video/*,audio/*,.mp4,.mkv,.avi,.mov,.webm,.mp3,.wav,.m4a"
                  ref={videoInputRef}
                  style={{ display: 'none' }}
                  onChange={handleVideoSelect}
                />
                <button
                  className="nb-bevel-btn"
                  style={{ width: '100%', padding: '8px 0', fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)', color: '#93c5fd' }}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <FolderOpen size={16} />
                  동영상 파일 선택 (mp4, avi, mkv...)
                </button>
              </>
            )}
          </div>

          {/* Step 2: Subtitle */}
          <div style={{
            background: pendingSubtitle ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${pendingSubtitle ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 10, padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                {pendingSubtitle
                  ? <CheckCircle2 size={16} color="#10b981" />
                  : <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #10b981', display: 'inline-block' }} />
                }
                Step 2 · 자막 파일 선택 <span style={{ fontSize: 11, color: '#64748b', fontWeight: '500' }}>(선택사항)</span>
              </span>
              {pendingSubtitle && (
                <button onClick={() => setPendingSubtitle(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2, fontSize: 11 }}>
                  취소
                </button>
              )}
            </div>
            {pendingSubtitle ? (
              <div style={{ fontSize: 13, color: '#34d399', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📝 {pendingSubtitle.name}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept=".srt,.smi,.vtt,.ass,.ssa,.txt,.json,.nbc,.tsv,.csv,*/*"
                  ref={subtitleInputRef}
                  style={{ display: 'none' }}
                  onChange={handleSubtitleSelect}
                />
                <button
                  className="nb-bevel-btn"
                  style={{ width: '100%', padding: '8px 0', fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.4)', color: '#6ee7b7' }}
                  onClick={() => subtitleInputRef.current?.click()}
                >
                  <FileText size={16} />
                  자막 파일 선택 (srt, smi, vtt, json...)
                </button>
              </>
            )}
          </div>

          {/* Load Button */}
          <button
            className="nb-bevel-btn active-green"
            disabled={!pendingVideo && !pendingSubtitle}
            style={{
              width: '100%', padding: '12px 0', fontSize: 15, fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: (!pendingVideo && !pendingSubtitle) ? 0.4 : 1,
              cursor: (!pendingVideo && !pendingSubtitle) ? 'not-allowed' : 'pointer'
            }}
            onClick={handleLoad}
            title="선택한 영상과 자막을 플레이어에 로드합니다"
          >
            <CheckCircle2 size={18} />
            ✅ 플레이어에 로드하기
            {pendingVideo && pendingSubtitle && ' (영상+자막)'}
            {pendingVideo && !pendingSubtitle && ' (영상만)'}
            {!pendingVideo && pendingSubtitle && ' (자막만)'}
          </button>
        </div>
      )}
    </>
  );
}
