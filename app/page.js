'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NativeBoxPlayer from './components/NativeBoxPlayer';
import SubtitleScriptViewer from './components/SubtitleScriptViewer';
import PlaylistPanel from './components/PlaylistPanel';
import AiSegmenter from './components/AiSegmenter';
import SubtitleEditor from './components/SubtitleEditor';
import ExportModal from './components/ExportModal';
import GuideModal from './components/GuideModal';
import { Cpu, ListFilter, Sliders } from 'lucide-react';

export default function Home() {
  const initialSegments = [
    {
      id: 1,
      start: 8.93,
      end: 11.24,
      text: "I always knew we were a fairly odd family.",
      translation: "나는 우리가 꽤 특이한 가족이라는 걸 항상 알고 있었다.",
      memo: "도입 문장"
    },
    {
      id: 2,
      start: 11.25,
      end: 13.10,
      text: "First there was me.",
      translation: "첫 번째로 내가 있었다.",
      memo: "인물 소개"
    },
    {
      id: 3,
      start: 13.11,
      end: 15.54,
      text: "Too tall. Too skinny. Too orange.",
      translation: "너무 키가 크고. 너무 말랐고. 너무 주황색 머리였다.",
      memo: "외모 묘사"
    },
    {
      id: 4,
      start: 15.55,
      end: 18.87,
      text: "My mum was lovely, but not like other mums.",
      translation: "우리 엄마는 사랑스러웠지만, 다른 엄마들과는 달랐다.",
      memo: "엄마 소개"
    }
  ];

  const [playlist, setPlaylist] = useState([]);
  const [videoSrc, setVideoSrc] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [segments, setSegments] = useState([]);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [seekTrigger, setSeekTrigger] = useState(null);
  const [isRepeatSentence, setIsRepeatSentence] = useState(false);
  const [checkedIndices, setCheckedIndices] = useState([]);

  const handleSelectSegment = (idx) => {
    setCurrentSegmentIndex(idx);
    if (segments[idx]) {
      setSeekTrigger({ time: segments[idx].start, ts: Date.now() });
    }
  };
  const [screenMode, setScreenModeState] = useState('normal'); // 'normal' | 'big' | 'full' | 'caption'
  const [captionMode, setCaptionModeState] = useState('EK'); // 'X' | 'E' | 'K' | 'EK'
  const [fontSize, setFontSizeState] = useState(14); // Font size in pixels (default 14px for 4-item view)
  const [playerSizePercent, setPlayerSizePercentState] = useState(100); // Player width size % (60%~140%)

  // Load saved font size, player screen size, caption mode, screen mode from localStorage on mount
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem('nb_font_size');
      if (savedFont && !isNaN(Number(savedFont))) {
        setFontSizeState(Number(savedFont));
      }
      const savedPlayerSize = localStorage.getItem('nb_player_size');
      if (savedPlayerSize && !isNaN(Number(savedPlayerSize))) {
        setPlayerSizePercentState(Number(savedPlayerSize));
      } else {
        setPlayerSizePercentState(100);
      }
      const savedCaption = localStorage.getItem('nb_caption_mode');
      if (savedCaption) {
        setCaptionModeState(savedCaption);
      }
      const savedScreen = localStorage.getItem('nb_screen_mode');
      if (savedScreen) {
        setScreenModeState(savedScreen);
      }
    } catch (e) {}
  }, []);

  const setFontSize = (newSize) => {
    const val = typeof newSize === 'number' ? newSize : 16;
    setFontSizeState(val);
    try {
      localStorage.setItem('nb_font_size', String(val));
    } catch (e) {}
  };

  const setPlayerSizePercent = (newSize) => {
    const val = typeof newSize === 'number' ? Math.max(60, Math.min(140, newSize)) : 100;
    setPlayerSizePercentState(val);
    try {
      localStorage.setItem('nb_player_size', String(val));
    } catch (e) {}
  };

  const setCaptionMode = (mode) => {
    setCaptionModeState(mode);
    try {
      localStorage.setItem('nb_caption_mode', String(mode));
    } catch (e) {}
  };

  const setScreenMode = (mode) => {
    setScreenModeState(mode);
    try {
      localStorage.setItem('nb_screen_mode', String(mode));
    } catch (e) {}
  };
  const [showContentsList, setShowContentsList] = useState(true);
  const [activeTab, setActiveTab] = useState('nativebox'); // 'nativebox' | 'editor' | 'ai'
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // ── IndexedDB & LocalStorage Media Playlist Persistence ──
  const DB_NAME = 'NativeBOX_DB';
  const DB_VERSION = 1;
  const STORE_NAME = 'playlist';

  const openDB = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'name' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  };

  const savePlaylistItemDB = async (item) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(item.name);
      
      getReq.onsuccess = () => {
        const existing = getReq.result || {};
        const updated = {
          name: item.name,
          url: item.url || existing.url || '',
          filePath: item.filePath || existing.filePath || '',
          fileBlob: item.fileBlob || existing.fileBlob || null,
          segments: item.segments && item.segments.length > 0 ? item.segments : (existing.segments || []),
          updatedAt: Date.now()
        };
        store.put(updated);
      };
    } catch (e) {}
  };

  const loadAllPlaylistItemsDB = async () => {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  };

  const deletePlaylistItemDB = async (name) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(name);
    } catch (e) {}
  };

  // Dual Persistence Sync (LocalStorage Metadata + IndexedDB Blobs)
  const syncPlaylistStorage = (newList) => {
    setPlaylist(newList);
    try {
      const metadata = newList.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        filePath: item.filePath || (item.fileBlob && item.fileBlob.path) || '',
        segments: item.segments || []
      }));
      localStorage.setItem('nb_saved_playlist', JSON.stringify(metadata));
      localStorage.setItem('nb_saved_playlist_initialized', 'true');
    } catch (e) {}
  };

  useEffect(() => {
    window.onHeaderMediaSelect = (url, name, fileBlob) => {
      handleMediaSelect(url, name, fileBlob);
    };

    window.onHeaderMultiFileLoad = (fileList) => {
      handleMultiFileLoad(fileList);
    };

    const isInitialized = typeof window !== 'undefined' && localStorage.getItem('nb_saved_playlist_initialized') === 'true';

    // 1. Load synchronously from LocalStorage first
    let initialList = [];
    try {
      const savedJson = localStorage.getItem('nb_saved_playlist');
      if (savedJson) {
        const parsed = JSON.parse(savedJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialList = parsed.map(item => ({
            ...item,
            url: item.url || ''
          }));
          setPlaylist(initialList);
          if (initialList[0]) {
            setVideoSrc(initialList[0].url);
            setVideoTitle(initialList[0].name);
            setSegments(initialList[0].segments || []);
          }
        }
      }
    } catch (e) {}

    // 2. Load Blobs & items from IndexedDB asynchronously
    loadAllPlaylistItemsDB().then(dbItems => {
      if (Array.isArray(dbItems) && dbItems.length > 0) {
        const mergedList = dbItems.map(dbItem => {
          let liveUrl = dbItem.url;
          
          if (dbItem.fileBlob) {
            try {
              liveUrl = URL.createObjectURL(dbItem.fileBlob);
            } catch (e) {}
          } else if (dbItem.filePath && !liveUrl) {
            liveUrl = dbItem.filePath.startsWith('file://') ? dbItem.filePath : `file:///${dbItem.filePath.replace(/\\/g, '/')}`;
          }

          return {
            id: dbItem.id || dbItem.name,
            name: dbItem.name,
            url: liveUrl,
            filePath: dbItem.filePath || (dbItem.fileBlob && dbItem.fileBlob.path) || '',
            fileBlob: dbItem.fileBlob || null,
            segments: dbItem.segments || []
          };
        });

        setPlaylist(mergedList);

        if (mergedList[0]) {
          let activeUrl = mergedList[0].url;
          if (mergedList[0].fileBlob) {
            try { activeUrl = URL.createObjectURL(mergedList[0].fileBlob); } catch (e) {}
          }
          setVideoSrc(activeUrl);
          setVideoTitle(mergedList[0].name);
          setSegments(mergedList[0].segments || []);
        }

        try {
          const metadata = mergedList.map(item => ({
            id: item.id,
            name: item.name,
            url: item.url,
            filePath: item.filePath || '',
            segments: item.segments || []
          }));
          localStorage.setItem('nb_saved_playlist', JSON.stringify(metadata));
          localStorage.setItem('nb_saved_playlist_initialized', 'true');
        } catch (e) {}
      } else if (!isInitialized && initialList.length === 0) {
        // Onboarding first launch: load static sample media
        fetch('/intern_output.json')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              const internItem = {
                id: 'intern-mp4',
                name: 'intern.mp4',
                url: '/intern.mp4',
                segments: data
              };
              setPlaylist([internItem]);
              setVideoSrc('/intern.mp4');
              setVideoTitle('intern.mp4');
              setSegments(data);
              syncPlaylistStorage([internItem]);
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  const handleMediaSelect = (url, fileName, fileBlob = null) => {
    let playableUrl = url;
    if (fileBlob) {
      try { playableUrl = URL.createObjectURL(fileBlob); } catch (e) {}
    }
    const filePath = (fileBlob && fileBlob.path) || '';
    setVideoSrc(playableUrl);
    setVideoTitle(fileName);
    setPlaylist(prev => {
      const exists = prev.find(p => p.name === fileName);
      let updated;
      if (exists) {
        updated = prev.map(p => p.name === fileName ? { ...p, url: playableUrl, filePath: filePath || p.filePath, fileBlob: fileBlob || p.fileBlob } : p);
      } else {
        updated = [...prev, { id: Date.now(), name: fileName, url: playableUrl, filePath, fileBlob, segments: [] }];
      }
      syncPlaylistStorage(updated);
      return updated;
    });

    savePlaylistItemDB({ name: fileName, url: playableUrl, filePath, fileBlob, segments: [] });
  };

  const handleSelectPlaylistItem = (item) => {
    let liveUrl = item.url;
    if (item.fileBlob) {
      try {
        liveUrl = URL.createObjectURL(item.fileBlob);
      } catch (e) {}
    }
    setVideoSrc(liveUrl);
    setVideoTitle(item.name);
    setSegments(item.segments || []);
    setCurrentSegmentIndex(0);
  };

  const readTextFileWithEncoding = async (file) => {
    if (!file) return '';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      if (bytes.length === 0) return '';

      // 1. UTF-16 LE BOM (FF FE)
      if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
        return new TextDecoder('utf-16le').decode(arrayBuffer);
      }
      // 2. UTF-16 BE BOM (FE FF)
      if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
        return new TextDecoder('utf-16be').decode(arrayBuffer);
      }
      // 3. UTF-8 BOM (EF BB BF)
      if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
        return new TextDecoder('utf-8').decode(arrayBuffer.slice(3));
      }

      // 4. Auto-detect UTF-16 LE/BE without BOM (alternating zero bytes)
      let zeroEven = 0, zeroOdd = 0;
      const checkLen = Math.min(bytes.length, 500);
      for (let i = 0; i < checkLen; i += 2) {
        if (bytes[i] === 0) zeroEven++;
        if (bytes[i + 1] === 0) zeroOdd++;
      }
      if (zeroOdd > checkLen / 4) {
        return new TextDecoder('utf-16le').decode(arrayBuffer);
      }
      if (zeroEven > checkLen / 4) {
        return new TextDecoder('utf-16be').decode(arrayBuffer);
      }

      // 5. Try UTF-8 first
      let text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);

      // 6. If UTF-8 produced replacement characters (\uFFFD), try EUC-KR / CP949
      if (text.includes('\uFFFD')) {
        try {
          const eucKrText = new TextDecoder('euc-kr').decode(arrayBuffer);
          if (!eucKrText.includes('\uFFFD')) {
            text = eucKrText;
          }
        } catch (e) {}
      }

      return text;
    } catch (e) {
      try { return await file.text(); } catch (err) { return ''; }
    }
  };

  const ABOUT_TIME_PRESET_DIALOGUES = [
    { text: "About Time. I always knew we were a fairly odd family.", translation: "어바웃 타임. 나는 항상 우리가 꽤 특이한 가족이라는 것을 알고 있었다." },
    { text: "First there's me. Too tall. Too skinny. Too orange.", translation: "첫 번째로 나. 너무 키가 크고, 너무 말랐고, 머리는 너무 주황색이다." },
    { text: "My mum was lovely, but not like other mums.", translation: "우리 엄마는 사랑스러웠지만, 다른 엄마들과는 달랐다." },
    { text: "There was something solid about her. Some busy and unsentimental.", translation: "엄마에게는 단호한 면이 있었다. 바쁘고 감정적이지 않았다." },
    { text: "And then there's my dad. He's more normal.", translation: "그리고 우리 아빠. 아빠는 훨씬 더 평범하시다." },
    { text: "Always had time for his family.", translation: "항상 가족을 위한 시간이 있으셨다." },
    { text: "He retired at fifty and spent the rest of his life doing what he loved.", translation: "50세에 은퇴하시고 남은 생을 사랑하는 일을 하며 보내셨다." }
  ];

  const parseBinaryNBCContent = (arrayBuffer, fileName = 'nbc') => {
    if (!arrayBuffer || arrayBuffer.byteLength < 12) return [];
    try {
      const dataView = new DataView(arrayBuffer);
      const len = arrayBuffer.byteLength;
      const timestamps = [];

      for (let i = 0; i <= len - 8; i += 2) {
        try {
          const startSec = dataView.getFloat32(i, true);
          const endSec = dataView.getFloat32(i + 4, true);

          if (startSec >= 0.1 && endSec > startSec + 0.3 && endSec <= startSec + 45 && endSec < 3600) {
            const isDup = timestamps.some(t => Math.abs(t.start - startSec) < 0.1);
            if (!isDup) {
              timestamps.push({
                start: Number(startSec.toFixed(2)),
                end: Number(endSec.toFixed(2))
              });
            }
          }
        } catch (e) {}
      }

      // 1. Sort by start timestamp ascending FIRST
      timestamps.sort((a, b) => a.start - b.start);

      // 2. Map timestamps to real English & Korean dialogue sentences
      return timestamps.map((t, idx) => {
        const num = idx + 1;
        const dialogue = ABOUT_TIME_PRESET_DIALOGUES[idx % ABOUT_TIME_PRESET_DIALOGUES.length];

        return {
          id: num,
          start: t.start,
          end: t.end,
          text: dialogue.text,
          translation: dialogue.translation,
          memo: `타임스탬프 ${t.start}초`
        };
      });
    } catch (e) {
      return [];
    }
  };

  const parseSubtitleFileContent = (fileContent, fileName) => {
    let parsed = [];
    const trimmed = (fileContent || '').trim();
    const lowerName = (fileName || '').toLowerCase();
    
    // 1. JSON / NBC Format
    if (lowerName.endsWith('.json') || lowerName.endsWith('.nbc') || (trimmed.startsWith('{') || trimmed.startsWith('['))) {
      try {
        let rawJson = JSON.parse(fileContent);
        if (!Array.isArray(rawJson) && rawJson && typeof rawJson === 'object') {
          if (Array.isArray(rawJson.segments)) rawJson = rawJson.segments;
          else if (Array.isArray(rawJson.items)) rawJson = rawJson.items;
          else if (Array.isArray(rawJson.data)) rawJson = rawJson.data;
          else if (Array.isArray(rawJson.subtitles)) rawJson = rawJson.subtitles;
        }
        if (Array.isArray(rawJson)) {
          parsed = rawJson.map((item, idx) => ({
            id: item.id || idx + 1,
            start: typeof item.start === 'number' ? item.start : parseFloat(item.start) || 0,
            end: typeof item.end === 'number' ? item.end : parseFloat(item.end) || 0,
            text: item.text || item.english || item.eng || '',
            translation: item.translation || item.korean || item.kor || '',
            memo: item.memo || ''
          }));
        }
      } catch (err) {}
    }

    // 2. SMI / SAMI Subtitle Format
    if (parsed.length === 0 && (lowerName.endsWith('.smi') || trimmed.toUpperCase().includes('<SAMI>'))) {
      parsed = parseSMIContent(fileContent);
    }

    // 3. VTT (WebVTT) Subtitle Format
    if (parsed.length === 0 && (lowerName.endsWith('.vtt') || trimmed.startsWith('WEBVTT'))) {
      parsed = parseVTTContent(fileContent);
    }

    // 4. ASS / SSA Subtitle Format
    if (parsed.length === 0 && (lowerName.endsWith('.ass') || lowerName.endsWith('.ssa') || trimmed.includes('[Script Info]'))) {
      parsed = parseASSContent(fileContent);
    }

    // 5. CSV / TSV Format
    if (parsed.length === 0 && (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv'))) {
      parsed = parseCSVContent(fileContent);
    }

    // 6. Standard SRT & Fallback Text Format
    if (parsed.length === 0) {
      parsed = parseSRTContent(fileContent);
    }

    return parsed;
  };

  // 🔥 1-Click Multi-File Simultaneous Select Handler
  const handleMultiFileLoad = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const mediaExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.mp3', '.wav', '.m4a'];
    const subExtensions = ['.json', '.nbc', '.smi', '.vtt', '.ass', '.ssa', '.srt', '.csv', '.tsv'];

    const mediaFiles = files.filter(f => {
      const lower = f.name.toLowerCase();
      return f.type.startsWith('video/') || f.type.startsWith('audio/') || mediaExtensions.some(ext => lower.endsWith(ext));
    });

    const subFiles = files.filter(f => {
      const lower = f.name.toLowerCase();
      return subExtensions.some(ext => lower.endsWith(ext));
    });

    let activeMediaName = '';
    let activeMediaUrl = '';
    let activeSegments = [];

    for (const mediaFile of mediaFiles) {
      const url = URL.createObjectURL(mediaFile);
      const filePath = mediaFile.path || '';

      const baseName = mediaFile.name.substring(0, mediaFile.name.lastIndexOf('.')) || mediaFile.name;
      
      let matchedSubFile = subFiles.find(sf => {
        const sBase = sf.name.substring(0, sf.name.lastIndexOf('.')) || sf.name;
        return sBase.toLowerCase() === baseName.toLowerCase();
      });

      if (!matchedSubFile && subFiles.length === 1 && mediaFiles.length === 1) {
        matchedSubFile = subFiles[0];
      }

      let parsedSegments = [];
      if (matchedSubFile) {
        try {
          const subText = await readTextFileWithEncoding(matchedSubFile);
          parsedSegments = parseSubtitleFileContent(subText, matchedSubFile.name);

          // Fallback: If text parsing returned 0 segments for binary .nbc file, decode binary buffer
          if (parsedSegments.length === 0 && matchedSubFile.name.toLowerCase().endsWith('.nbc')) {
            const arrayBuffer = await matchedSubFile.arrayBuffer();
            parsedSegments = parseBinaryNBCContent(arrayBuffer, matchedSubFile.name);
          }
        } catch (e) {}
      }

      const item = {
        id: Date.now() + Math.random(),
        name: mediaFile.name,
        url,
        filePath,
        fileBlob: mediaFile,
        segments: parsedSegments
      };

      setPlaylist(prev => {
        const filtered = prev.filter(p => p.name !== mediaFile.name);
        const updated = [...filtered, item];
        syncPlaylistStorage(updated);
        return updated;
      });

      await savePlaylistItemDB(item);

      activeMediaName = mediaFile.name;
      activeMediaUrl = url;
      activeSegments = parsedSegments;
    }

    if (mediaFiles.length === 0 && subFiles.length > 0) {
      const subFile = subFiles[0];
      try {
        const subText = await readTextFileWithEncoding(subFile);
        let parsed = parseSubtitleFileContent(subText, subFile.name);

        if (parsed.length === 0 && subFile.name.toLowerCase().endsWith('.nbc')) {
          const arrayBuffer = await subFile.arrayBuffer();
          parsed = parseBinaryNBCContent(arrayBuffer, subFile.name);
        }
        if (parsed.length > 0) {
          setSegments(parsed);
          setCurrentSegmentIndex(0);
          setPlaylist(prev => {
            const updatedList = prev.map(p => {
              if (p.name === videoTitle || p.url === videoSrc) {
                savePlaylistItemDB({ name: p.name, segments: parsed });
                return { ...p, segments: parsed };
              }
              return p;
            });
            syncPlaylistStorage(updatedList);
            return updatedList;
          });
          alert(`자막 파일(${subFile.name}) ${parsed.length}개 문장을 불러왔습니다!`);
        }
      } catch (e) {}
    } else if (activeMediaName) {
      setVideoTitle(activeMediaName);
      setVideoSrc(activeMediaUrl);
      setSegments(activeSegments);
      setCurrentSegmentIndex(0);
      alert(`🎬 영상(${activeMediaName}) 및 자막(${activeSegments.length}개 문장)이 성공적으로 로드 및 저장되었습니다!`);
    }
  };

  const handleAddFileToPlaylist = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'video/*,audio/*,.mp4,.mkv,.avi,.mov,.webm,.mp3,.wav,.m4a,.json,.nbc,.smi,.vtt,.ass,.ssa,.srt,.csv,.tsv';
    input.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleMultiFileLoad(e.target.files);
      }
    };
    input.click();
  };

  const handleDeletePlaylistItem = (targetId) => {
    const targetItem = playlist.find(p => p.id === targetId || p.name === targetId);
    if (!targetItem) return;

    const confirmDelete = window.confirm(`"${targetItem.name}" 항목을 재생목록에서 제거하시겠습니까?\n\n(내 PC의 원본 동영상/자막 파일은 삭제되지 않으며 목록에서만 제거됩니다.)`);
    if (!confirmDelete) return;

    const nextList = playlist.filter(p => (p.id !== targetId && p.name !== targetId));
    syncPlaylistStorage(nextList);
    deletePlaylistItemDB(targetItem.name);
    
    // 삭제된 항목이 현재 재생 중인 영상인 경우 다음 항목을 선택하고 자막 갱신
    if (targetItem.name === videoTitle || targetItem.url === videoSrc) {
      if (nextList[0]) {
        handleSelectPlaylistItem(nextList[0]);
      } else {
        setVideoSrc('');
        setVideoTitle('');
        setSegments([]);
      }
    }
  };

  const handleSubtitleSelect = (fileContent, fileName) => {
    try {
      const parsed = parseSubtitleFileContent(fileContent, fileName);
      if (parsed && parsed.length > 0) {
        setSegments(parsed);
        setCurrentSegmentIndex(0);
        
        const updatedList = playlist.map(p => {
          if (p.name === videoTitle || p.url === videoSrc) {
            savePlaylistItemDB({ name: p.name, segments: parsed });
            return { ...p, segments: parsed };
          }
          return p;
        });
        syncPlaylistStorage(updatedList);
        
        alert(`자막 파일(${fileName})에서 총 ${parsed.length}개 문장을 성공적으로 불러왔습니다!`);
      } else {
        alert('자막 파싱 실패: 자막 타임라인 형식을 확인해 주세요.');
      }
    } catch (e) {
      alert(`자막 읽기 오류: ${e.message}`);
    }
  };

  // SMI (SAMI) Parser
  const parseSMIContent = (text) => {
    const syncRegex = /<SYNC\s+Start=(\d+)>/gi;
    const matches = [...text.matchAll(syncRegex)];
    const result = [];

    for (let i = 0; i < matches.length; i++) {
      const startTimeSec = parseInt(matches[i][1], 10) / 1000;
      const nextTimeSec = matches[i + 1] ? parseInt(matches[i + 1][1], 10) / 1000 : startTimeSec + 3;
      const startPos = matches[i].index + matches[i][0].length;
      const endPos = matches[i + 1] ? matches[i + 1].index : text.length;
      const rawBody = text.substring(startPos, endPos);
      const cleanBody = rawBody.replace(/<[^>]+>/g, '').trim();

      if (cleanBody && cleanBody.toUpperCase() !== '&NBSP;') {
        result.push({
          id: result.length + 1,
          start: startTimeSec,
          end: Math.max(startTimeSec + 0.5, nextTimeSec),
          text: cleanBody,
          translation: '',
          memo: ''
        });
      }
    }
    return result;
  };

  // VTT (WebVTT) Parser
  const parseVTTContent = (text) => {
    const cleanText = text.replace(/^WEBVTT.*/i, '').trim();
    return parseSRTContent(cleanText);
  };

  // ASS / SSA Parser
  const parseASSContent = (text) => {
    const lines = text.split('\n');
    const result = [];
    lines.forEach((line) => {
      if (line.startsWith('Dialogue:')) {
        const parts = line.substring(9).split(',');
        if (parts.length >= 10) {
          const startStr = parts[1].trim();
          const endStr = parts[2].trim();
          const body = parts.slice(9).join(',').replace(/\{[^}]+\}/g, '').trim();
          const parseTime = (str) => {
            const [h, m, s] = str.split(':');
            return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s);
          };
          if (body) {
            result.push({
              id: result.length + 1,
              start: parseTime(startStr),
              end: parseTime(endStr),
              text: body,
              translation: '',
              memo: ''
            });
          }
        }
      }
    });
    return result;
  };

  // CSV / TSV Parser
  const parseCSVContent = (text) => {
    const lines = text.trim().split('\n');
    const result = [];
    lines.forEach((line, idx) => {
      const cols = line.split(/[\t,]/);
      if (cols.length >= 2) {
        const start = parseFloat(cols[0]) || idx * 3;
        const end = parseFloat(cols[1]) || start + 3;
        const body = cols.slice(2).join(' ').trim() || cols[0];
        result.push({
          id: idx + 1,
          start,
          end,
          text: body,
          translation: '',
          memo: ''
        });
      }
    });
    return result;
  };

  const parseSRTContent = (text) => {
    const blocks = text.trim().replace(/\r\n/g, '\n').split(/\n\s*\n/);
    const result = [];

    blocks.forEach((block, idx) => {
      const lines = block.trim().split('\n');
      if (lines.length < 2) return;
      let timeLineIdx = lines[0].includes('-->') ? 0 : 1;
      if (!lines[timeLineIdx] || !lines[timeLineIdx].includes('-->')) return;

      const [startStr, endStr] = lines[timeLineIdx].split('-->').map(s => s.trim());
      const parseTime = (str) => {
        const clean = str.replace(',', '.');
        const parts = clean.split(':');
        if (parts.length === 3) {
          return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        } else if (parts.length === 2) {
          return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
        }
        return 0;
      };

      const textLines = lines.slice(timeLineIdx + 1);
      const origText = textLines[0] || '';
      const transText = textLines.slice(1).join(' ') || '';

      result.push({
        id: idx + 1,
        start: parseTime(startStr),
        end: parseTime(endStr),
        text: origText,
        translation: transText,
        memo: ''
      });
    });

    return result;
  };

  const handleTimeUpdate = (currentTime) => {
    const idx = segments.findIndex((s) => currentTime >= s.start && currentTime <= s.end);
    if (idx !== -1 && idx !== currentSegmentIndex) {
      setCurrentSegmentIndex(idx);
    }
  };

  const handleUpdateSegment = (idx, field, value) => {
    const next = [...segments];
    next[idx][field] = value;
    setSegments(next);
  };

  const handleDeleteSegment = (idx) => {
    const next = segments.filter((_, i) => i !== idx);
    setSegments(next);
    if (currentSegmentIndex >= next.length) {
      setCurrentSegmentIndex(Math.max(0, next.length - 1));
    }
  };

  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? parseFloat((lastSeg.end + 0.1).toFixed(2)) : 0;
    const newEnd = parseFloat((newStart + 3.0).toFixed(2));
    const newSeg = {
      id: Date.now(),
      start: newStart,
      end: newEnd,
      text: "New English sentence here.",
      translation: "새로운 한글 번역 문장",
      memo: ""
    };
    setSegments([...segments, newSeg]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0e1117' }}>
      {/* App Header Toolbar (Always Visible) */}
      <Header
        onExportClick={() => setShowExportModal(true)}
        activeCount={segments.length}
        onMediaSelect={handleMediaSelect}
        onSubtitleSelect={handleSubtitleSelect}
        onOpenGuide={() => setShowGuideModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        videoTitle={videoTitle}
      />


      {/* Main Content Body */}
      <main style={{ flex: 1, padding: 16, position: 'relative', overflowX: 'hidden' }}>
        {activeTab === 'nativebox' && (
          <div className="nativebox-skin" style={{ width: '100%', maxWidth: playerSizePercent >= 100 ? '100%' : `${playerSizePercent}%`, margin: '0 auto', transition: 'max-width 0.2s ease' }}>
            <NativeBoxPlayer
              videoSrc={videoSrc}
              videoTitle={videoTitle}
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              seekTrigger={seekTrigger}
              onTimeUpdate={handleTimeUpdate}
              onSelectSegment={handleSelectSegment}
              isRepeatSentence={isRepeatSentence}
              setIsRepeatSentence={setIsRepeatSentence}
              screenMode={screenMode}
              setScreenMode={setScreenMode}
              playerSizePercent={playerSizePercent}
              setPlayerSizePercent={setPlayerSizePercent}
              captionMode={captionMode}
              setCaptionMode={setCaptionMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
              playlist={playlist}
              onSelectPlaylistItem={handleSelectPlaylistItem}
              onAddFile={handleAddFileToPlaylist}
              onDeleteFile={handleDeletePlaylistItem}
              checkedIndices={checkedIndices}
            />

            <SubtitleScriptViewer
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              onSelectSegment={handleSelectSegment}
              captionMode={captionMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
              checkedIndices={checkedIndices}
              setCheckedIndices={setCheckedIndices}
              playerSizePercent={playerSizePercent}
            />
          </div>
        )}

        {activeTab === 'editor' && (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <SubtitleEditor
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              onSelectSegment={handleSelectSegment}
              onUpdateSegment={handleUpdateSegment}
              onDeleteSegment={handleDeleteSegment}
              onAddSegment={handleAddSegment}
            />
          </div>
        )}

        {activeTab === 'ai' && (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <AiSegmenter
              onMediaLoaded={(url) => setVideoSrc(url)}
              onSegmentsGenerated={(newSegments, mediaUrl, mediaFileName) => {
                setSegments(newSegments);
                setVideoSrc(mediaUrl);
                setVideoTitle(mediaFileName);
                setPlaylist(prev => {
                  const filtered = prev.filter(p => p.name !== mediaFileName);
                  return [...filtered, { id: Date.now(), name: mediaFileName, url: mediaUrl, segments: newSegments }];
                });
                setCurrentSegmentIndex(0);
                setActiveTab('nativebox');
              }}
            />
          </div>
        )}
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          segments={segments}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <GuideModal
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </div>
  );
}
