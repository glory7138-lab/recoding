'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Check } from 'lucide-react';

export default function ExportModal({ segments, onClose }) {
  const [copiedFormat, setCopiedFormat] = useState(null);

  // Format Helper to SRT (00:00:00,000)
  const formatSrtTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Generate SRT Content
  const generateSRT = () => {
    return segments
      .map((seg, i) => `${i + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.text}\n${seg.translation || ''}\n`)
      .join('\n');
  };

  // Generate SMI Content
  const generateSMI = () => {
    let smi = `<SAMI>\n<HEAD>\n<TITLE>NativeBOX Subtitles</TITLE>\n<STYLE TYPE="text/css">\n<!--\nP { margin-left:8pt; margin-right:8pt; margin-bottom:2pt; margin-top:2pt; text-align:center; font-size:16pt; font-family:arial, sans-serif; font-weight:bold; color:white; }\n.ENCC { Name:English; lang:en; }\n.KRCC { Name:Korean; lang:ko; }\n-->\n</STYLE>\n</HEAD>\n<BODY>\n`;
    segments.forEach((seg) => {
      const startMs = Math.floor(seg.start * 1000);
      const endMs = Math.floor(seg.end * 1000);
      smi += `<SYNC Start=${startMs}><P Class=ENCC>${seg.text}<br><P Class=KRCC>${seg.translation || ''}\n`;
      smi += `<SYNC Start=${endMs}><P Class=ENCC>&nbsp;\n`;
    });
    smi += `</BODY>\n</SAMI>`;
    return smi;
  };

  const handleDownload = (filename, content, type = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>자막 파일 내보내기 (Export)</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          AI가 자동 생성한 문장 타임스탬프를 NativeBOX, PyQt5, 팟플레이어 등에서 읽을 수 있는 표준 파일로 저장합니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* SRT Export Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>SubRip Subtitle (.srt)</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>범용 모바일 및 모든 비디오 플레이어 지원</div>
            </div>
            <button
              className="btn-icon btn-primary"
              onClick={() => handleDownload('nativebox_subtitle.srt', generateSRT())}
            >
              <Download size={14} />
              <span>SRT 다운로드</span>
            </button>
          </div>

          {/* SMI Export Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>SAMI Subtitle (.smi)</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>NativeBOX 및 국내 어학 플레이어 완벽 지원</div>
            </div>
            <button
              className="btn-icon"
              onClick={() => handleDownload('nativebox_subtitle.smi', generateSMI())}
            >
              <Download size={14} />
              <span>SMI 다운로드</span>
            </button>
          </div>

          {/* NBC JSON/Text Data */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>NativeBOX Data (.json)</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>문장 타임코드 & 한/영 데이터셋 원본</div>
            </div>
            <button
              className="btn-icon"
              onClick={() => handleDownload('nativebox_data.json', JSON.stringify(segments, null, 2))}
            >
              <Download size={14} />
              <span>JSON 데이터</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button className="btn-icon" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}
