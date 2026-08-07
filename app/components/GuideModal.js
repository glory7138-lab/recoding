'use client';

import React, { useState } from 'react';
import {
  X, Sparkles, PlayCircle, Upload, Mouse, Repeat, Download,
  ChevronRight, ChevronDown, ChevronUp, Cpu, Globe, Key, Info,
  CheckCircle2, ZapIcon, Volume2, FileText, BookOpen
} from 'lucide-react';

// ─────────────────────────────────────────────
// Accordion Step Component
// ─────────────────────────────────────────────
function Step({ number, title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: open ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
          border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
        }}
      >
        <div style={{
          background: open ? '#3b82f6' : 'rgba(255,255,255,0.1)',
          color: '#fff', borderRadius: '50%', width: 26, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'background 0.2s'
        }}>
          {number}
        </div>
        <div style={{ color: open ? '#60a5fa' : '#fff', fontWeight: 600, fontSize: 13, flex: 1 }}>
          {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{title}
        </div>
        {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tag Component
// ─────────────────────────────────────────────
function Tag({ children, color = '#3b82f6' }) {
  return (
    <span style={{
      background: `rgba(${color === '#3b82f6' ? '59,130,246' : color === '#10b981' ? '16,185,129' : color === '#f59e0b' ? '245,158,11' : '139,92,246'},0.15)`,
      border: `1px solid ${color}`,
      color, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4
    }}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// Button Guide Card
// ─────────────────────────────────────────────
function BtnCard({ label, color = '#3b82f6', children }) {
  return (
    <div style={{
      display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start',
      background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px',
      border: '1px solid rgba(255,255,255,0.07)'
    }}>
      <div style={{
        background: color, color: '#fff', borderRadius: 6, padding: '3px 8px',
        fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
        minWidth: 70, textAlign: 'center'
      }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────
const TABS = [
  { id: 'quickstart', label: '⚡ 빠른 시작', icon: '⚡' },
  { id: 'ai', label: '🤖 AI 분할기', icon: '🤖' },
  { id: 'player', label: '▶ 플레이어', icon: '▶' },
  { id: 'nativebox', label: '🖥 NativeBOX', icon: '🖥' },
  { id: 'export', label: '💾 내보내기', icon: '💾' },
];

export default function GuideModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('quickstart');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 680, maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(59,130,246,0.08)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={20} color="#60a5fa" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Recoding 사용 가이드</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI 자동 문장 분할 · 클릭 재생 · 섀도잉 학습</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeTab === tab.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: activeTab === tab.id ? '#60a5fa' : 'var(--text-muted)',
                fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 400,
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

          {/* ─── QUICK START ─── */}
          {activeTab === 'quickstart' && (
            <div>
              <div style={{ marginBottom: 14, padding: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#10b981', fontSize: 13 }}>
                🎯 <strong>핵심 기능 한 줄 요약</strong>: 동영상을 올리면 AI가 문장 단위로 자동으로 쪼개주고, 각 문장을 클릭하면 해당 부분이 바로 재생됩니다.
              </div>

              <Step number="1" title="앱 화면 최상단 탭에서 'AI 자동 문장 분할기' 클릭" defaultOpen={true}>
                <div style={{ marginBottom: 8 }}>상단 탭 바에서 <Tag color="#a78bfa">AI 자동 문장 분할기</Tag> 탭을 클릭합니다.</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10, fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>
                  [NativeBOX 레트로 스킨 뷰] | [타임라인 자막 에디터] | <span style={{ color: '#a78bfa', fontWeight: 700 }}>[AI 자동 문장 분할기] ← 여기 클릭</span>
                </div>
              </Step>

              <Step number="2" title="AI 엔진 선택 (API 키 없으면 '무료 로컬' 선택)">
                <BtnCard label="🆓 무료 로컬" color="#10b981">
                  <strong>가장 쉬운 방법!</strong> API 키 없이 바로 사용 가능합니다. 처음 실행 시 Whisper 모델(244MB)이 자동 다운로드됩니다.
                </BtnCard>
                <BtnCard label="💳 유료" color="#3b82f6">
                  OpenAI API Key가 있으면 선택. 정확도가 가장 높습니다. (분당 $0.006 과금)
                </BtnCard>
                <BtnCard label="🆓 HF API" color="#f59e0b">
                  Hugging Face 무료 계정 토큰으로 사용. huggingface.co에서 무료 가입 후 토큰 발급.
                </BtnCard>
              </Step>

              <Step number="3" title="동영상/음성 파일 업로드">
                <div>파일을 드래그해서 업로드 영역에 놓거나, 클릭해서 파일을 선택합니다.</div>
                <div style={{ marginTop: 8, color: '#a78bfa' }}>지원 형식: MP4, AVI, MOV, MKV, MP3, WAV, M4A</div>
                <div style={{ marginTop: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#fbbf24' }}>
                  ⚠️ 무료 로컬 엔진은 MP3/WAV/M4A 형식을 권장합니다. MP4는 브라우저 지원 여부에 따라 다릅니다.
                </div>
              </Step>

              <Step number="4" title="언어 설정 후 실행">
                <div>원본 언어(영상 속 언어) + 번역 언어를 선택하고 <Tag color="#3b82f6">🚀 AI 자동 문장 분할 실행</Tag> 버튼을 누릅니다.</div>
                <div style={{ marginTop: 8 }}>완료 후 NativeBOX 스킨 뷰 또는 타임라인 에디터에서 각 문장을 <strong>클릭하면 해당 구간으로 이동</strong>하여 바로 재생됩니다!</div>
              </Step>

              <Step number="5" title="파일로 저장 (선택)">
                <div>상단 메뉴의 <Tag>⬇️ 내보내기</Tag> 버튼으로 <Tag>.srt</Tag> <Tag>.smi</Tag> <Tag>.json</Tag> 형식으로 저장할 수 있습니다.</div>
              </Step>
            </div>
          )}

          {/* ─── AI SEGMENTER ─── */}
          {activeTab === 'ai' && (
            <div>
              <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-muted)' }}>
                AI 자동 문장 분할기의 각 버튼과 옵션에 대한 상세 설명입니다.
              </div>

              <Step number="엔진" title="AI 엔진 선택 카드" defaultOpen={true}>
                <BtnCard label="🆓 무료 로컬" color="#10b981">
                  <strong>Transformers.js (Whisper) 로컬 실행</strong><br />
                  인터넷 없이 브라우저에서 직접 Whisper AI를 실행합니다.<br />
                  • API Key: 불필요<br />
                  • 모델 크기: Tiny(75MB) / Small(244MB, 권장) / Medium(769MB)<br />
                  • 최초 실행 시 모델이 자동 다운로드됩니다. 이후 캐시에서 즉시 실행.
                </BtnCard>
                <BtnCard label="💳 유료(OpenAI)" color="#3b82f6">
                  <strong>OpenAI Whisper API</strong><br />
                  가장 높은 정확도. API 키가 필요합니다.<br />
                  • API Key: platform.openai.com에서 발급<br />
                  • 과금: $0.006/분 (1시간 분량 ≈ $0.36)<br />
                  • 번역도 OpenAI GPT로 자동 처리
                </BtnCard>
                <BtnCard label="🆓 HF API" color="#f59e0b">
                  <strong>Hugging Face Inference API</strong><br />
                  무료 계정 토큰으로 사용 가능합니다.<br />
                  • 토큰 발급: huggingface.co → Settings → Access Tokens<br />
                  • 월 사용량 제한 있음 (무료 플랜 기준)
                </BtnCard>
              </Step>

              <Step number="모델" title="Whisper 모델 크기 선택 (무료 로컬 전용)">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { name: 'Tiny', size: '75MB', speed: '⚡⚡⚡', acc: '★★☆', desc: '빠르지만 인식률 낮음' },
                    { name: 'Small', size: '244MB', speed: '⚡⚡', acc: '★★★', desc: '권장 ⭐ 속도/정확도 균형' },
                    { name: 'Medium', size: '769MB', speed: '⚡', acc: '★★★★', desc: '느리지만 정확도 높음' },
                  ].map(m => (
                    <div key={m.name} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#a78bfa' }}>{m.size}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>속도: {m.speed}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>정확도: {m.acc}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{m.desc}</div>
                    </div>
                  ))}
                </div>
              </Step>

              <Step number="언어" title="언어 설정">
                <div style={{ marginBottom: 8 }}><strong style={{ color: '#60a5fa' }}>영상 원본 언어</strong> — 동영상 속 화자가 실제로 말하는 언어를 선택합니다.</div>
                <div style={{ marginBottom: 12, paddingLeft: 10 }}>예: 영어 영화 → 영어 / 태국 드라마 → 태국어</div>
                <div style={{ marginBottom: 8 }}><strong style={{ color: '#10b981' }}>번역 대상 언어</strong> — 원문 아래에 표시할 번역 언어를 선택합니다.</div>
                <div style={{ paddingLeft: 10 }}>예: 영어 영화를 한국어로 번역해서 학습 → 한국어 선택</div>
                <div style={{ marginTop: 12, background: 'rgba(59,130,246,0.1)', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#93c5fd' }}>
                  💡 지원 번역 언어: 한국어, 태국어, 영어, 일본어, 중국어, 프랑스어, 스페인어
                </div>
              </Step>

              <Step number="실행" title="🚀 실행 버튼">
                <div>파일을 업로드하면 <Tag color="#3b82f6">🚀 AI 자동 문장 분할 실행</Tag> 버튼이 활성화됩니다.</div>
                <div style={{ marginTop: 8 }}>파일 없이 실행하면 <Tag>🎬 샘플 영상으로 데모 실행</Tag>으로 기능 먼저 체험 가능합니다.</div>
                <div style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 12 }}>
                  실행 후 하단 로그 창에서 진행 상황을 실시간으로 확인할 수 있습니다.<br />
                  완료되면 자동으로 NativeBOX 스킨 뷰로 이동하여 바로 학습할 수 있습니다.
                </div>
              </Step>
            </div>
          )}

          {/* ─── PLAYER ─── */}
          {activeTab === 'player' && (
            <div>
              <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-muted)' }}>
                미디어 플레이어 하단 조작 버튼들의 기능 설명입니다.
              </div>

              <Step number="재생" title="재생 / 일시정지" defaultOpen={true}>
                <BtnCard label="▶ 재생" color="#3b82f6">동영상/음성을 재생합니다. 다시 누르면 일시정지.</BtnCard>
                <BtnCard label="↺ 문장 반복" color="#6366f1">
                  <strong>현재 문장을 처음부터 다시 재생</strong>합니다. (1회 반복)<br />
                  들으면서 놓쳤을 때 클릭하면 해당 문장 시작점으로 돌아갑니다.
                </BtnCard>
              </Step>

              <Step number="이동" title="◀ ▶ 이전/다음 문장">
                <BtnCard label="◀ 이전" color="#4b5563">이전 문장으로 이동합니다.</BtnCard>
                <BtnCard label="▶ 다음" color="#4b5563">다음 문장으로 이동합니다.</BtnCard>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  💡 하단 스크립트 목록에서 문장을 직접 클릭해도 해당 구간으로 바로 이동합니다!
                </div>
              </Step>

              <Step number="구간반복" title="🔁 구간 반복 ON/OFF">
                <BtnCard label="구간반복 ON" color="#10b981">
                  <strong>현재 선택된 문장을 무한 반복 재생</strong>합니다.<br />
                  문장이 끝나면 자동으로 시작점으로 되돌아갑니다.<br />
                  섀도잉(따라 말하기) 연습에 최적입니다!
                </BtnCard>
                <BtnCard label="구간반복 OFF" color="#6b7280">
                  일반 연속 재생 모드로 돌아갑니다.
                </BtnCard>
              </Step>

              <Step number="자막" title="ENG / 한글 자막 토글">
                <BtnCard label="ENG" color="#38bdf8">영어 원문 자막을 비디오 화면에 표시/숨깁니다.</BtnCard>
                <BtnCard label="한글" color="#38bdf8">번역 자막을 비디오 화면에 표시/숨깁니다.</BtnCard>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  두 버튼을 눌러 섀도잉 연습 시 원하는 조합으로 자막을 조절하세요.
                </div>
              </Step>

              <Step number="속도" title="재생 속도 조절">
                <div>드롭다운 메뉴에서 재생 속도를 선택합니다.</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {['0.5x (초보)', '0.75x (학습)', '1.0x (기본)', '1.25x (빠름)', '1.5x (고급)'].map(s => (
                    <Tag key={s} color="#6366f1">{s}</Tag>
                  ))}
                </div>
              </Step>
            </div>
          )}

          {/* ─── NATIVEBOX SKIN ─── */}
          {activeTab === 'nativebox' && (
            <div>
              <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-muted)' }}>
                NativeBOX 레트로 스킨 뷰의 각 버튼 설명입니다.
              </div>

              <Step number="스크린" title="Screen 모드 선택 버튼" defaultOpen={true}>
                <BtnCard label="Normal Screen" color="#10b981">기본 화면 모드. 플레이어 + 스크립트 뷰어 분리.</BtnCard>
                <BtnCard label="Big Screen" color="#10b981">더 큰 화면 모드 (향후 확장).</BtnCard>
                <BtnCard label="Full Screen" color="#10b981">전체 화면 모드 (향후 확장).</BtnCard>
                <BtnCard label="Caption Screen" color="#10b981">자막 전용 모드 (향후 확장).</BtnCard>
              </Step>

              <Step number="캡션" title="Caption 자막 표시 모드">
                <BtnCard label="(X)" color="#6366f1">자막 모두 숨기기. 영상만 보이는 모드.</BtnCard>
                <BtnCard label="(E)" color="#10b981">원어 자막만 표시 (English 등 원문).</BtnCard>
                <BtnCard label="(K)" color="#10b981">번역 자막만 표시 (Korean/한국어 등).</BtnCard>
                <BtnCard label="(E/K)" color="#3b82f6">원어 + 번역 자막 동시 표시 (기본값).</BtnCard>
                <div style={{ marginTop: 8, fontSize: 12, color: '#a78bfa' }}>
                  💡 섀도잉 연습 팁: 처음엔 (E/K) → 익숙해지면 (E) → 완전히 외우면 (X) 순서로 연습하세요!
                </div>
              </Step>

              <Step number="컨텐츠" title="List / Contents List">
                <BtnCard label="List" color="#f59e0b">우측 하단 Contents List 미니 윈도우를 열고 닫습니다.</BtnCard>
                <div style={{ marginBottom: 8 }}>Contents List 창에서는 영상 파일 목록을 관리하고 선택할 수 있습니다.</div>
                <BtnCard label="Add File" color="#10b981">새 영상 파일을 목록에 추가합니다.</BtnCard>
                <BtnCard label="Open File" color="#10b981">선택한 영상 파일을 플레이어에서 열어 재생합니다.</BtnCard>
                <BtnCard label="Delete File" color="#ef4444">목록에서 선택한 항목을 삭제합니다.</BtnCard>
              </Step>

              <Step number="폰트" title="tT / T / T+ 폰트 크기 조절">
                <BtnCard label="tT" color="#6b7280">작은 글씨 크기로 변경합니다.</BtnCard>
                <BtnCard label="T" color="#6b7280">기본 글씨 크기로 변경합니다.</BtnCard>
                <BtnCard label="T+" color="#6b7280">큰 글씨 크기로 변경합니다. 눈의 피로를 줄이는 데 도움이 됩니다.</BtnCard>
              </Step>
            </div>
          )}

          {/* ─── EXPORT ─── */}
          {activeTab === 'export' && (
            <div>
              <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-muted)' }}>
                AI가 분할한 문장 타임코드 데이터를 파일로 저장하는 방법입니다.
              </div>

              <Step number="1" title="상단 메뉴 '⬇️ 내보내기' 버튼 클릭" defaultOpen={true}>
                <div>최상단 헤더에 있는 <Tag color="#3b82f6">⬇️ 내보내기</Tag> 버튼을 클릭합니다.</div>
              </Step>

              <Step number="2" title="파일 형식 선택 후 다운로드">
                <BtnCard label=".srt 다운로드" color="#3b82f6">
                  <strong>SubRip Subtitle (.srt)</strong> — 범용 자막 파일<br />
                  스마트폰, 유튜브, 팟플레이어, VLC 등 모든 플레이어에서 사용 가능합니다.
                </BtnCard>
                <BtnCard label=".smi 다운로드" color="#a78bfa">
                  <strong>SAMI Subtitle (.smi)</strong> — NativeBOX 전용 자막<br />
                  기존 NativeBOX 플레이어 및 KMPlayer, 팟플레이어 등 국내 플레이어 호환.
                </BtnCard>
                <BtnCard label="JSON 데이터" color="#10b981">
                  <strong>NativeBOX Data (.json)</strong> — 원본 데이터<br />
                  시작/종료 시간, 영어, 번역문, 메모가 모두 포함된 원본 파일입니다.
                </BtnCard>
              </Step>

              <Step number="3" title="저장 파일 활용">
                <div style={{ marginBottom: 8 }}>저장된 <strong>.smi 또는 .srt 파일</strong>을 기존 NativeBOX 플레이어와 동일한 폴더에 넣고, 영상 파일과 이름을 맞추면 바로 사용 가능합니다.</div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>
                  📁 About.Time.2013.mp4<br />
                  📄 About.Time.2013.smi  ← 동일한 이름으로 저장
                </div>
              </Step>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', textAlign: 'right', flexShrink: 0 }}>
          <button className="btn-icon btn-primary" onClick={onClose}>
            <CheckCircle2 size={16} />
            <span>확인하고 닫기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
