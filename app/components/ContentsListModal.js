'use client';

import React, { useState } from 'react';

export default function ContentsListModal({
  onClose,
  onSelectMedia,
  currentFileName = 'About.Time.2013[1].avi'
}) {
  const [fileList, setFileList] = useState([
    { id: 1, name: 'About.Time.2013[1].avi', url: '/sample.mp4' },
    { id: 2, name: 'About.Time.2013[2].avi', url: '/sample.mp4' },
    { id: 3, name: 'About.Time.2013[3].avi', url: '/sample.mp4' },
    { id: 4, name: 'About.Time.2013[4].avi', url: '/sample.mp4' }
  ]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleAddFileClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,audio/*';
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        const newFile = { id: Date.now(), name: file.name, url };
        const nextList = [...fileList, newFile];
        setFileList(nextList);
        setSelectedIdx(nextList.length - 1);
        if (onSelectMedia) onSelectMedia(url, file.name);
      }
    };
    input.click();
  };

  const handleDeleteFile = () => {
    if (fileList.length <= 1) return;
    const nextList = fileList.filter((_, idx) => idx !== selectedIdx);
    setFileList(nextList);
    const newIdx = Math.max(0, selectedIdx - 1);
    setSelectedIdx(newIdx);
    if (onSelectMedia && nextList[newIdx]) {
      onSelectMedia(nextList[newIdx].url, nextList[newIdx].name);
    }
  };

  return (
    <div className="nb-contents-modal">
      {/* Header Title */}
      <div className="nb-contents-title">
        <span>:: Contents List</span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: 12
          }}
        >
          ×
        </button>
      </div>

      {/* Media Files List Box */}
      <div className="nb-contents-list-box">
        {fileList.map((file, idx) => {
          const isSelected = idx === selectedIdx || file.name === currentFileName;
          return (
            <div
              key={file.id || idx}
              className={`nb-contents-item ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setSelectedIdx(idx);
                if (onSelectMedia) onSelectMedia(file.url, file.name);
              }}
            >
              <div className="nb-contents-indicator" style={{ visibility: isSelected ? 'visible' : 'hidden' }} />
              <span>{file.name}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Button Toolbar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, padding: '4px 6px 6px' }}>
        <button className="nb-bevel-btn" style={{ padding: '3px 0', fontSize: 10 }}>
          Open List
        </button>
        <button className="nb-bevel-btn" style={{ padding: '3px 0', fontSize: 10 }}>
          Save List
        </button>
        <button className="nb-bevel-btn" style={{ padding: '3px 0', fontSize: 10 }} onClick={handleAddFileClick}>
          Add File
        </button>
        <button className="nb-bevel-btn" style={{ padding: '3px 0', fontSize: 10 }} onClick={handleDeleteFile}>
          Delete File
        </button>
        <button className="nb-bevel-btn active-green" style={{ padding: '3px 0', fontSize: 10 }} onClick={handleAddFileClick}>
          Open File
        </button>
      </div>
    </div>
  );
}
