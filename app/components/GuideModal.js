'use client';

import React, { useState } from 'react';
import { X, HelpCircle, FolderOpen, Cpu, Repeat, Download, FileText, CheckCircle2, MousePointerClick } from 'lucide-react';

export default function GuideModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('quick');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              padding: 8,
              borderRadius: 8,
              border: '1px solid rgba(59, 130, 246, 0.4)'
            }}>
              <HelpCircle size={22} color="#60a5fa" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>NativeBOX AI 상세 사용 방법 안내</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>동영상 어학 학습 및 AI 문장 자동 끊기 가이드</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
          <button
            className={`tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => setActiveTab('quick')}
            style={{ fontSize: 13 }}
          >
            <span>🚀 1분 퀵 스타트</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
            style={{ fontSize: 13 }}
          >
            <span>📁 영상 불러오기</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
            style={{ fontSize: 13 }}
          >
            <span>🤖 AI 자동 문장 끊기</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'repeat' ? 'active' : ''}`}
            onClick={() => setActiveTab('repeat')}
            style={{ fontSize: 13 }}
          >
            <span>🔁 구간 반복 & 학습</span>
          </button>
        </div>

        {/* Tab Content 1: Quick Start */}
        {activeTab === 'quick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--text-main)' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MousePointerClick size={16} />
                <span>1. 문장 클릭 시 해당 구간 즉시 이동 재생</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                우측 자막 타임라인 목록에서 임의의 <strong>문장을 클릭</strong>하거나 좌측의 <strong>재생(▶) 버튼</strong>을 누르면, 플레이어가 해당 문장의 시작 시간으로 이동하여 즉시 재생됩니다.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu size={16} />
                <span>2. AI 자동 문장 끊기 & 다국어(영어, 태국어 등) 번역</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                우측 상단 <strong>`[AI 자동 문장 분할기]`</strong> 탭에서 원하시는 타겟 언어(태국어, 한글 등)를 선택하고 실행 버튼을 누르면 AI가 알아서 문장 타임스탬프와 번역을 생성합니다.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#34d399', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={16} />
                <span>3. NativeBOX 표준 자막 파일 내보내기</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                상단 <strong>`[SRT / SMI / NBC 내보내기]`</strong> 버튼을 누르면 NativeBOX Publisher나 다른 어학 플레이어에서 읽을 수 있는 파일로 저장할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 2: Media Loading */}
        {activeTab === 'media' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderOpen size={16} />
                <span>방법 A: 상단 메뉴 버튼 이용</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                상단 헤더의 <strong>`📁 새 동영상/음성 열기`</strong> 버튼을 눌러 컴퓨터에 저장된 MP4, MP3, MKV 파일을 선택합니다.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MousePointerClick size={16} />
                <span>방법 B: 드래그 & 드롭 (Drag & Drop)</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                내 탐색기 폴더의 동영상 파일을 <strong>플레이어 화면 위로 직접 마우스로 끌어다 놓으시면(Drop)</strong> 즉시 새 동영상으로 교체됩니다.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#34d399', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={16} />
                <span>방법 C: 기존 자막 파일(.srt) 불러오기</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                상단 <strong>`📜 기존 자막(.srt) 불러오기`</strong> 버튼을 이용해 이미 만들어둔 자막 파일의 문장들을 그대로 불러와 동기화할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 3: AI Segmenter */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>AI 음성 인식 및 문장 끊기 과정</div>
              <ol style={{ paddingLeft: 18, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>우측 탭 메뉴에서 <strong>[AI 자동 문장 분할기]</strong> 선택</li>
                <li>학습하려는 <strong>번역 타겟 언어 (태국어, 한국어, 영어 등)</strong> 선택</li>
                <li><strong>[AI 문장 단위 일괄 생성 실행]</strong> 클릭</li>
                <li>AI 분석 완료 후 자막 타임라인으로 자동 전환되어 한 문장씩 바로 학습 가능!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab Content 4: Repeat & Shadowing */}
        {activeTab === 'repeat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Repeat size={16} />
                <span>한 문장 무한 구간 반복 (Shadowing)</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                하단 조작바의 <strong>`구간반복 ON`</strong> 버튼을 켜면, 현재 선택된 문장이 끝날 때 다음 문장으로 넘어가지 않고 <strong>해당 문장만 무한 반복 재생</strong>되어 섀도잉(따라 말하기) 연습을 손쉽게 할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button className="btn-icon btn-primary" onClick={onClose}>
            <span>확인 및 닫기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
