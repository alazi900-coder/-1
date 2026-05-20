/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Tone from 'tone';
import { useState, useRef, useMemo, useEffect, ChangeEvent } from 'react';
import { 
  Mic2, 
  Play, 
  Download, 
  Trash2, 
  Loader2, 
  Volume2, 
  Sparkles,
  Gamepad2,
  Sword,
  Wand2,
  Ghost,
  Cpu,
  Music,
  Music2,
  Search,
  Filter,
  Flame,
  Wind,
  Zap,
  Target,
  Bell,
  Box,
  Building2,
  Trees,
  Upload,
  Plus,
  Layers,
  ChevronRight,
  UserPlus,
  SlidersHorizontal,
  Stars,
  Heart,
  Settings,
  Info,
  Copy,
  Check,
  X,
  UserRound,
  CopyPlus,
  GripVertical,
  HelpCircle,
  MessageSquareQuote,
  Eye,
  AudioLines,
  Shield,
  Book
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';

const ICON_MAP: Record<string, any> = {
  Mic2, Play, Download, Trash2, Loader2, Volume2, Sparkles, Gamepad2, Sword, Wand2, Ghost, Cpu, Music, Music2, Search, Filter, Flame, Wind, Zap, Target, Bell, Box, Building2, Trees, Upload, Plus, Layers, ChevronRight, UserPlus, SlidersHorizontal, Stars, Heart, Settings, Info, Copy, Check, X, UserRound, CopyPlus, GripVertical, HelpCircle, MessageSquareQuote
};

const getIcon = (iconInput: any) => {
  if (typeof iconInput === 'string') return ICON_MAP[iconInput] || Mic2;
  // If it's a corrupted object from localStorage (doesn't have React internal properties)
  if (iconInput && typeof iconInput === 'object' && !iconInput.$$typeof) return Mic2;
  return iconInput || Mic2;
};

const TEMPERAMENT_AR: Record<string, string> = {
  arrogant: 'متغطرس',
  humble: 'متواضع',
  eccentric: 'غريب الأطوار',
  calm: 'هادئ',
  cunning: 'ماكر',
  calculated: 'محنك'
};

const ALIGNMENT_AR: Record<string, string> = {
  heroic: 'بطولي',
  villainous: 'شرير',
  neutral: 'محايد'
};

const GENDER_AR: Record<string, string> = {
  male: 'ذكر',
  female: 'أنثى'
};

// No client-side Gemini AI initialization for security
// Moving all AI logic to server.ts

const callGeminiGenerate = async (params: any) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to call Gemini API');
  }
  return response.json();
};

const callGeminiTTS = async (params: { text: string, voiceName: string, systemInstruction?: string, config?: any, model?: string }) => {
  const response = await fetch('/api/gemini/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const err = await response.json();
    const error = new Error(err.error || 'Failed to generate speech');
    (error as any).status = response.status;
    (error as any).details = err;
    throw error;
  }
  return response.json();
};

import { ALL_VOICES } from './data/characters';
import { ZELDA_TEMPLATES, SFX_TAGS, PROMPT_EXAMPLES } from './data/config';
import { VoiceName, sanitizeVoiceName, VoiceTone, CharacterVoice } from './types/voices';
const VOICES = ALL_VOICES;

function bufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels: Float32Array[] = [];
  const sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7fff) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });
}

async function ensure48kHz(blob: Blob): Promise<Blob> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    // If it's already 48kHz, return as is
    if (audioBuffer.sampleRate === 48000) return blob;
    
    const targetSampleRate = 48000;
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      Math.ceil(audioBuffer.length * targetSampleRate / audioBuffer.sampleRate),
      targetSampleRate
    );
    
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();
    
    const renderedBuffer = await offlineCtx.startRendering();
    return bufferToWav(renderedBuffer);
  } catch (err) {
    console.error('Error during resampling:', err);
    return blob; // Fallback to original
  }
}

function createAudioBlob(base64Data: string): Blob {
  try {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      return new Blob([bytes], { type: 'audio/wav' });
    }
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
      return new Blob([bytes], { type: 'audio/mpeg' });
    }
    if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) {
      return new Blob([bytes], { type: 'audio/mpeg' });
    }

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = len;
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);
    
    return new Blob([wavHeader, bytes], { type: 'audio/wav' });
  } catch (e) {
    console.error("PCM transformation failed:", e);
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: 'audio/wav' });
  }
}

interface GeneratedAudio {
  id: string;
  text: string;
  voice: string;
  tone?: string;
  settings: {
    pitch: number;
    speed: number;
    intensity: string;
  };
  blobUrl: string;
  timestamp: number;
}

interface MixerItem {
  id: string;
  originalId: string;
  name: string;
  url: string;
  type: 'voice' | 'sfx' | 'custom';
  volume: number;
  speed: number;
  delay: number;
  loop: boolean;
}


interface DialogueTemplate {
  id: string;
  label: string;
  text: string;
  voiceId: string;
  toneId?: string;
}

interface CompositeVoice {
  id: string;
  nameAr: string;
  archetypeAr?: string;
  voiceAId: string;
  voiceBId: string;
  blendRatio: number; // 0: Pure A, 0.5: Equal mix, 1: Pure B
  guidance?: string;
  icon?: any;
  color?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'voice' | 'lab' | 'script' | 'mixer'>('voice');
  const [labMode, setLabMode] = useState<'cloning' | 'blending'>('blending');
  const [text, setText] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showSfxDropdown, setShowSfxDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAutoGenerate, setIsAutoGenerate] = useState(false);
  const [scriptLines, setScriptLines] = useState<{id: string, text: string, voiceId: string, toneId: string, audioUrl?: string, isGenerating?: boolean}[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [generatingDialogue, setGeneratingDialogue] = useState<string | null>(null);
  const [dialogueResults, setDialogueResults] = useState<Record<string, string[]>>({});
  const [selectedTone, setSelectedTone] = useState<string | null>(() => {
    // Try to get saved default tone for the initial voice
    const saved = localStorage.getItem('default-tones');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[VOICES[0].id]) return parsed[VOICES[0].id];
    }
    // Fallback to first tone of the first voice
    return VOICES[0].tonesAr?.[0]?.id || null;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [historyFx, setHistoryFx] = useState<Record<string, { pitch: number, speed: number, reverb: number, chorus: boolean }>>({});
  const [expandedFxId, setExpandedFxId] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'master' | 'custom' | 'hybrid' | 'cloned'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [alignmentFilter, setAlignmentFilter] = useState<'all' | 'heroic' | 'villainous' | 'neutral'>('all');
  const [temperamentFilter, setTemperamentFilter] = useState<'all' | 'arrogant' | 'humble' | 'eccentric' | 'calm' | 'cunning' | 'calculated'>('all');
  const [voiceSort, setVoiceSort] = useState<'default' | 'name' | 'alignment'>('default');

  const currentlyPlayingRef = useRef<string | null>(null);
  useEffect(() => {
    currentlyPlayingRef.current = currentlyPlaying;
  }, [currentlyPlaying]);

  const [mixerItems, setMixerItems] = useState<MixerItem[]>([]);
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 1.0,
    intensity: 'natural' as 'whisper' | 'calm' | 'natural' | 'energetic' | 'dramatic' | 'shouting'
  });

  const [customTemplates, setCustomTemplates] = useState<DialogueTemplate[]>(() => {
    const saved = localStorage.getItem('custom-dialogue-templates');
    if (saved) return JSON.parse(saved);
    return ZELDA_TEMPLATES.map((t, i) => ({
      id: `template-${i}`,
      label: t.label,
      text: t.text,
      voiceId: t.voice
    }));
  });
  const [templateEditor, setTemplateEditor] = useState<DialogueTemplate | null>(null);

  const [presets, setPresets] = useState<{id: string, name: string, items: MixerItem[], settings: any, timestamp: number}[]>(() => {
    const saved = localStorage.getItem('zelda-presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [voiceOverrides, setVoiceOverrides] = useState<Record<string, { 
    icon?: any, 
    color?: string,
    pitch?: number,
    speed?: number,
    descriptionEn?: string,
    descriptionAr?: string,
    baseVoice?: VoiceName
  }>>(() => {
    const saved = localStorage.getItem('voice-overrides');
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing voice overrides", e);
      return {};
    }
  });

  const [editingVoice, setEditingVoice] = useState<string | null>(null);
  const [clonedVoices, setClonedVoices] = useState<any[]>(() => {
    const saved = localStorage.getItem('cloned-voices');
    return saved ? JSON.parse(saved) : [];
  });
  const [customTonesByVoice, setCustomTonesByVoice] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('custom-tones');
    return saved ? JSON.parse(saved) : {};
  });
  const [defaultTones, setDefaultTones] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('default-tones');
    const base = saved ? JSON.parse(saved) : {};
    // Ensure Ganondorf has a default tone if none is set
    if (!base.ganon) base.ganon = 'mummified_wheeze';
    return base;
  });
  const [toneEditor, setToneEditor] = useState<{voiceId: string, tone: any} | null>(null);
  const [compositeVoices, setCompositeVoices] = useState<CompositeVoice[]>(() => {
    const saved = localStorage.getItem('composite-voices');
    return saved ? JSON.parse(saved) : [];
  });
  const [compositeEditor, setCompositeEditor] = useState<Partial<CompositeVoice> | null>(null);

  const filteredVisibleVoices = useMemo(() => {
    let list = [];
    if (voiceFilter === 'all' || voiceFilter === 'master') list.push(...VOICES);
    if (voiceFilter === 'all' || voiceFilter === 'custom') list.push({ id: 'custom', nameAr: 'شخصية مخصصة', icon: UserPlus, color: 'from-emerald-500 to-teal-600', archetypeAr: 'إعدادات يدوية' } as any);
    if (voiceFilter === 'all' || voiceFilter === 'hybrid') list.push(...compositeVoices);
    if (voiceFilter === 'all' || voiceFilter === 'cloned') list.push(...clonedVoices);

    return list.filter(v => {
      // Search matching
      const matchesSearch = v.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (v as any).archetypeAr?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Gender filter (Master voices only usually have gender, clones/composites might have it)
      if (genderFilter !== 'all' && (v as any).gender && (v as any).gender !== genderFilter) return false;

      // Alignment filter
      if (alignmentFilter !== 'all' && (v as any).alignment && (v as any).alignment !== alignmentFilter) return false;

      // Temperament filter
      if (temperamentFilter !== 'all' && (v as any).temperament && (v as any).temperament !== temperamentFilter) return false;

      return true;
    }).sort((a, b) => {
      if (voiceSort === 'name') return a.nameAr.localeCompare(b.nameAr, 'ar');
      if (voiceSort === 'alignment') return ((a as any).alignment || '').localeCompare((b as any).alignment || '');
      return 0;
    });
  }, [searchQuery, voiceFilter, genderFilter, alignmentFilter, temperamentFilter, voiceSort, compositeVoices, clonedVoices]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeMixAudios = useRef<HTMLAudioElement[]>([]);
  const tonePlayers = useRef<Record<string, { player: Tone.Player, pitchShift: Tone.PitchShift, reverb: Tone.Reverb }>>({});
  const [activeTonePlayerId, setActiveTonePlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTonePlayerId && tonePlayers.current[activeTonePlayerId]) {
      const fx = historyFx[activeTonePlayerId] || { pitch: 0, speed: 1.0, reverb: 0, chorus: false };
      const { player, pitchShift, reverb } = tonePlayers.current[activeTonePlayerId];
      if (pitchShift) pitchShift.pitch = fx.pitch;
      if (player) player.playbackRate = fx.speed;
      if (reverb) reverb.wet.value = fx.reverb;
    }
  }, [historyFx, activeTonePlayerId]);

  useEffect(() => {
    localStorage.setItem('voice-overrides', JSON.stringify(voiceOverrides));
  }, [voiceOverrides]);

  useEffect(() => {
    localStorage.setItem('cloned-voices', JSON.stringify(clonedVoices));
  }, [clonedVoices]);

  useEffect(() => {
    localStorage.setItem('custom-tones', JSON.stringify(customTonesByVoice));
  }, [customTonesByVoice]);

  useEffect(() => {
    localStorage.setItem('default-tones', JSON.stringify(defaultTones));
  }, [defaultTones]);

  useEffect(() => {
    localStorage.setItem('composite-voices', JSON.stringify(compositeVoices));
  }, [compositeVoices]);

  useEffect(() => {
    const override = voiceOverrides[selectedVoice];
    const persona = VOICES.find(v => v.id === selectedVoice) || 
                   clonedVoices.find(v => v.id === selectedVoice) ||
                   compositeVoices.find(v => v.id === selectedVoice);
                   
    if (override) {
      if (override.pitch !== undefined) setVoiceSettings(v => ({ ...v, pitch: override.pitch! }));
      if (override.speed !== undefined) setVoiceSettings(v => ({ ...v, speed: override.speed! }));
    } else if (persona) {
      setVoiceSettings(v => ({ 
        ...v, 
        pitch: (persona as any).pitch ?? 1.0, 
        speed: (persona as any).speed ?? 1.0 
      }));
    }

    // Automatically pick default tone if available
    const defTone = defaultTones[selectedVoice];
    if (defTone) {
      setSelectedTone(defTone);
    } else {
      // Fallback to first primary tone
      if (persona && persona.tonesAr && persona.tonesAr.length > 0) {
        setSelectedTone(persona.tonesAr[0].id);
      } else {
        setSelectedTone(null);
      }
    }
  }, [selectedVoice, defaultTones, clonedVoices, compositeVoices, voiceOverrides]);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    nameAr: string;
    archetypeAr: string;
    descriptionAr: string;
    traits: string;
    suggestedPitch: number;
    suggestedSpeed: number;
    suggestedBaseVoice: string;
    gender: 'male' | 'female';
    alignment: 'heroic' | 'villainous' | 'neutral';
    temperament: 'arrogant' | 'humble' | 'eccentric' | 'calm';
    intellect: 'genius' | 'average' | 'foolish';
    descriptionEn: string;
    transcription?: string;
  } | null>(null);
  const fileInputAnalysisRef = useRef<HTMLInputElement>(null);

  const [customVoice, setCustomVoice] = useState({
    nameAr: 'شخصية مخصصة',
    gender: 'male' as 'male' | 'female',
    alignment: 'heroic' as 'heroic' | 'villainous' | 'neutral',
    temperament: 'calm' as 'arrogant' | 'humble' | 'eccentric' | 'calm' | 'cunning' | 'calculated',
    intellect: 'average' as 'genius' | 'average' | 'foolish' | 'ancient' | 'hyper-intelligent',
    archetypeAr: 'بطل مجهول الهوية',
    description: 'صوت غامض وواثق يملؤه الأمل والشهامة.',
    traits: 'شجاع, مخلص, حكيم',
    age: 'young',
    timbre: 'smooth',
    guidance: 'Define the unique vocal essence of this custom character through descriptive adjectives and performance directives.',
    baseVoice: 'Fenrir' as VoiceName
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isAutoGenerate && text.trim().length > 10) {
      const timer = setTimeout(() => {
        handleGenerate();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [text, isAutoGenerate]);

  const insertTextAtCursor = (newText: string) => {
    if (!textareaRef.current) {
      setText(prev => prev + newText);
      return;
    }

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = text;
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);
    
    const updatedText = before + newText + after;
    setText(updatedText);

    // Set cursor position after the inserted text in the next frame
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + newText.length, start + newText.length);
      }
    }, 0);
  };

  const handleAutoGenerateDialogue = async () => {
    if (isGeneratingDialogue) return;
    setIsGeneratingDialogue(true);
    try {
      let persona: any = VOICES.find(v => v.id === selectedVoice) || 
                       clonedVoices.find(v => v.id === selectedVoice) || 
                       compositeVoices.find(v => v.id === selectedVoice);
      
      if (selectedVoice === 'custom') {
        persona = customVoice;
      }

      if (!persona) return;

      const personaContext = getPersonaContextForVoice(selectedVoice, selectedTone);

      const response = await callGeminiGenerate({
        systemInstruction: "أنت كاتب حوارات سينمائي محترف. وظيفتك هي كتابة جملة واحدة كاملة المعنى وبليغة لشخصيات في عالم خيالي. يجب أن ينفذ الحوار بدقة شخصية وعمر ومزاج المتحدث. مثلاً، المتغطرس يتحدث بتعالٍ وسخرية، والماكر يستخدم كلمات خفية النوايا، والهادئ يتحدث بحكمة وقور. لا تشرح شيئاً، لا تضع علامات تنصيص، ولا تقطع الجملة أبداً. تأكد من اتمام الجملة بنقطة أو علامة تعجب.",
        contents: [{
          parts: [{
            text: `استناداً إلى مواصفات الشخصية التالية:
            ${personaContext}
            
            اكتب الآن جملة حوارية واحدة قوية (15-20 كلمة) تنبض بأسلوب هذه الشخصية، وتعكس مزاجها المميز (Temperament)، في عالم خيالي أسطوري.
            ملاحظة: يمكنك إضافة مؤثر صوتي واحد مثل [SFX: تنهيدة عميقة] في المكان المناسب.`
          }]
        }],
        config: {
          temperature: 0.5,
          maxOutputTokens: 600,
        }
      });

      if (response.text) {
        let cleanedText = response.text.trim().replace(/^"|"$/g, '');
        // Sanity check: Ensure [SFX: tags are closed
        if (cleanedText.includes('[') && !cleanedText.includes(']')) {
          cleanedText += ']';
        }
        setText(cleanedText);
      }
    } catch (err) {
      console.error("Auto-generate dialogue error:", err);
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  const handleAutoComposeScene = async () => {
    if (isGeneratingDialogue) return;
    setIsGeneratingDialogue(true);
    try {
      const charList = VOICES.map(v => `${v.nameAr} [ID: ${v.id}] (${v.archetypeAr})`).join('\n');
      const response = await callGeminiGenerate({
        systemInstruction: "أنت كاتب سيناريو أسطوري. اكتب مشهداً حوارياً (JSON array). يجب أن يعكس حوار كل شخصية طبيعتها، وعمرها، ومزاجها بدقة واحترافية. يجب أن تبدو الشخصيات متباينة في الألفاظ والنبرة (مثال: الهادئ، الغاضب، الماكر). الجمل تامة المعنى ولا تنتهي بشكل مفاجئ.",
        contents: [{
          parts: [{
            text: `قم بتأليف مشهد حواري قصير (4-6 جمل) بين هذه الشخصيات:
            ${charList}
            
            الموضوع: مواجهة مصيرية لحل النزاع أو كشف أسرار قديمة.
            التنسيق الإلزامي: JSON array of objects, each containing { "voiceId": string, "text": string }`
          }]
        }],
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        const lines = JSON.parse(response.text);
        if (Array.isArray(lines)) {
          const newLines = lines.map(l => {
            let text = l.text;
            if (text.includes('[') && !text.includes(']')) {
              text += ']';
            }
            return {
              id: crypto.randomUUID(),
              text: text,
              voiceId: l.voiceId || VOICES[0].id,
              toneId: '',
              isGenerating: false
            };
          });
          setScriptLines(prev => [...prev, ...newLines]);
        }
      }
    } catch (err) {
      console.error("Auto-compose scene error:", err);
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  const addLineToScript = () => {
    const newLine = {
      id: crypto.randomUUID(),
      text: text || 'نص جديد...',
      voiceId: selectedVoice,
      toneId: selectedTone || '',
      isGenerating: false
    };
    setScriptLines(prev => [...prev, newLine]);
    setText('');
    setActiveTab('script');
  };

  const getOptimalVoiceModel = (text: string, voiceId: string) => {
    // Check built-in voices
    let profile: any = VOICES.find(v => v.id === voiceId);
    
    // Check cloned voices if not found
    if (!profile) {
      profile = clonedVoices.find((v: any) => v.id === voiceId);
    }
    
    // Default model
    let model = 'gemini-3.1-flash-tts-preview';

    return { model };
  };

  const generateLine = async (lineId: string) => {
    const line = scriptLines.find(l => l.id === lineId);
    if (!line) return;

    setScriptLines(prev => prev.map(l => l.id === lineId ? { ...l, isGenerating: true } : l));
    
    try {
      const personaContext = getPersonaContextForVoice(line.voiceId, line.toneId);
      const { model } = getOptimalVoiceModel(line.text, line.voiceId);
      
      const response = await callGeminiTTS({
        text: line.text,
        systemInstruction: `${personaContext}
          
          [ACTING PROTOCOL - MANDATORY]
          
          CHARACTER ENFORCEMENT:
          - Mirror the specified temperament, alignment, and intellect in your delivery.
          - If a composite voice, synthesize the textures as instructed.

          SFX INTEGRATION PROTOCOL:
          - If the text contains tags like [SFX: description], you MUST NOT speak the bracketed text.
          - Instead, you MUST perform or integrate that specific sound effect into the audio stream at the exact relative timing where the tag appears in the sentence.
          
          TASK: Perform the DIALOGUE in high-quality, cinematic Arabic.`,
        voiceName: sanitizeVoiceName(getBaseGeminiVoice(line.voiceId)),
        model
      });

      const base64Audio = response.data;
      if (base64Audio) {
        const rawBlob = createAudioBlob(base64Audio);
        const audioBlob = await ensure48kHz(rawBlob);
        const url = URL.createObjectURL(audioBlob);
        setScriptLines(prev => prev.map(l => l.id === lineId ? { ...l, audioUrl: url, isGenerating: false } : l));
      }
    } catch (error) {
      console.error(error);
      setScriptLines(prev => prev.map(l => l.id === lineId ? { ...l, isGenerating: false } : l));
    }
  };

  const playbackTimeouts = useRef<number[]>([]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Clear pending timeouts
    playbackTimeouts.current.forEach(id => clearTimeout(id));
    playbackTimeouts.current = [];

    // Stop all active mixer audios
    activeMixAudios.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeMixAudios.current = [];
    
    if (activeTonePlayerId && tonePlayers.current[activeTonePlayerId]) {
      tonePlayers.current[activeTonePlayerId].player.stop();
    }
    setActiveTonePlayerId(null);
    
    setCurrentlyPlaying(null);
    currentlyPlayingRef.current = null;
  };

  const playAudio = async (id: string, url: string, volume: number = 1.0, speed: number = 1.0) => {
    if (currentlyPlaying === id || activeTonePlayerId === id) {
      stopAudio();
      return;
    }
    stopAudio();
    setCurrentlyPlaying(id);
    
    const audio = new Audio(url);
    audio.playbackRate = speed;
    audio.volume = volume;
    audioRef.current = audio;
    
    audio.onended = () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    };
    
    audio.onerror = () => stopAudio();
    
    try {
      await audio.play();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error("Playback failed", err);
      stopAudio();
    }
  };

  const playAudioWithTone = async (id: string, url: string, fx: { pitch: number, speed: number, reverb: number, chorus: boolean }) => {
    if (currentlyPlaying === id || activeTonePlayerId === id) {
      stopAudio();
      return;
    }
    stopAudio();
    setCurrentlyPlaying(id);
    setActiveTonePlayerId(id);
    
    try {
      if (Tone.context.state !== 'running') {
        await Tone.context.resume();
      }
      await Tone.start();

      if (!tonePlayers.current[id]) {
        const pitchShift = new Tone.PitchShift(0).toDestination();
        const reverb = new Tone.Reverb(1.5).connect(pitchShift);
        const player = new Tone.Player(url).connect(reverb);
        tonePlayers.current[id] = { player, pitchShift, reverb };
        
        await player.load(url);
      }
      
      const { player, pitchShift, reverb } = tonePlayers.current[id];
      
      pitchShift.pitch = fx.pitch;
      player.playbackRate = fx.speed;
      reverb.wet.value = fx.reverb;
      
      player.onstop = () => {
        setCurrentlyPlaying(null);
        setActiveTonePlayerId(null);
      };
      
      player.start();
    } catch (err) {
      console.error("Tone Playback failed", err);
      stopAudio();
    }
  };

  const addToMixer = (item: Omit<MixerItem, 'id' | 'volume' | 'speed' | 'delay' | 'loop'>) => {
    setMixerItems(prev => [...prev, { ...item, id: crypto.randomUUID(), volume: 1.0, speed: 1.0, delay: 0, loop: false }]);
    setActiveTab('mixer');
  };

  const updateMixerItemVolume = (id: string, volume: number) => {
    setMixerItems(prev => prev.map(item => item.id === id ? { ...item, volume } : item));
  };

  const updateMixerItemSpeed = (id: string, speed: number) => {
    setMixerItems(prev => prev.map(item => item.id === id ? { ...item, speed } : item));
  };

  const updateMixerItemDelay = (id: string, delay: number) => {
    setMixerItems(prev => prev.map(item => item.id === id ? { ...item, delay } : item));
  };

  const toggleMixerItemLoop = (id: string) => {
    setMixerItems(prev => prev.map(item => item.id === id ? { ...item, loop: !item.loop } : item));
  };

  const removeFromMixer = (id: string) => {
    setMixerItems(prev => prev.filter(item => item.id !== id));
  };


  // Helper to identify and format AI errors
  const formatAiError = (error: any): string => {
    const status = error?.status;
    const errString = String(error?.message || error || "");
    const errObjStr = JSON.stringify(error);
    
    if (status === 429 || errString.includes("429") || errObjStr.includes("429") || errString.includes("RESOURCE_EXHAUSTED") || errObjStr.includes("RESOURCE_EXHAUSTED") || errString.includes("quota")) {
      return "⚠️ تم الوصول للحد الأقصى للطلبات المجانية (10 طلبات يومياً) لهذا الموديل الصوتي. لتجاوز هذا القيد، يمكنك إضافة مفتاح API الخاص بك من أيقونة الإعدادات ⚙️ في الزاوية العلوية، أو المحاولة مرة أخرى غداً.";
    }
    if (errString.includes("SAFETY")) {
      return "⚠️ تم حظر الطلب لدواعي تتعلق بسياسات السلامة (Safety Filter). يرجى تعديل النص ليكون أكثر توافقاً مع المعايير.";
    }
    return errString || "حدث خطأ غير متوقع في معالجة الطلب. يرجى المحاولة لاحقاً.";
  };

  const handleAnalysisUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous result
    setAnalysisResult(null);
    setAnalyzing(true);

    const reader = new FileReader();
    
    // Safety timeout: if analysis takes more than 45 seconds, reset state
    const timeoutId = setTimeout(() => {
      if (analyzing) {
        setAnalyzing(false);
        alert("استغرقت العملية وقتاً طويلاً. يرجى المحاولة مرة أخرى بملف أصغر أو فحص الاتصال.");
      }
    }, 45000);

    reader.onerror = () => {
      clearTimeout(timeoutId);
      setAnalyzing(false);
      alert("فشل في قراءة الملف الصوتي من جهازك.");
    };

    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const mimeType = file.type;

        if (!mimeType.startsWith('audio/')) {
          throw new Error("يرجى رفع ملف صوتي صالح فقط (MP3, WAV, etc.)");
        }

                  const supportedCharacters = VOICES.map(v => `${v.name} (${v.nameAr})`).join(", ");
                  
                  const response = await callGeminiGenerate({
                    model: "gemini-3-flash-preview",
                    contents: [
                      {
                        parts: [
                          {
                            inlineData: {
                              data: base64,
                              mimeType
                            }
                          },
                          {
                            text: `Analyze this Zelda: Tears of the Kingdom character's voice and provide a STRICT JSON response ONLY. No intro, no markdown, no outro.
                            
                            SUPPORTED CHARACTERS (Prefer these if they match):
                            ${supportedCharacters}

                            Identify them, their role, and TTS replication steps.
                            Transcribe the original speech accurately and provide an Arabic translation.
                            
                            JSON SCHEMA:
                            {
                              "nameAr": "اسم الشخصية",
                              "nameEn": "Character Name",
                              "archetypeAr": "التصنيف",
                              "descriptionAr": "وصف نبرة الصوت",
                              "traits": "السمات الدلالية",
                              "suggestedPitch": number,
                              "suggestedSpeed": number,
                              "suggestedBaseVoice": "Puck"|"Kore"|"Fenrir"|"Charon"|"Zephyr",
                              "gender": "male"|"female",
                              "alignment": "heroic"|"villainous"|"neutral",
                              "temperament": "arrogant"|"humble"|"eccentric"|"calm",
                              "intellect": "genius"|"average"|"foolish",
                              "descriptionEn": "Timbre description for prompt",
                              "transcription": "Original Text",
                               "translation": "الترجمة العربية للنص"
                            }`
                          }
                        ]
                      }
                    ],
                    config: {
                      responseMimeType: "application/json"
                    }
                  });

        const responseText = response.text;
        if (!responseText) throw new Error("لم يتم استلام أي بيانات من محرك التحليل.");
        
        // Robust JSON extraction: Find the first { and last }
        let jsonStr = responseText;
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = responseText.substring(firstBrace, lastBrace + 1);
        }

        const result = JSON.parse(jsonStr);
        setAnalysisResult(result);
      } catch (error) {
        console.error("Analysis failed:", error);
        alert(formatAiError(error));
      } finally {
        clearTimeout(timeoutId);
        setAnalyzing(false);
        // Clear input so the same file can be uploaded again if needed
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteClone = (id: string) => {
    setClonedVoices(prev => prev.filter(c => c.id !== id));
    if (selectedVoice === id) setSelectedVoice(VOICES[0].id);
  };

  const generateDialogueForVoice = async (voiceId: string) => {
    const v = VOICES.find(x => x.id === voiceId) || 
              clonedVoices.find(x => x.id === voiceId) || 
              compositeVoices.find(x => x.id === voiceId);
    if (!v) return;

    setGeneratingDialogue(voiceId);
    try {
      const prompt = `Generate 4 unique, short, and evocative dialogue lines for a character with the following persona:
      Name: ${v.name}
      Archetype: ${(v as any).archetypeAr || 'Unknown'}
      Description: ${v.description}
      Traits: ${(v as any).traitsAr?.join(', ') || 'None'}
      Alignment: ${(v as any).alignment || 'Neutral'}
      
      The lines should be in Arabic, reflecting the character's unique voice and background. 
      Ensure they sound like something they would say in a game like Breath of the Wild or Tears of the Kingdom.
      Format: Return ONLY the lines, one per line. No numbers. Limit each line to 15 words max.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        })
      });
      
      const data = await response.json();
      if (data.text) {
        const lines = data.text.split('\n').filter((l: string) => l.trim().length > 0).map((l: string) => l.replace(/^[-*•]\s+/, '').trim()).slice(0, 5);
        setDialogueResults(prev => ({ ...prev, [voiceId]: lines }));
      }
    } catch (error) {
      console.error("Dialogue generation error:", error);
    } finally {
      setGeneratingDialogue(null);
    }
  };

  const getTonesForVoice = (voiceId: string) => {
    const persona = [...VOICES, ...clonedVoices].find(v => v.id === voiceId);
    const baseTones = persona?.tonesAr || [];
    const customTones = customTonesByVoice[voiceId] || [];
    return [...baseTones, ...customTones];
  };

  const deleteCustomTone = (voiceId: string, toneId: string) => {
    setCustomTonesByVoice(prev => {
      const next = { ...prev };
      next[voiceId] = (next[voiceId] || []).filter(t => t.id !== toneId);
      return next;
    });
  };

  const reorderCustomTones = (voiceId: string, newTones: any[]) => {
    setCustomTonesByVoice(prev => ({
      ...prev,
      [voiceId]: newTones
    }));
  };

  const saveCustomTone = (voiceId: string, tone: any) => {
    setCustomTonesByVoice(prev => {
      const tones = prev[voiceId] || [];
      const index = tones.findIndex(t => t.id === tone.id);
      let nextTones;
      if (index >= 0) {
        nextTones = [...tones];
        nextTones[index] = tone;
      } else {
        nextTones = [...tones, tone];
      }
      return { ...prev, [voiceId]: nextTones };
    });
    setToneEditor(null);
    setSelectedTone(tone.id);
  };

  const getSFXGuidance = (persona: any) => {
    if (persona.alignment === 'villainous') {
      return `[SFX_BEHAVIORAL_GUIDANCE - VILLAINOUS]
        - When performing SFX or responding to tags, prioritize CHILLING, OMINOUS, and DARK sounds.
        - Integrate: evil laughs (ضحكة شريرة), mummified breathing, ominous footsteps (خطوات مشؤومة), chilling screeches (صراخ مشؤوم), and terrifying mockery.
        - Every sound effect must echo with ancient malice and subterranean dread.`;
    }
    if (persona.alignment === 'heroic') {
      return `[SFX_BEHAVIORAL_GUIDANCE - HEROIC]
        - Prioritize RADIANT, BOLD, and INSPIRING sounds.
        - Integrate: shimmering magic, heroic shines, noble instrumentals, and bright resonance.
        - Every sound effect must feel filled with hope and divine light.`;
    }
    return `[SFX_BEHAVIORAL_GUIDANCE - ATMOSPHERIC]
      - Prioritize MYSTERIOUS, ECCENTRIC, or NATURAL sounds that match the character's unique vibe.
      - Ensure the audio textures complement the character's intellectual or eccentric traits.`;
  };

  const getPersonaContextForVoice = (voiceId: string, currentToneId: string | null) => {
    const isCustom = voiceId === 'custom';
    const isComposite = voiceId.startsWith('composite-');
    
    if (isComposite) {
      const composite = compositeVoices.find(cv => cv.id === voiceId);
      if (!composite) return "";
      const voiceA = [...VOICES, ...clonedVoices].find(v => v.id === composite.voiceAId);
      const voiceB = [...VOICES, ...clonedVoices].find(v => v.id === composite.voiceBId);
      
      const blendPct = Math.round(composite.blendRatio * 100);
      return `[COMPOSITE VOICE PROTOCOL]
        You are performing a HYBRID profile.
        PRIMARY VOICE ARCHETYPE (Base Pitch/Structure): ${voiceA?.nameAr} (${voiceA?.archetypeAr})
        SECONDARY VOICE ARCHETYPE (Timbre/Soul/Personality): ${voiceB?.nameAr} (${voiceB?.archetypeAr})
        BLEND RATIO: ${blendPct}% focus on ${voiceB?.name || voiceB?.nameAr}'s delivery style and ${100 - blendPct}% on ${voiceA?.name || voiceA?.nameAr}'s baseline.
        
        INSTRUCTIONS:
        Use the physical vocal range of ${voiceA?.name || voiceA?.nameAr} but infuse it with the emotional texture, cadence, and specific vocal ticks of ${voiceB?.name || voiceB?.nameAr}. 
        Create a voice that is a ${blendPct}% spiritual match of ${voiceB?.name || voiceB?.nameAr} and ${100 - blendPct}% physical match of ${voiceA?.name || voiceA?.nameAr}.
        Sound like a unique, synthesized individual.`;
    }

    if (isCustom) {
      return `[STRICT CUSTOM CHARACTER DATA]
        Identity: ${customVoice.nameAr} (${customVoice.archetypeAr})
        Gender: ${customVoice.gender.toUpperCase()}
        Moral Alignment: ${customVoice.alignment?.toUpperCase()}
        Temperament: ${customVoice.temperament?.toUpperCase()}
        Intellect: ${customVoice.intellect?.toUpperCase()}
        Age: ${customVoice.age?.toUpperCase()}
        Timbre: ${customVoice.timbre?.toUpperCase()}
        Voice Performance Prompt: ${customVoice.description}
        Combined Traits: ${customVoice.traits}
        ${getSFXGuidance(customVoice)}`;
    }

    const persona = [...VOICES, ...clonedVoices].find(v => v.id === voiceId);
    if (!persona) return "";
    
    const override = voiceOverrides[voiceId];
    const tones = getTonesForVoice(voiceId);
    const defTone = defaultTones[voiceId] || null;
    const tonePrompt = tones.find(t => t.id === (currentToneId || defTone))?.prompt || "natural and balanced";

    return `[CHARACTER MASTER DATA]
      Identity: ${persona.nameAr} (${persona.archetypeAr})
      Gender: ${persona.gender.toUpperCase()}
      Moral Alignment: ${persona.alignment?.toUpperCase()}
      Temperament: ${persona.temperament?.toUpperCase()}
      Intellect: ${persona.intellect?.toUpperCase()}
      Age: ${persona.age?.toUpperCase()}
      Timbre: ${persona.timbre?.toUpperCase()}
      Core Role: ${persona.description}
      Enhanced Performance Depth: ${override?.descriptionEn || ""}
      Current Emotional Tone: ${tonePrompt}
      Expert Performance Advice: ${persona.tipsAr || ""}
      Voice Guidance: ${persona.guidance || ""}
      ${getSFXGuidance(persona)}`;
  };

  const getBaseGeminiVoice = (voiceId: string): VoiceName => {
    if (voiceId === 'custom') return customVoice.baseVoice;
    if (voiceId.startsWith('composite-')) {
      const composite = compositeVoices.find(cv => cv.id === voiceId);
      const voiceA = [...VOICES, ...clonedVoices].find(v => v.id === composite?.voiceAId);
      return voiceA?.geminiVoiceId || (voiceA as any)?.baseVoice || 'Fenrir';
    }
    const persona = [...VOICES, ...clonedVoices].find(v => v.id === voiceId);
    return voiceOverrides[voiceId]?.baseVoice || persona?.geminiVoiceId || (persona as any)?.baseVoice || 'Fenrir';
  };

  const toggleDefaultTone = (voiceId: string, toneId: string) => {
    setDefaultTones(prev => {
      if (prev[voiceId] === toneId) {
        const next = { ...prev };
        delete next[voiceId];
        return next;
      }
      return { ...prev, [voiceId]: toneId };
    });
  };

  const handleSaveClone = () => {
    if (!analysisResult) return;
    
    const iconName = Object.keys(ICON_MAP).find(key => ICON_MAP[key] === UserRound) || 'UserRound';
    
    const newClone = {
      id: `clone-${crypto.randomUUID()}`,
      isClone: true,
      gender: analysisResult.gender,
      alignment: analysisResult.alignment,
      temperament: analysisResult.temperament,
      intellect: analysisResult.intellect,
      name: analysisResult.nameEn || 'Cloned Character',
      nameAr: analysisResult.nameAr || 'شخصية مستنسخة',
      archetypeAr: analysisResult.archetypeAr || 'صوت تم استنساخه',
      description: analysisResult.descriptionEn || analysisResult.descriptionAr,
      descriptionAr: analysisResult.descriptionAr,
      traitsAr: analysisResult.traits.split(',').map((t: string) => t.trim()),
      pitch: analysisResult.suggestedPitch,
      speed: analysisResult.suggestedSpeed,
      baseVoice: sanitizeVoiceName(analysisResult.suggestedBaseVoice),
      guidance: 'Replicate the unique timbre and nuances captured from the original audio source.',
      tonesAr: [
        { id: 'original', labelAr: 'النبرة الأصلية المُقاسة', prompt: analysisResult.descriptionEn }
      ],
      icon: iconName,
      color: analysisResult.alignment === 'villainous' ? 'from-red-900 to-black' : 'from-blue-600 to-indigo-900'
    };

    setClonedVoices(prev => [newClone, ...prev]);
    setSelectedVoice(newClone.id);
    setSelectedTone('original');
    alert(`تم استنساخ صوت "${newClone.nameAr}" وإضافته إلى مكتبة أصواتك الدائمة!`);
    setActiveTab('voice');
  };

  const applyAnalysis = () => {
    if (!analysisResult) return;

    // Try to find a matching character in VOICES
    const matchingVoice = VOICES.find(v => {
      const mainNameAr = v.nameAr.split('(')[0].trim();
      const inputNameAr = analysisResult.nameAr.split('(')[0].trim();
      
      return (
        v.nameAr.includes(analysisResult.nameAr) || 
        analysisResult.nameAr.includes(mainNameAr) ||
        inputNameAr.includes(mainNameAr) ||
        mainNameAr.includes(inputNameAr) ||
        v.name.toLowerCase() === (analysisResult.nameEn || "").toLowerCase() ||
        analysisResult.nameAr.toLowerCase().includes(v.name.toLowerCase())
      );
    });

    if (matchingVoice) {
      // Update master card
      setVoiceOverrides(prev => ({
        ...prev,
        [matchingVoice.id]: {
          ...prev[matchingVoice.id],
          pitch: analysisResult.suggestedPitch,
          speed: analysisResult.suggestedSpeed,
          descriptionEn: analysisResult.descriptionEn,
          descriptionAr: analysisResult.descriptionAr,
          geminiVoiceId: sanitizeVoiceName(analysisResult.suggestedBaseVoice)
        }
      }));
      
      setVoiceSettings({
        ...voiceSettings,
        pitch: analysisResult.suggestedPitch,
        speed: analysisResult.suggestedSpeed
      });
      
      setSelectedVoice(matchingVoice.id);
      alert(`تم تحديث بيانات ${matchingVoice.nameAr} بنجاح. تم اعتماد صوت ${analysisResult.suggestedBaseVoice === 'Puck' ? 'أنثوي' : 'مناسب'} بناءً على التحليل.`);
    } else {
      // Fallback to custom voice
      setCustomVoice({
        nameAr: analysisResult.nameAr,
        gender: analysisResult.gender || (analysisResult.suggestedBaseVoice === 'Puck' || analysisResult.suggestedBaseVoice === 'Kore' ? 'female' : 'male'),
        alignment: analysisResult.alignment || 'neutral',
        temperament: analysisResult.temperament || 'calm',
        intellect: analysisResult.intellect || 'average',
        archetypeAr: analysisResult.archetypeAr,
        description: analysisResult.descriptionEn,
        traits: analysisResult.traits,
        age: analysisResult.suggestedPitch > 1.2 ? 'young' : analysisResult.suggestedPitch < 0.8 ? 'old' : 'middle',
        timbre: 'smooth',
        baseVoice: sanitizeVoiceName(analysisResult.suggestedBaseVoice)
      });
      setVoiceSettings(prev => ({
        ...prev,
        pitch: analysisResult.suggestedPitch,
        speed: analysisResult.suggestedSpeed
      }));
      setSelectedVoice('custom');
    }
    
    setActiveTab('voice');
  };

  const savePreset = () => {
    const name = prompt('أدخل اسماً لهذا المشهد (البريسيت):');
    if (!name) return;
    const newPreset = {
      id: crypto.randomUUID(),
      name,
      items: mixerItems,
      settings: voiceSettings,
      timestamp: Date.now()
    };
    setPresets(prev => {
      const updated = [newPreset, ...prev];
      localStorage.setItem('zelda-presets', JSON.stringify(updated));
      return updated;
    });
  };

  const loadPreset = (preset: any) => {
    setMixerItems(preset.items);
    setVoiceSettings(preset.settings);
  };

  const deletePreset = (id: string) => {
    setPresets(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('zelda-presets', JSON.stringify(updated));
      return updated;
    });
  };

  const playMix = async () => {
    if (mixerItems.length === 0) return;
    stopAudio();
    setCurrentlyPlaying('global-mix');
    
    activeMixAudios.current = [];
    playbackTimeouts.current = [];

    mixerItems.forEach(item => {
      const audio = new Audio(item.url);
      audio.volume = item.volume;
      audio.playbackRate = item.speed * voiceSettings.speed;
      audio.loop = item.loop;
      
      const timeoutId = window.setTimeout(() => {
        if (currentlyPlayingRef.current === 'global-mix') {
          audio.play().catch(console.error);
          activeMixAudios.current.push(audio);
        }
      }, item.delay * 1000);

      playbackTimeouts.current.push(timeoutId);
    });
  };

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;
    
    setIsGenerating(true);
    
    // Safety timeout for generation
    const genTimeoutId = setTimeout(() => {
      if (isGenerating) {
        setIsGenerating(false);
        alert("استغرقت عملية التوليد وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى.");
      }
    }, 60000);

    try {
      const pitchDirective = voiceSettings.pitch > 1.4 ? "VERY high-pitched" : voiceSettings.pitch < 0.7 ? "VERY deep and bassy" : "normal pitch";
      const intensityDirective = voiceSettings.intensity === 'whisper' ? "whisper every word quietly" : 
                                 voiceSettings.intensity === 'shouting' ? "shout loudly with high energy" :
                                 voiceSettings.intensity === 'dramatic' ? "be extremely dramatic and theatrical" : 
                                 voiceSettings.intensity === 'energetic' ? "speak with high energy and speed" : "speak naturally";

      const personaContext = getPersonaContextForVoice(selectedVoice, selectedTone);
      const { model } = getOptimalVoiceModel(text, selectedVoice);

      const responseData = await callGeminiTTS({
        text: text,
        systemInstruction: `[STORYTELLING ACTING PROTOCOL]
                You are a professional voice actor. You MUST embody the exact TEMPERAMENT, AGE, INTELLECT, and ALIGNMENT described below with 100% precision. 
                
                CHARACTER SPECIFICATIONS:
                ${personaContext}
                
                STRICT PERFORMANCE CONSTRAINTS:
                1. EMOTIONAL WEIGHT: Actively adjust your pacing, harshness, and breathing according to the Character's Temperament. (e.g. Arrogant -> condescending/slow pauses; Cunning -> sharp whispers; Humble -> warm/approachable).
                2. PHYSICAL DIRECTIVES: ${pitchDirective}, ${intensityDirective}.
                3. SFX INTEGRATION: If the text contains [SFX: description] tags, you MUST NOT speak the text inside. Perform and integrate the described sound effect into the audio at that exact point in time. 
                4. HYBRID SYNTHESIS: If this is a composite voice, ensure the blend between the primary pitch and secondary timbre is audible and distinct.
                
                TASK: Perform the DIALOGUE in high-quality, cinematic Arabic. Ensure the mood and temperament define the delivery tone completely.`,
        voiceName: sanitizeVoiceName(getBaseGeminiVoice(selectedVoice)),
        model
      });

      const base64Audio = responseData.data;
      if (base64Audio) {
        const rawBlob = createAudioBlob(base64Audio);
        const audioBlob = await ensure48kHz(rawBlob);
        const url = URL.createObjectURL(audioBlob);
        const newAudio: GeneratedAudio = {
          id: crypto.randomUUID(),
          text,
          voice: selectedVoice,
          tone: selectedTone || 'طبيعي',
          settings: { ...voiceSettings },
          blobUrl: url,
          timestamp: Date.now(),
        };
        setHistory(prev => [newAudio, ...prev]);
        playAudio(newAudio.id, url, 1.0, voiceSettings.speed);
      }
    } catch (err) {
      console.error(err);
      alert(formatAiError(err));
    } finally {
      clearTimeout(genTimeoutId);
      setIsGenerating(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const item = prev.find(h => h.id === id);
      if (item) URL.revokeObjectURL(item.blobUrl);
      return prev.filter(h => h.id !== id);
    });
  };


  const ICON_OPTIONS = [Wand2, Sparkles, Ghost, Zap, Cpu, Flame, Sword, Music, Wind, Target, Bell, Box, Building2, Trees, Mic2, Gamepad2, Stars, Heart, Settings] as const;
  const COLOR_OPTIONS = [
    'from-blue-600 to-indigo-700',
    'from-amber-400 to-yellow-600',
    'from-red-600 to-black',
    'from-orange-950 to-red-900',
    'from-blue-500 to-indigo-800',
    'from-pink-500 to-purple-600',
    'from-cyan-900 to-purple-900',
    'from-emerald-500 to-teal-600',
    'from-orange-700 to-red-800',
    'from-purple-500 to-indigo-600',
    'from-teal-400 to-blue-500',
    'from-slate-700 to-slate-900'
  ];

  const updateVoiceOverride = (voiceId: string, updates: Partial<{ icon: any, color: string, pitch: number, speed: number }>) => {
    setVoiceOverrides(prev => {
      const existing = prev[voiceId] || { 
        icon: VOICES.find(v => v.id === voiceId)?.icon, 
        color: VOICES.find(v => v.id === voiceId)?.color 
      };
      
      const newUpdates = { ...updates };
      // If setting an icon component, store its name if possible
      if (updates.icon && typeof updates.icon !== 'string') {
        const iconName = Object.keys(ICON_MAP).find(key => ICON_MAP[key] === updates.icon);
        if (iconName) newUpdates.icon = iconName;
      }

      return {
        ...prev,
        [voiceId]: {
          ...existing,
          ...newUpdates
        }
      };
    });
  };

  return (
    <div className="min-h-screen zonai-bg text-white font-sans selection:bg-teal-500/30 overflow-x-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ab7a3a]/10 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 flex justify-between items-center h-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl">
              <Mic2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold hidden sm:block">استوديو جيمناي للأصوات</h1>
          </div>
          <div className="flex bg-[#1a2b29] rounded-[16px] p-2 border-2 border-[#5a7470]/50 overflow-x-auto no-scrollbar max-w-[50vw] sm:max-w-none shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)]">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-5 py-2.5 mx-1 rounded-xl text-sm font-black transition-all shrink-0 ${
                activeTab === 'voice' ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100 hover:scale-[1.02]'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              <span>الـدبلجة</span>
            </motion.button>

            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-2 px-5 py-2.5 mx-1 rounded-xl text-sm font-black transition-all shrink-0 ${
                activeTab === 'script' ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100 hover:scale-[1.02]'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>السيناريو</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('mixer')}
              className={`flex items-center gap-2 px-5 py-2.5 mx-1 rounded-xl text-sm font-black transition-all shrink-0 ${
                activeTab === 'mixer' ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100 hover:scale-[1.02]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>الميكساج</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('lab')}
              className={`flex items-center gap-2 px-5 py-2.5 mx-1 rounded-xl text-sm font-black transition-all shrink-0 ${
                activeTab === 'lab' ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100 hover:scale-[1.02]'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>مختبر الأصوات</span>
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'voice' ? (
            <motion.div 
              key="voice-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-7 space-y-8">
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                       <button 
                         onClick={() => setIsAutoGenerate(!isAutoGenerate)}
                         className={`flex items-center justify-center gap-2 h-12 sm:h-14 px-3 sm:px-4 rounded-xl text-[11px] font-black transition-all text-center ${isAutoGenerate ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100'}`}
                       >
                         <Zap className={`w-4 h-4 sm:w-5 sm:h-5 zonai-icon shrink-0 ${isAutoGenerate ? 'animate-pulse text-teal-300' : 'text-teal-500'}`} />
                         <span className="truncate">{isAutoGenerate ? 'تلقائي: نشط' : 'تفعيل تلقائي'}</span>
                       </button>
                       <button 
                         onClick={addLineToScript}
                         className="flex items-center justify-center gap-2 h-12 sm:h-14 px-3 sm:px-5 zonai-stone-active text-teal-300 text-[12px] font-black transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(45,212,191,0.2)] rounded-[20px]"
                       >
                         <span className="truncate">إضافة للسيناريو</span>
                         <div className="bg-teal-400/20 p-1 rounded-full border border-teal-400/50 shrink-0">
                           <Plus className="w-4 h-4 sm:w-5 sm:h-5 font-black drop-shadow-md text-teal-100" />
                         </div>
                       </button>
                        <div className="relative">
                          <button 
                            onClick={() => setShowSfxDropdown(!showSfxDropdown)}
                            type="button"
                            className={`flex items-center justify-center gap-1.5 h-12 sm:h-14 px-3 sm:px-5 rounded-xl transition-all w-full ${showSfxDropdown ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100 text-teal-300'}`}
                            title="إدراج تأثير صوتي"
                          >
                            <div className="bg-teal-400/20 p-1 rounded-lg border border-teal-400/50 shrink-0">
                              <Music className="w-4 h-4 sm:w-5 sm:h-5 zonai-icon text-teal-300" />
                            </div>
                            <div className="flex flex-col text-right">
                               <span className="text-[9px] text-teal-200">مؤثر</span>
                               <span className="text-[11px] sm:text-[13px] font-black leading-none">SFX</span>
                            </div>
                          </button>
                          <AnimatePresence>
                            {showSfxDropdown && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute left-0 mt-2 p-2 bg-[#172422] border border-[#4a5c5a] rounded-xl shadow-2xl z-50 w-[200px] sm:w-56 grid grid-cols-1 gap-1"
                              >
                                <div className="text-[9px] text-teal-100/60 font-bold px-2 py-1 text-right border-b border-[#4a5c5a]/50 mb-1">
                                  اختر مؤثراً لإدراجه في النص
                                </div>
                                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-0.5">
                                  {SFX_TAGS.map((sfx, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        insertTextAtCursor(sfx.tag);
                                        setShowSfxDropdown(false);
                                      }}
                                      type="button"
                                      className="w-full text-right px-3 py-1.5 rounded-lg text-xs hover:bg-[#5a7470]/30 text-teal-100/80 hover:text-teal-300 transition-colors flex items-center justify-between"
                                    >
                                      <span className="text-[10px] opacity-40 font-mono">{sfx.tag}</span>
                                      <span>{sfx.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <button 
                          onClick={() => setShowHelp(!showHelp)}
                          className={`flex items-center justify-center h-12 sm:h-14 w-full sm:w-14 shrink-0 rounded-xl transition-all ${showHelp ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100'}`}
                          title="تحتاج مساعدة؟"
                        >
                          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 zonai-icon text-teal-500" />
                        </button>
                    </div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block text-right text-nowrap">نص الحوار</label>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-3 -right-3 w-10 h-10 border-t-4 border-r-4 border-[#172422] rounded-tr-2xl z-10 shadow-lg pointer-events-none"></div>
                    <div className="absolute -top-3 -left-3 w-10 h-10 border-t-4 border-l-4 border-[#172422] rounded-tl-2xl z-10 shadow-lg pointer-events-none"></div>
                    <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-4 border-r-4 border-[#172422] rounded-br-2xl z-10 shadow-lg pointer-events-none"></div>
                    <div className="absolute -bottom-3 -left-3 w-10 h-10 border-b-4 border-l-4 border-[#172422] rounded-bl-2xl z-10 shadow-lg pointer-events-none"></div>
                    
                    <textarea 
                      id="root"
                      ref={textareaRef}
                      value={text} 
                      onChange={e => setText(e.target.value)}
                      placeholder="اكتب الحوار هنا... سيقوم الذكاء الاصطناعي بتحويله إلى أداء صوتي مذهل."
                      className="w-full h-48 zonai-parchment p-8 text-2xl focus:outline-none focus:ring-4 focus:ring-[#ab7a3a]/30 resize-none text-center leading-relaxed placeholder:text-[#3e2723]/60 font-bold shadow-2xl"
                    />
                    <AnimatePresence>
                      {showHelp && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-0 mt-2 p-6 bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl z-50 w-full max-w-sm"
                        >
                          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                             <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white"><X className="w-4 h-4"/></button>
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-bold italic">دليل الاحتراف</span>
                               <Sparkles className="w-3 h-3 text-orange-500" />
                             </div>
                          </div>
                          <div className="space-y-6">
                             {PROMPT_EXAMPLES.map((ex, i) => {
                               const ExIcon = getIcon(ex.icon);
                               return (
                                 <div key={i} className="space-y-2 group cursor-pointer" onClick={() => { setText(ex.prompt); setShowHelp(false); }}>
                                    <div className="flex items-center gap-2 justify-end">
                                      <span className="text-[10px] font-bold text-white/70">{ex.title}</span>
                                      <ExIcon className={`w-3 h-3 ${ex.color}`} />
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all text-right text-[10px]">
                                      <p className="text-white font-medium mb-1 line-clamp-2">"{ex.prompt}"</p>
                                      <p className="text-white/30 text-[9px] leading-relaxed">{ex.description}</p>
                                    </div>
                                 </div>
                               );
                             })}
                          </div>
                          <div className="mt-6 text-center">
                            <p className="text-[9px] text-white/20 italic">اضغط على أي مثال لتجربته مباشرة</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                          <p className="text-xs font-bold text-orange-500">جاري تجسيد الصوت...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Music2 className="w-4 h-4 text-emerald-500" />
                       <h3 className="text-sm font-bold">إضافة مؤثرات صوتية (SFX)</h3>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">ميزة سينمائية</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {SFX_TAGS.map((sfx, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => insertTextAtCursor(sfx.tag)}
                        className="px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-[10px] whitespace-nowrap hover:border-emerald-500/40 transition-all text-emerald-300"
                      >
                        {sfx.label}
                      </motion.button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={handleAutoGenerateDialogue}
                      disabled={isGeneratingDialogue}
                      className="flex items-center gap-2 px-3 py-1 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-lg text-[10px] font-bold hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      {isGeneratingDialogue ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>توليد بالذكاء الاصطناعي</span>
                    </button>
                    <div className="flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-orange-500" />
                       <h3 className="text-sm font-bold">حوارات الشخصية المقترحة</h3>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {ZELDA_TEMPLATES.filter(t => t.voice === selectedVoice).map((template, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(234, 88, 12, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setText(template.text)}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] whitespace-nowrap hover:border-orange-500/50 transition-all text-white/70"
                      >
                        {template.label}
                      </motion.button>
                    ))}
                    {ZELDA_TEMPLATES.filter(t => t.voice === selectedVoice).length === 0 && (
                      <div className="text-[10px] text-white/20 py-2">لا توجد حوارات مقترحة لهذه الشخصية حالياً</div>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3 justify-center items-center">
                      <div className="flex gap-2">
                        {(['all', 'master', 'hybrid', 'cloned'] as const).map(f => (
                          <button 
                            key={f}
                            onClick={() => setVoiceFilter(f)}
                            className={`px-6 py-2 rounded-[8px] text-[11px] font-black transition-all ${voiceFilter === f ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100 hover:scale-[1.02]'}`}
                          >
                            {f === 'all' ? 'الكلي' : f === 'master' ? 'أساسي' : f === 'hybrid' ? 'هجين' : 'مستنسخ'}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {(['all', 'male', 'female'] as const).map(g => (
                          <button 
                            key={g}
                            onClick={() => setGenderFilter(g)}
                            className={`px-4 py-1.5 rounded-[8px] text-[10px] font-black transition-all ${genderFilter === g ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100'}`}
                          >
                            {g === 'all' ? 'كلاهما' : g === 'male' ? 'ذكر' : 'أنثى'}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {(['all', 'heroic', 'villainous', 'neutral'] as const).map(a => (
                          <button 
                            key={a}
                            onClick={() => setAlignmentFilter(a)}
                            className={`px-4 py-1.5 rounded-[8px] text-[10px] font-black transition-all ${alignmentFilter === a ? 'zonai-stone-active' : 'zonai-stone opacity-90 hover:opacity-100'}`}
                          >
                            {a === 'all' ? 'الكلي' : a === 'heroic' ? 'بطل' : a === 'villainous' ? 'شرير' : 'محايد'}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <select 
                          value={voiceSort}
                          onChange={e => setVoiceSort(e.target.value as any)}
                          className="zonai-stone text-[10px] font-black rounded-[8px] px-3 py-1.5 outline-none hover:scale-[1.02] transition-all cursor-pointer"
                        >
                          <option value="default" className="bg-[#172422] text-teal-300">الترتيب الافتراضي</option>
                          <option value="name" className="bg-[#172422] text-teal-300">الاسم أبجدياً</option>
                          <option value="alignment" className="bg-[#172422] text-teal-300">حسب الانتماء</option>
                        </select>
                        <select 
                          value={temperamentFilter}
                          onChange={e => setTemperamentFilter(e.target.value as any)}
                          className="zonai-stone text-[10px] font-black rounded-[8px] px-3 py-1.5 outline-none hover:scale-[1.02] transition-all cursor-pointer"
                        >
                          <option value="all" className="bg-[#172422] text-teal-300">كل الأمزجة</option>
                          <option value="arrogant" className="bg-[#172422] text-teal-300">متغطرس</option>
                          <option value="humble" className="bg-[#172422] text-teal-300">متواضع</option>
                          <option value="eccentric" className="bg-[#172422] text-teal-300">غريب الأطوار</option>
                          <option value="calm" className="bg-[#172422] text-teal-300">هادئ</option>
                          <option value="cunning" className="bg-[#172422] text-teal-300">ماكر</option>
                          <option value="calculated" className="bg-[#172422] text-teal-300">محنك</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="w-full flex justify-center mt-2">
                      <div className="relative w-full max-w-xl flex items-center zonai-stone rounded-xl border border-[#4a5c5a] p-1 shadow-lg">
                         <div className="w-12 h-10 flex items-center justify-center shrink-0 border-l border-[#172422]">
                           <Eye className="w-6 h-6 text-teal-400 opacity-80" />
                         </div>
                         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7470]" />
                         <input 
                           value={searchQuery}
                           onChange={e => setSearchQuery(e.target.value)}
                           className="w-full bg-transparent border-none py-2 px-4 text-sm font-bold text-teal-100 focus:outline-none placeholder:text-[#5a7470]" 
                           placeholder="إبحث عن البطل..."
                         />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {/* Add Custom Trigger if filter allows */}
                    {(voiceFilter === 'all' || voiceFilter === 'custom') && !searchQuery && (
                      <motion.div 
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedVoice('custom')}
                        className={`p-6 transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-3 relative ${
                          selectedVoice === 'custom' ? 'zonai-parchment ring-4 ring-[#ab7a3a]/50 scale-[1.02]' : 'zonai-parchment opacity-90 hover:opacity-100'
                        }`}
                      >
                        {selectedVoice === 'custom' && (
                          <>
                            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-[#172422] rounded-tr-xl z-10 pointer-events-none"></div>
                            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-[#172422] rounded-tl-xl z-10 pointer-events-none"></div>
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-[#172422] rounded-br-xl z-10 pointer-events-none"></div>
                            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-[#172422] rounded-bl-xl z-10 pointer-events-none"></div>
                          </>
                        )}
                        <div className="w-12 h-12 rounded-2xl bg-[#4a5c5a]/20 flex items-center justify-center text-[#3e2723] shadow-inner mb-2 border border-[#4a5c5a]/30 relative">
                           {/* Decorative claw accents */}
                           <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#132422] rounded-tl-md"></div>
                           <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#132422] rounded-br-md"></div>
                          <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-black block text-xl">شخصية مخصصة</span>
                          <span className="text-[11px] font-bold text-[#3e2723]/60">تحكم كامل بالإعدادات</span>
                        </div>
                      </motion.div>
                    )}

                    {filteredVisibleVoices.map(v => {
                      const isComposite = v.id.startsWith('composite-');
                      const isClone = (v as any).isClone;
                      const isMaster = !isComposite && !isClone;
                      const isCustom = v.id === 'custom';
                      
                      const override = voiceOverrides[v.id];
                      const IconComp = getIcon(isClone ? (v.icon || UserRound) : (isComposite ? (v.icon || Layers) : (override?.icon || (v as any).icon)));
                      const color = isComposite ? ((v as any).color || 'from-blue-600 to-indigo-900 shadow-blue-500/20') : (isClone ? (v as any).color : (override?.color || (v as any).color));
                      const isEditing = editingVoice === v.id;

                      return (
                        <motion.div 
                          key={v.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          onClick={() => !isEditing && setSelectedVoice(v.id)}
                          className={`flex flex-col overflow-hidden transition-all cursor-pointer relative group ${
                            selectedVoice === v.id ? 'zonai-gold-border rounded-2xl' : 'bg-[#152e2a] border border-[#23423f] rounded-2xl hover:border-[#ab7a3a]/50 hover:shadow-[0_0_15px_rgba(171,122,58,0.2)]'
                          } ${isEditing ? 'ring-2 ring-emerald-400' : ''}`}
                        >
                          <div className="p-4 flex gap-4 text-right bg-gradient-to-l from-white/5 to-transparent relative">
                            
                            {/* Card Content */}
                            <div className="flex-1 flex flex-col justify-center gap-2">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                {/* Actions (left) */}
                                <div className="flex flex-col gap-1.5 shrink-0 z-10">
                                  {isComposite && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setCompositeEditor(v as any); setLabMode('blending'); setActiveTab('lab'); }}
                                      className="p-1.5 bg-[#172422] border border-[#4a5c5a] hover:bg-[#23423f] rounded-lg text-teal-100/50 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                      title="تعديل المزيج"
                                    >
                                      <SlidersHorizontal className="w-4 h-4" />
                                    </button>
                                  )}
                                  {isMaster && (
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); setEditingVoice(v.id); }}
                                       className="p-1.5 bg-[#172422] border border-[#4a5c5a] hover:bg-[#23423f] rounded-lg text-teal-100/50 hover:text-orange-400 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                       title="تخصيص المظهر"
                                     >
                                       <Settings className="w-4 h-4" />
                                     </button>
                                  )}
                                  {(isComposite || isClone) && (
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (isComposite) setCompositeVoices(prev => prev.filter(cv => cv.id !== v.id));
                                        else deleteClone(v.id);
                                        if (selectedVoice === v.id) setSelectedVoice(VOICES[0].id); 
                                      }}
                                      className="p-1.5 bg-[#172422] border border-[#4a5c5a] hover:bg-[#23423f] rounded-lg text-teal-100/50 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                      title="حذف"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                
                                {/* Info (right) */}
                                <div className="flex flex-col items-end mr-auto">
                                  <div className="flex items-center gap-2">
                                     {((isMaster && override?.descriptionAr) || (isComposite && (v as any).blendRatio !== 0.5)) && <Sparkles className="w-3.5 h-3.5 text-[#ab7a3a]" />}
                                     <h3 className="font-black text-lg tracking-tight italic text-teal-100 leading-none">{v.nameAr}</h3>
                                  </div>
                                  <p className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${isComposite ? 'text-blue-400' : (isClone ? 'text-emerald-500' : 'text-[#ab7a3a]/80')}`}>
                                    {isComposite ? (v as any).archetypeAr || 'Hybrid Entity' : (isClone ? 'Genetic Blend' : (v as any).archetypeAr)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Tags Row */}
                              <div className="flex flex-wrap items-center gap-1.5 justify-end">
                                {(v as any).alignment && (
                                  <div className="bg-black/20 border border-[#23423f] px-2 py-1 rounded flex items-center gap-1.5" title={`الانتماء: ${ALIGNMENT_AR[(v as any).alignment] || (v as any).alignment}`}>
                                    {(v as any).alignment === 'heroic' ? <Shield className="w-3 h-3 text-teal-400" /> : 
                                     (v as any).alignment === 'villainous' ? <Flame className="w-3 h-3 text-red-500" /> :
                                     <Info className="w-3 h-3 text-[#ab7a3a]" />}
                                    <span className="text-[9px] font-black uppercase text-teal-100/80 mt-0.5">
                                      {ALIGNMENT_AR[(v as any).alignment] || (v as any).alignment}
                                    </span>
                                  </div>
                                )}
                                {(v as any).temperament && (
                                  <div className="bg-black/20 border border-[#23423f] px-2 py-1 rounded flex items-center gap-1.5" title={`المزاج: ${TEMPERAMENT_AR[(v as any).temperament] || (v as any).temperament}`}>
                                    <Book className="w-3 h-3 text-[#ab7a3a]" />
                                    <span className="text-[9px] font-black uppercase text-orange-200/80 mt-0.5">
                                      {TEMPERAMENT_AR[(v as any).temperament] || (v as any).temperament}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Card Image */}
                            <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20 group-hover:scale-105 group-hover:rotate-3 transition-transform relative overflow-hidden`}>
                              <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
                              <IconComp className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
                            </div>
                            
                          </div>

                          {/* Bottom Action Bar */}
                          <div className={`px-4 py-2.5 border-t border-[#23423f]/50 flex items-center justify-between ${selectedVoice === v.id ? 'bg-[#5a7470]/10' : 'bg-black/20'}`}>
                            <div className="flex gap-2">
                              <button className="bg-[#172422] border border-[#4a5c5a] hover:bg-teal-500/20 hover:text-teal-300 hover:border-teal-500/30 text-teal-100/50 rounded-lg w-8 h-8 flex items-center justify-center transition-all shadow-md group/btn" title="استخدم الصوت" onClick={(e) => { e.stopPropagation(); setSelectedVoice(v.id); setActiveTab('voice'); }}>
                                <AudioLines className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                              <button className="bg-[#172422] border border-[#4a5c5a] hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/30 text-teal-100/50 rounded-lg w-8 h-8 flex items-center justify-center transition-all shadow-md group/btn" title="محادثة الشخصية">
                                <MessageSquareQuote className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                            </div>
                            
                            {(v as any).guidance ? (
                               <p className="text-[10px] text-teal-100/30 line-clamp-1 italic text-left max-w-[150px] font-mono group-hover:text-teal-100/60 transition-colors" dir="ltr">
                                 { (v as any).guidance }
                               </p>
                            ) : (
                               <div className="flex gap-1 items-center opacity-30 group-hover:opacity-60 transition-opacity">
                                 <span className="text-[9px] uppercase tracking-widest font-black text-teal-100">Zonai Verified</span>
                                 <Shield className="w-2.5 h-2.5 text-teal-100" />
                               </div>
                            )}
                          </div>

                          {isEditing ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-4 border-t border-white/10 mt-2">
                               <div className="space-y-2">
                                 <label className="text-[10px] text-white/40 block text-right font-black uppercase">اختيار الأيقونة</label>
                                 <div className="flex flex-wrap gap-1.5 justify-end">
                                   {ICON_OPTIONS.map((Icon, i) => (
                                     <button 
                                       key={i} 
                                       onClick={(e) => { e.stopPropagation(); updateVoiceOverride(v.id, { icon: Icon }); }}
                                       className={`p-2.5 rounded-xl border transition-all ${IconComp === Icon ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                     >
                                       <Icon className="w-4 h-4" />
                                     </button>
                                   ))}
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 <label className="text-[10px] text-white/40 block text-right font-black uppercase">اختيار اللون</label>
                                 <div className="flex flex-wrap gap-1.5 justify-end">
                                   {COLOR_OPTIONS.map((colorSet, i) => (
                                     <button 
                                       key={i} 
                                       onClick={(e) => { e.stopPropagation(); updateVoiceOverride(v.id, { color: colorSet }); }}
                                       className={`w-7 h-7 rounded-xl bg-gradient-to-br border transition-all ${colorSet} ${color === colorSet ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:scale-110'}`}
                                     />
                                   ))}
                                 </div>
                               </div>
                               <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                                 <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                   <div className="flex justify-between text-[10px] text-white/40 items-center">
                                     <span className="font-mono text-orange-400">{(override?.pitch ?? (v as any).pitch ?? 1.0).toFixed(2)}x</span>
                                     <span className="uppercase font-black text-[10px]">تعديل الجوهر (الحدة)</span>
                                   </div>
                                   <input 
                                     type="range" min="0.5" max="2.0" step="0.05" 
                                     value={override?.pitch ?? (v as any).pitch ?? 1.0}
                                     onChange={e => updateVoiceOverride(v.id, { pitch: parseFloat(e.target.value) })}
                                     className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-orange-500" 
                                   />
                                 </div>
                                 <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                   <div className="flex justify-between text-[10px] text-white/40 items-center">
                                     <span className="font-mono text-blue-400">{(override?.speed ?? (v as any).speed ?? 1.0).toFixed(2)}x</span>
                                     <span className="uppercase font-black text-[10px]">تعديل الجوهر (السرعة)</span>
                                   </div>
                                   <input 
                                     type="range" min="0.5" max="2.0" step="0.05" 
                                     value={override?.speed ?? (v as any).speed ?? 1.0}
                                     onChange={e => updateVoiceOverride(v.id, { speed: parseFloat(e.target.value) })}
                                     className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-blue-500" 
                                   />
                                 </div>
                               </div>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setEditingVoice(null); }}
                                 className="w-full py-4 bg-white text-black rounded-2xl text-xs font-black hover:bg-orange-500 hover:text-white transition-all shadow-xl"
                               >
                                 حفظ التعديلات
                               </button>
                            </motion.div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                               <div className="flex gap-2">
                                 <button 
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const previewText = `مرحباً بك في هايرول، أنا ${v.nameAr}.`;
                                        const { model: optModel } = getOptimalVoiceModel(previewText, v.id);
                                        setCurrentlyPlaying(`prev-${v.id}`);
                                        const personaContext = getPersonaContextForVoice(v.id, null);
                                        const resp = await callGeminiTTS({
                                          text: `${personaContext} Say: "${previewText}"`,
                                          voiceName: sanitizeVoiceName((v as any).geminiVoiceId || VOICES[0].geminiVoiceId),
                                          model: optModel
                                        });
                                        if (resp.data) {
                                          const rawBlob = createAudioBlob(resp.data);
                                          const audioBlob = await ensure48kHz(rawBlob);
                                          playAudio(`prev-${v.id}`, URL.createObjectURL(audioBlob), 1.0, voiceSettings.speed);
                                        }
                                      } catch (e) {
                                        console.error(e);
                                        setCurrentlyPlaying(null);
                                      }
                                    }}
                                    className="p-3 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-2xl transition-all shadow-lg"
                                 >
                                    {currentlyPlaying === `prev-${v.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                                 </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); generateDialogueForVoice(v.id); }}
                                    disabled={generatingDialogue === v.id}
                                    className={`p-3 transition-all shadow-lg rounded-2xl ${
                                      dialogueResults[v.id] ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 text-white/20 hover:bg-white/10 hover:text-white'
                                    }`}
                                    title="توليد حوارات مقترحة"
                                 >
                                    {generatingDialogue === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareQuote className="w-4 h-4" />}
                                 </button>
                               </div>
                               <div className="flex gap-1.5 flex-wrap justify-end">
                                  {(isComposite ? ['Hybrid', 'Genetic Blend'] : (isClone ? ['Performance', 'Cloned'] : (v as any).traitsAr || [])).slice(0, 3).map((t: string) => (
                                    <span key={t} className="px-2 py-0.5 bg-white/5 text-white/30 rounded-lg text-[8px] font-black uppercase tracking-tighter group-hover:text-white/50 transition-colors">{t}</span>
                                  ))}
                               </div>
                            </div>
                            
                            <AnimatePresence>
                              {dialogueResults[v.id] && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-white/5 pt-3 space-y-2 overflow-hidden"
                                  onClick={e => e.stopPropagation()}
                                >
                                   <div className="flex justify-between items-center px-1">
                                     <button 
                                       onClick={() => setDialogueResults(prev => {
                                         const next = {...prev};
                                         delete next[v.id];
                                         return next;
                                       })}
                                       className="text-[8px] text-white/20 hover:text-red-400 transition-colors"
                                     >حذف المقترحات</button>
                                     <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">حوارات مقترحة</span>
                                   </div>
                                   <div className="grid grid-cols-1 gap-1">
                                     {dialogueResults[v.id].map((line, idx) => (
                                       <button
                                         key={idx}
                                         onClick={() => {
                                           setText(line);
                                           setSelectedVoice(v.id);
                                         }}
                                         className="w-full text-right p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-white/70 hover:text-white transition-all border border-transparent hover:border-white/10 group/line flex items-center justify-between"
                                       >
                                         <Plus className="w-3 h-3 opacity-0 group-hover/line:opacity-40 transition-opacity" />
                                         <span className="line-clamp-2">{line}</span>
                                       </button>
                                     ))}
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                        </motion.div>
                      );
                    })}
                  </div>
                </section>

                <AnimatePresence>
                  {selectedVoice !== 'custom' && (
                    <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 font-inter">
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] text-white/20 uppercase tracking-widest">يمكن سحب النبرات المخصصة لإعادة ترتيبها</span>
                         <label className="text-xs font-bold text-white/40 uppercase tracking-widest block text-right">نبرة الأداء</label>
                       </div>
                       
                       <div className="space-y-6">
                          {/* Signature Sounds */}
                          {VOICES.find(v => v.id === selectedVoice)?.signatureSfxIds && (
                            <div className="space-y-2">
                              <h4 className="text-[10px] text-white/20 text-right uppercase tracking-wider">المؤثرات الصوتية الخاصة</h4>
                              <div className="flex flex-wrap gap-2 justify-end">
                                {VOICES.find(v => v.id === selectedVoice)?.signatureSfxIds?.map(sfxId => {
                                  // This was linked to SOUND_LIBRARY which is now removed.
                                  // Keeping the map but returning null to avoid crashes if signatureSfxIds exist in the template
                                  return null;
                                })}
                              </div>
                            </div>
                          )}

                          {/* Base Tones */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <button 
                                onClick={() => setToneEditor({ 
                                  voiceId: selectedVoice, 
                                  tone: { id: `tone-${Date.now()}`, labelAr: 'نبرة جديدة', prompt: 'Calm and steady voice...' } 
                                })}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold hover:bg-emerald-500 hover:text-white transition-all"
                              >
                                <Plus className="w-3 h-3" />
                                <span>إضافة نبرة مخصصة</span>
                              </button>
                              <h4 className="text-[10px] text-white/20 text-right uppercase tracking-wider">النبرات الأساسية</h4>
                            </div>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {(VOICES.find(v => v.id === selectedVoice)?.tonesAr || clonedVoices.find(v => v.id === selectedVoice)?.tonesAr || []).map(t => (
                               <div key={t.id} className="relative group">
                                <button 
                                  onClick={() => setSelectedTone(t.id)}
                                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                                    selectedTone === t.id ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                  }`}
                                >
                                  {t.labelAr}
                                </button>

                                <button
                                   onClick={(e) => { 
                                     e.stopPropagation(); 
                                     setToneEditor({ 
                                       voiceId: selectedVoice, 
                                       tone: { ...t, id: `tone-${crypto.randomUUID()}`, labelAr: `${t.labelAr} (نسخة)` } 
                                     }); 
                                   }}
                                   className="absolute -top-1 -right-1 p-1 rounded-full bg-blue-600 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all z-20"
                                   title="نسخ وتعديل هذه النبرة"
                                >
                                  <Copy className="w-2 h-2" />
                                </button>

                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleDefaultTone(selectedVoice, t.id); }}
                                  className={`absolute -top-1 -left-1 p-1 rounded-full border transition-all z-10 ${
                                    defaultTones[selectedVoice] === t.id ? 'bg-red-500 border-red-500 text-white scale-110' : 'bg-black/60 border-white/10 text-white/20 opacity-0 group-hover:opacity-100'
                                  }`}
                                  title="تعيين كوضع افتراضي لهذه الشخصية"
                                >
                                  <Heart className="w-2.5 h-2.5 fill-current" />
                                </button>
                               </div>
                             ))}
                           </div>
                         </div>

                         {/* Custom Tones - Reorderable */}
                         {customTonesByVoice[selectedVoice] && customTonesByVoice[selectedVoice].length > 0 && (
                           <div className="space-y-2">
                             <h4 className="text-[10px] text-white/20 text-right uppercase tracking-wider">النبرات المخصصة</h4>
                             <Reorder.Group 
                               axis="y" 
                               values={customTonesByVoice[selectedVoice]} 
                               onReorder={(newTones) => reorderCustomTones(selectedVoice, newTones)}
                               className="space-y-2"
                             >
                               {customTonesByVoice[selectedVoice].map(t => (
                                 <Reorder.Item 
                                   key={t.id} 
                                   value={t}
                                   className={`relative group flex items-center gap-3 bg-white/5 border rounded-2xl p-3 transition-all ${
                                     selectedTone === t.id ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/5 hover:border-white/10'
                                   }`}
                                 >
                                   <div className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors">
                                     <GripVertical className="w-4 h-4" />
                                   </div>

                                   <button 
                                     onClick={() => setSelectedTone(t.id)}
                                     className="flex-1 text-right"
                                   >
                                     <span className={`text-xs font-bold transition-colors ${selectedTone === t.id ? 'text-orange-500' : 'text-white/70'}`}>
                                       {t.labelAr}
                                     </span>
                                     <p className="text-[9px] text-white/30 line-clamp-1">{t.prompt}</p>
                                   </button>

                                   <div className="flex gap-1">
                                      <button
                                         onClick={(e) => { 
                                           e.stopPropagation(); 
                                           setToneEditor({ voiceId: selectedVoice, tone: t }); 
                                         }}
                                         className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                         title="تعديل النبرة"
                                      >
                                        <SlidersHorizontal className="w-3 h-3" />
                                      </button>
                                      
                                      <button
                                         onClick={(e) => { e.stopPropagation(); deleteCustomTone(selectedVoice, t.id); }}
                                         className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                         title="حذف النبرة"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>

                                      <button
                                        onClick={(e) => { e.stopPropagation(); toggleDefaultTone(selectedVoice, t.id); }}
                                        className={`p-2 rounded-lg border transition-all ${
                                          defaultTones[selectedVoice] === t.id ? 'bg-red-500 border-red-500 text-white' : 'bg-black/60 border-white/5 text-white/20'
                                        }`}
                                        title="تعيين كوضع افتراضي"
                                      >
                                        <Heart className={`w-3 h-3 ${defaultTones[selectedVoice] === t.id ? 'fill-current' : ''}`} />
                                      </button>
                                   </div>
                                 </Reorder.Item>
                               ))}
                             </Reorder.Group>
                           </div>
                         )}
                       </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selectedVoice === 'custom' && (
                    <motion.section initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center gap-3 justify-end">
                        <span className="font-bold">تعديل الشخصية</span>
                        <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <label className="text-[10px] text-white/40 block text-right">اسم الشخصية</label>
                             <input value={customVoice.nameAr} onChange={e => setCustomVoice(v => ({...v, nameAr: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-right focus:border-emerald-500/50 outline-none transition-all" placeholder="الاسم"/>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] text-white/40 block text-right">عنوان الشخصية (النمط)</label>
                             <input value={customVoice.archetypeAr} onChange={e => setCustomVoice(v => ({...v, archetypeAr: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-right focus:border-emerald-500/50 outline-none transition-all" placeholder="النمط"/>
                           </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 block text-right">الجنس (Gender)</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setCustomVoice(v => ({...v, gender: 'female'}))}
                              className={`flex-1 py-2 rounded-xl text-[10px] border transition-all ${customVoice.gender === 'female' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                            >أنثى (Female)</button>
                            <button 
                              onClick={() => setCustomVoice(v => ({...v, gender: 'male'}))}
                              className={`flex-1 py-2 rounded-xl text-[10px] border transition-all ${customVoice.gender === 'male' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                            >ذكر (Male)</button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                           <div className="space-y-1">
                             <label className="text-[10px] text-white/40 block text-right">التوجه</label>
                             <select value={customVoice.alignment} onChange={e => setCustomVoice(v => ({...v, alignment: e.target.value as any}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[10px] text-right">
                               <option value="heroic">بطولي/طيب</option>
                               <option value="villainous">شرير/مظلم</option>
                               <option value="neutral">محايد</option>
                             </select>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] text-white/40 block text-right">المزاج</label>
                             <select value={customVoice.temperament} onChange={e => setCustomVoice(v => ({...v, temperament: e.target.value as any}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[10px] text-right">
                               <option value="calm">هادئ/وقور</option>
                               <option value="arrogant">متكبر/واثق</option>
                               <option value="humble">متواضع/بسيط</option>
                               <option value="eccentric">غريب الأطوار</option>
                               <option value="cunning">ماكر/خبيث</option>
                               <option value="calculated">محنك/مخطط</option>
                             </select>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] text-white/40 block text-right">الذكاء</label>
                             <select value={customVoice.intellect} onChange={e => setCustomVoice(v => ({...v, intellect: e.target.value as any}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[10px] text-right">
                               <option value="genius">عبقري</option>
                               <option value="average">متوسط</option>
                               <option value="foolish">غبي/أبله</option>
                               <option value="ancient">حكمة السنين (Ancient)</option>
                               <option value="hyper-intelligent">ذكاء خارق (Hyper)</option>
                             </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                             <label className="text-[10px] text-white/40 block text-right">العمر (Age)</label>
                             <select value={customVoice.age} onChange={e => setCustomVoice(v => ({...v, age: e.target.value as any}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[10px] text-right">
                               <option value="young">شاب (Young)</option>
                               <option value="middle-aged">منتصف العمر (Middle-aged)</option>
                               <option value="old">عجوز (Old)</option>
                             </select>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] text-white/40 block text-right">طابع الصوت (Timbre)</label>
                             <select value={customVoice.timbre} onChange={e => setCustomVoice(v => ({...v, timbre: e.target.value as any}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[10px] text-right">
                               <option value="smooth">ناعم (Smooth)</option>
                               <option value="husky">أجش (Husky)</option>
                               <option value="booming">صاخب/قوي (Booming)</option>
                               <option value="nasal">أنفي (Nasal)</option>
                               <option value="ethereal">أثيري/روحي (Ethereal)</option>
                             </select>
                           </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-end items-center gap-1">
                            <label className="text-[10px] text-white/40 block text-right">وصف الأداء (يوجه الذكاء الاصطناعي - يفضل بالإنجليزية)</label>
                            <Info className="w-2.5 h-2.5 opacity-40" title="صف كيف يجب أن يبدو الصوت. مثال: Deep, resonant, gravelly voice with a mysterious vibe." />
                          </div>
                          <textarea value={customVoice.description} onChange={e => setCustomVoice(v => ({...v, description: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-right h-20 resize-none focus:border-emerald-500/50 outline-none transition-all" placeholder="صف النبرة المطلوبة..."/>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-end items-center gap-1">
                            <label className="text-[10px] text-white/40 block text-right">السمات (Traits)</label>
                            <Info className="w-2.5 h-2.5 opacity-40" title="كلمات دلالية تصف شخصية الصوت. مثال: حكيم، شجاع، مريب." />
                          </div>
                          <input value={customVoice.traits} onChange={e => setCustomVoice(v => ({...v, traits: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-right focus:border-emerald-500/50 outline-none transition-all" placeholder="مثلاً: حكيم، شجاع، مريب..."/>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-[10px] text-white/40 block text-right">خامة الصوت</label>
                           <select value={customVoice.timbre} onChange={e => setCustomVoice(v => ({...v, timbre: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs">
                             {['smooth', 'husky', 'booming', 'nasal', 'ethereal'].map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] text-white/40 block text-right">الصوت الأساسي</label>
                           <select value={customVoice.baseVoice} onChange={e => setCustomVoice(v => ({...v, baseVoice: e.target.value as VoiceName}))} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs">
                             {['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                         </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                <section className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between">
                    <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                    <div className="text-right flex items-center gap-2">
                       <Info className="w-3 h-3 text-white/20 hover:text-orange-500 transition-colors" title="إعدادات إضافية للتحكم في خصائص الصوت المولود" />
                       <div className="text-right">
                         <h4 className="text-xs font-bold">إعدادات متقدمة</h4>
                         <p className="text-[10px] text-white/30">السرعة والحدة والأداء</p>
                       </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden space-y-6 pt-4 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-2">
                             <div className="flex justify-between text-[10px] text-white/40 items-center">
                               <span>{voiceSettings.speed}x</span>
                               <div className="flex items-center gap-1">
                                 <span>سرعة النطق</span>
                                 <Info className="w-2.5 h-2.5 opacity-40 shrink-0" title="يتحكم في سرعة الكلام. 1.0 هي السرعة العادية، 0.5 بطيء، و 2.0 سريع." />
                               </div>
                             </div>
                             <input type="range" min="0.5" max="2.0" step="0.1" value={voiceSettings.speed} onChange={e => setVoiceSettings(v => ({...v, speed: parseFloat(e.target.value)}))} className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-orange-500" />
                           </div>
                           <div className="space-y-2">
                             <div className="flex justify-between text-[10px] text-white/40 items-center">
                               <span>{voiceSettings.pitch}x</span>
                               <div className="flex items-center gap-1">
                                 <span>الحدة</span>
                                 <Info className="w-2.5 h-2.5 opacity-40 shrink-0" title="يتحكم في طبقة الصوت. القيم الأقل (0.5) تجعل الصوت غليظاً، والقيم الأعلى (2.0) تجعله حاداً." />
                               </div>
                             </div>
                             <input type="range" min="0.5" max="2.0" step="0.1" value={voiceSettings.pitch} onChange={e => setVoiceSettings(v => ({...v, pitch: parseFloat(e.target.value)}))} className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-orange-500" />
                           </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                           <div className="flex items-center gap-2 justify-end">
                             <div className="flex items-center gap-1 text-right">
                               <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">نمط الأداء</span>
                               <Info className="w-2.5 h-2.5 opacity-40 shrink-0" title="يغير أسلوب التعبير ونبرة الصوت المختارة ليناسب الموقف الحواري (همس، صراخ، إلخ)." />
                             </div>
                           </div>
                           <div className="grid grid-cols-3 gap-2">
                             {['whisper', 'calm', 'natural', 'energetic', 'dramatic', 'shouting'].map(m => (
                               <button 
                                 key={m} 
                                 onClick={() => setVoiceSettings(v => ({...v, intensity: m as any}))} 
                                 className={`py-1 rounded-lg text-[10px] border transition-all ${voiceSettings.intensity === m ? 'border-orange-500 text-orange-500' : 'border-white/5 text-white/30 hover:border-white/20'}`}
                                 title={
                                   m === 'whisper' ? 'نبرة خافتة جداً توحي بالسرية' : 
                                   m === 'calm' ? 'أداء متزن وهادئ يوحي بالحكمة' : 
                                   m === 'natural' ? 'النبرة الطبيعية المعتادة' : 
                                   m === 'energetic' ? 'أداء مفعم بالحيوية والحماس' : 
                                   m === 'dramatic' ? 'أداء مسرحي معبر ومؤثر' : 'نبرة عالية توحي بالقوة أو الغضب'
                                 }
                               >
                                 {m === 'whisper' ? 'همس' : m === 'calm' ? 'هادئ' : m === 'natural' ? 'طبيعي' : m === 'energetic' ? 'نشط' : m === 'dramatic' ? 'درامي' : 'صراخ'}
                               </button>
                             ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerate} 
                  disabled={isGenerating || !text.trim()} 
                  className={`w-full py-4 bg-orange-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all disabled:opacity-50 shadow-xl ${isGenerating ? 'animate-pulse' : 'shadow-orange-600/20'}`}
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                  <span>{isGenerating ? 'جاري التوليد...' : 'توليد الصوت الآن'}</span>
                </motion.button>
              </div>

              {/* Right Column: History */}
              <div className="lg:col-span-5 space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="bg-white/5 px-2 py-1 rounded text-[10px] text-white/40 border border-white/10">{history.length} ملف</div>
                   <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest text-right">أرشيف الإنتاج</h2>
                 </div>
                 <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
                    {history.length === 0 ? (
                      <div className="p-12 text-center text-white/20 border border-dashed border-white/10 rounded-[32px] bg-white/2">
                        <Mic2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">سجل الإنتاج فارغ</p>
                      </div>
                    ) : (
                      history.map(h => {
                        const voiceInfo = VOICES.find(v => v.id === h.voice);
                        const isCustom = h.voice === 'custom';
                        const color = isCustom ? 'from-emerald-500 to-teal-600' : (voiceInfo?.color || 'from-gray-500 to-gray-700');
                        
                        return (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4, borderColor: "rgba(234, 88, 12, 0.3)" }}
                            key={h.id} 
                            className="bg-white/5 rounded-[24px] border border-white/10 overflow-hidden group transition-all shadow-xl shadow-black/20"
                          >
                            <div className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className={`px-2 py-1 rounded-lg bg-gradient-to-br ${color} text-[8px] font-black uppercase text-white shadow-lg`}>
                                  {isCustom ? 'MAPPED' : 'MASTER'}
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  <div className="text-right">
                                    <p className="text-[11px] text-white font-bold">{isCustom ? customVoice.nameAr : voiceInfo?.nameAr}</p>
                                    <p className="text-[9px] text-orange-500/80 font-medium">{h.tone}</p>
                                  </div>
                                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} overflow-hidden border border-white/10 shadow-lg shrink-0 flex items-center justify-center`}>
                                    <UserRound className="w-4 h-4 text-white/40" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                <p className="text-xs text-white/80 text-right leading-relaxed select-all italic opacity-90">"{h.text}"</p>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/5 rounded-lg p-1.5 flex flex-col items-center">
                                  <span className="text-[7px] text-white/40 uppercase">حدة</span>
                                  <span className="text-[9px] font-bold text-orange-500">{h.settings.pitch}x</span>
                                </div>
                                <div className="bg-white/5 rounded-lg p-1.5 flex flex-col items-center">
                                  <span className="text-[7px] text-white/40 uppercase">سرعة</span>
                                  <span className="text-[9px] font-bold text-blue-400">{h.settings.speed}x</span>
                                </div>
                                <div className="bg-white/5 rounded-lg p-1.5 flex flex-col items-center">
                                  <span className="text-[7px] text-white/40 uppercase">أداء</span>
                                  <span className="text-[9px] font-bold text-emerald-400">{h.settings.intensity}</span>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-1">
                                <button 
                                  onClick={() => playAudioWithTone(h.id, h.blobUrl, historyFx[h.id] || { pitch: 0, speed: 1.0, reverb: 0, chorus: false })} 
                                  className={`flex-1 py-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all ${
                                    (currentlyPlaying === h.id || activeTonePlayerId === h.id) ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'bg-white/10 hover:bg-white/20'
                                  }`}
                                >
                                  {(currentlyPlaying === h.id || activeTonePlayerId === h.id) ? <Loader2 className="w-3 h-3 animate-spin text-white"/> : <Play className="w-3 h-3 fill-current"/>}
                                  <span>{(currentlyPlaying === h.id || activeTonePlayerId === h.id) ? 'جاري التشغيل' : 'إعادة الاستماع'}</span>
                                </button>
                                <div className="flex gap-1">
                                  <button onClick={() => setExpandedFxId(expandedFxId === h.id ? null : h.id)} className={`p-3 rounded-xl transition-all ${expandedFxId === h.id ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-purple-600/20 hover:text-purple-400'}`} title="المؤثرات الصوتية"><Music className="w-3.5 h-3.5"/></button>
                                  <button onClick={() => addToMixer({ name: h.text.slice(0, 12), url: h.blobUrl, type: 'voice', originalId: h.id })} className="p-3 bg-white/5 rounded-xl hover:bg-orange-600/20 hover:text-orange-500 transition-all" title="إضافة للميكساج"><Plus className="w-3.5 h-3.5"/></button>
                                  <a href={h.blobUrl} download={`${h.voice}_dub.wav`} className="p-3 bg-white/5 rounded-xl hover:text-white transition-all" title="تحميل الملف"><Download className="w-3.5 h-3.5"/></a>
                                  <button onClick={() => deleteHistoryItem(h.id)} className="p-3 bg-white/5 rounded-xl hover:text-red-500 transition-all" title="حذف"><Trash2 className="w-3.5 h-3.5"/></button>
                                </div>
                              </div>
                              
                              {expandedFxId === h.id && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="pt-3 border-t border-white/10 space-y-3"
                                >
                                  <div className="flex items-center justify-between text-white/50 text-[10px] mb-2 font-bold px-1">
                                    <span>موالفة الصوت المتقدمة</span>
                                    <Sparkles className="w-3 h-3" />
                                  </div>
                                  
                                  <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/5">
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-white/60">سرعة القراءة (Speed)</span>
                                        <span className="font-mono text-blue-400">{(historyFx[h.id]?.speed || 1.0).toFixed(2)}x</span>
                                      </div>
                                      <input 
                                        type="range" min="0.5" max="2.0" step="0.05" 
                                        value={historyFx[h.id]?.speed || 1.0}
                                        onChange={e => setHistoryFx(prev => ({...prev, [h.id]: {...(prev[h.id] || { pitch: 0, speed: 1.0, reverb: 0, chorus: false }), speed: parseFloat(e.target.value)}}))}
                                        className="w-full accent-blue-500"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-white/60">حدة الصوت (Pitch)</span>
                                        <span className="font-mono text-orange-400">
                                          {(historyFx[h.id]?.pitch || 0) > 0 ? '+' : ''}{(historyFx[h.id]?.pitch || 0)}
                                        </span>
                                      </div>
                                      <input 
                                        type="range" min="-12" max="12" step="1" 
                                        value={historyFx[h.id]?.pitch || 0}
                                        onChange={e => setHistoryFx(prev => ({...prev, [h.id]: {...(prev[h.id] || { pitch: 0, speed: 1.0, reverb: 0, chorus: false }), pitch: parseFloat(e.target.value)}}))}
                                        className="w-full accent-orange-500"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-white/60">الكنيسة (Reverb)</span>
                                        <span className="font-mono text-purple-400">
                                          {((historyFx[h.id]?.reverb || 0) * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      <input 
                                        type="range" min="0" max="1" step="0.05" 
                                        value={historyFx[h.id]?.reverb || 0}
                                        onChange={e => setHistoryFx(prev => ({...prev, [h.id]: {...(prev[h.id] || { pitch: 0, speed: 1.0, reverb: 0, chorus: false }), reverb: parseFloat(e.target.value)}}))}
                                        className="w-full accent-purple-500"
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                            <div className="h-1 bg-white/5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2 }}
                                className="h-full bg-orange-500/50"
                              />
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                 </div>
              </div>
            </motion.div>
          ) : activeTab === 'script' ? (
            <motion.div key="script" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
              <div className="bg-gradient-to-r from-indigo-950/40 to-blue-950/40 border border-white/10 p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/20 shrink-0">
                  <Box className="w-12 h-12 text-white" />
                </div>
                <div className="text-center md:text-right space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">غرفة السيناريو المحترف</h2>
                  <p className="text-white/40 leading-relaxed">
                    قم ببناء مشهد كامل بتعدد الشخصيات. أضف الجمل، اختر المؤدي، وقم بمزامنة الحوار لخلق عرض سينمائي فريد.
                  </p>
                </div>
                <div className="mr-auto flex items-center gap-3">
                    <button 
                      onClick={handleAutoComposeScene}
                      disabled={isGeneratingDialogue}
                      className="px-6 py-4 bg-indigo-600/20 border border-indigo-500/50 text-indigo-400 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingDialogue ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>تأليف مشهد تلقائي</span>
                    </button>
                    <button 
                      onClick={() => {
                        const allLines = scriptLines.filter(l => !l.audioUrl);
                        allLines.forEach(l => generateLine(l.id));
                      }}
                      className="px-8 py-4 bg-white text-black rounded-2xl font-black hover:scale-105 transition-all"
                    >
                      توليد الكل
                    </button>
                </div>
              </div>

              <div className="space-y-4">
                {scriptLines.length === 0 ? (
                  <div className="py-32 text-center text-white/10 border border-dashed border-white/5 rounded-[40px]">
                    <Plus className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="text-xl font-bold">ابدأ بإضافة جمل من تبويب الدبلجة</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {scriptLines.map((line, idx) => {
                      const voice = VOICES.find(v => v.id === line.voiceId) || 
                                   clonedVoices.find(v => v.id === line.voiceId) || 
                                   compositeVoices.find(v => v.id === line.voiceId);
                      const isCustom = line.voiceId === 'custom';
                      const isComposite = line.voiceId.startsWith('composite-');
                      const IconComp = getIcon(isCustom ? UserPlus : (voice?.icon || (isComposite ? Layers : Mic2)));
                      const color = isCustom ? 'from-emerald-500 to-teal-600' : 
                                   (isComposite ? 'from-blue-600 to-indigo-900' : (voice?.color || 'from-gray-500 to-gray-700'));

                      return (
                        <div 
                          key={line.id} 
                          className="group flex flex-col sm:flex-row items-center gap-6 bg-white/5 p-6 rounded-[32px] border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden"
                        >
                          {line.isGenerating && (
                            <div className="absolute inset-0 bg-indigo-600/5 backdrop-blur-[1px] flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                          )}
                          
                          <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/30 border border-white/10">{idx + 1}</div>
                             <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-black/20 overflow-hidden relative border border-white/10 flex items-center justify-center shrink-0`}>
                               <IconComp className="w-6 h-6 text-white" />
                             </div>
                             <button onClick={() => setScriptLines(prev => prev.filter(l => l.id !== line.id))} className="p-2 text-white/10 hover:text-red-500 transition-all sm:mt-2"><Trash2 className="w-4 h-4"/></button>
                          </div>
                          
                          <div className="flex-1 text-right space-y-2">
                             <div className="flex items-center gap-2 justify-end">
                               <span className="text-sm font-black text-indigo-400">{isCustom ? customVoice.nameAr : voice?.nameAr}</span>
                               <span className="text-[10px] text-white/20 px-2 py-0.5 bg-white/5 rounded-md uppercase font-bold">{isCustom ? customVoice.archetypeAr : voice?.archetypeAr}</span>
                             </div>
                             <p className="text-lg leading-relaxed text-white/90 border-r-2 border-indigo-500/20 pr-4">{line.text}</p>
                          </div>

                          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                             {line.audioUrl ? (
                               <>
                                 <button onClick={() => playAudio(line.id, line.audioUrl!)} className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${currentlyPlaying === line.id ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                   {currentlyPlaying === line.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4 fill-current"/>}
                                   <span>تشغيل</span>
                                 </button>
                                 <div className="flex gap-2">
                                   <button onClick={() => addToMixer({ name: line.text.slice(0, 15), url: line.audioUrl!, type: 'voice', originalId: line.id })} className="flex-1 p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all flex justify-center">
                                     <Plus className="w-5 h-5" />
                                   </button>
                                   <a href={line.audioUrl} download="dub.wav" className="p-4 bg-white/5 text-white/40 rounded-2xl hover:text-white transition-all flex justify-center">
                                     <Download className="w-5 h-5" />
                                   </a>
                                 </div>
                               </>
                             ) : (
                               <button 
                                 onClick={() => generateLine(line.id)}
                                 disabled={line.isGenerating}
                                 className="w-full sm:px-10 py-6 bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                               >
                                 {line.isGenerating ? <Loader2 className="w-6 h-6 animate-spin"/> : <Sparkles className="w-6 h-6"/>}
                                 <span>توليد الأداء</span>
                               </button>
                             )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {scriptLines.length > 0 && (
                  <div className="flex justify-center pt-8">
                     <button onClick={() => setScriptLines([])} className="flex items-center gap-2 text-white/20 hover:text-red-500 transition-all font-bold">
                       <Trash2 className="w-4 h-4" />
                       <span>تصفير الغرفة</span>
                     </button>
                  </div>
                )}
              </div>
            </motion.div>

          ) : activeTab === 'mixer' ? (
            <motion.div key="mixer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
               <div className="bg-orange-500/5 border border-orange-500/20 p-12 rounded-[40px] text-center">
                  <h2 className="text-2xl font-black mb-4">غرفة الميكساج</h2>
                  <div className="flex justify-center gap-4">
                     <button onClick={playMix} disabled={mixerItems.length === 0} className="px-12 py-4 bg-orange-600 rounded-2xl font-bold flex items-center gap-3 disabled:opacity-50 hover:bg-orange-500 transition-all">
                        {currentlyPlaying === 'global-mix' ? <Loader2 className="w-5 h-5 animate-spin"/> : <Play className="w-5 h-5 fill-current"/>}
                        تشغيل المشهد
                     </button>
                     <button 
                       onClick={savePreset} 
                       disabled={mixerItems.length === 0}
                       className="p-4 bg-white/5 rounded-2xl hover:text-orange-500 hover:bg-white/10 transition-all disabled:opacity-50"
                       title="حفظ كمشهد جاهز (بريسيت)"
                     >
                       <Download className="w-6 h-6"/>
                     </button>
                     <button onClick={() => setMixerItems([])} className="p-4 bg-white/5 rounded-2xl hover:text-red-500 hover:bg-white/10 transition-all"><Trash2 className="w-6 h-6"/></button>
                  </div>
               </div>
                <div className="space-y-4">
                  {mixerItems.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/5 transition-all"
                    >
                       <div className="flex items-center gap-4 w-full sm:w-auto">
                         <span className="text-white/10 font-black text-2xl">{idx + 1}</span>
                         <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner">
                           {item.type === 'voice' ? <Mic2 className="w-5 h-5 text-orange-500"/> : <Music className="w-5 h-5 text-blue-500"/>}
                         </div>
                         <div className="flex-1 text-right">
                           <h4 className="font-bold text-sm text-white/90 line-clamp-1">{item.name}</h4>
                           <span className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-white/30 uppercase tracking-tighter italic">{item.type}</span>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full">
                         <div className="space-y-2">
                           <div className="flex justify-between items-center text-[9px] text-white/30">
                             <span>{Math.round(item.volume * 100)}%</span>
                             <span className="uppercase font-bold tracking-widest">مستوى الصوت</span>
                           </div>
                           <input type="range" min="0" max="1" step="0.05" value={item.volume} onChange={e => updateMixerItemVolume(item.id, parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-orange-500" />
                         </div>

                         <div className="space-y-2">
                           <div className="flex justify-between items-center text-[9px] text-white/30">
                             <span>{item.speed}x</span>
                             <span className="uppercase font-bold tracking-widest">السرعة</span>
                           </div>
                           <input type="range" min="0.5" max="2.0" step="0.1" value={item.speed} onChange={e => updateMixerItemSpeed(item.id, parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-blue-500" />
                         </div>

                         <div className="space-y-2">
                           <div className="flex justify-between items-center text-[9px] text-white/30">
                             <span>{item.delay}s</span>
                             <span className="uppercase font-bold tracking-widest">التأخير (ثانية)</span>
                           </div>
                           <input type="range" min="0" max="30" step="0.5" value={item.delay} onChange={e => updateMixerItemDelay(item.id, parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-emerald-500" />
                         </div>

                         <div className="flex flex-col items-center justify-center gap-1">
                           <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">تكرار</span>
                           <button 
                             onClick={() => toggleMixerItemLoop(item.id)}
                             className={`p-2 rounded-xl border transition-all ${item.loop ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/20 hover:text-white'}`}
                           >
                             <Layers className="w-4 h-4" />
                           </button>
                         </div>
                       </div>

                       <div className="flex gap-2">
                         <button onClick={() => playAudio(item.id, item.url, item.volume, item.speed)} className="p-3 bg-white/5 rounded-2xl text-white/30 hover:text-white hover:bg-white/10 transition-all">
                           <Play className="w-4 h-4 fill-current" />
                         </button>
                         <button onClick={() => removeFromMixer(item.id)} className="p-3 bg-white/5 rounded-2xl text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all">
                           <Trash2 className="w-4 h-4"/>
                         </button>
                       </div>
                    </div>
                  ))}
                  {mixerItems.length === 0 && (
                    <div className="py-20 text-center text-white/10 border border-dashed border-white/5 rounded-3xl">
                      <Layers className="w-12 h-12 mx-auto mb-4 opacity-5" />
                      <p>أضف أصواتاً من السجل للبدء</p>
                    </div>
                  )}
                </div>

                {presets.length > 0 && (
                  <div className="space-y-4 pt-12 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest text-right">المشاهد المحفوظة (البريسيتس)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {presets.map(p => (
                        <div key={p.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group">
                          <div className="flex gap-2">
                             <button onClick={() => deletePreset(p.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                             <button onClick={() => loadPreset(p)} className="px-4 py-2 bg-orange-600/20 text-orange-500 rounded-xl text-xs font-bold hover:bg-orange-600 hover:text-white transition-all">تحميل المشهد</button>
                          </div>
                          <div className="text-right">
                             <h4 className="font-bold text-sm">{p.name}</h4>
                             <p className="text-[10px] text-white/30">{p.items.length} أصوات • {new Date(p.timestamp).toLocaleDateString('ar-EG')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </motion.div>
          ) : activeTab === 'lab' ? (
            <motion.div key="lab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8">
              <div className="flex justify-center mb-8">
                <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xl">
                  <button 
                    onClick={() => setLabMode('blending')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${labMode === 'blending' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>دمج الأصوات (Hybrid)</span>
                  </button>
                  <button 
                    onClick={() => setLabMode('cloning')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${labMode === 'cloning' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    <Stars className="w-4 h-4" />
                    <span>استنساخ الأداء (Clone)</span>
                  </button>
                </div>
              </div>

              {labMode === 'cloning' ? (
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 p-12 rounded-[40px] text-center space-y-6">
                    <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-600/20">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black italic tracking-tighter">مختبر تحليل الأداء</h2>
                      <p className="text-white/40 max-w-lg mx-auto leading-relaxed text-sm">
                        قم برفع مقطع صوتي لتحليل جرس الصوت. سيقوم الذكاء الاصطناعي بتحديد أفضل صوت أساسي من عائلة Gemini، مع التوصية بالسرعة والحدة المثالية لمحاكاة الشخصية بدقة متناهية.
                      </p>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputAnalysisRef} 
                      onChange={handleAnalysisUpload} 
                      accept="audio/*" 
                      className="hidden" 
                    />
                    
                    <div className="flex justify-center gap-4 pt-4">
                      <button 
                        disabled={analyzing}
                        onClick={() => fileInputAnalysisRef.current?.click()}
                        className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {analyzing ? <Loader2 className="w-6 h-6 animate-spin mx-auto"/> : (
                          <div className="flex items-center gap-3">
                            <Upload className="w-6 h-6" />
                            <span>رفع الملف للتحليل</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {analysisResult && !analyzing && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-8"
                    >
                      <div className="md:col-span-8 bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                        <div className="flex items-center gap-6 justify-end">
                          <div className="text-right">
                            <h3 className="text-2xl font-bold text-orange-500">{analysisResult.nameAr}</h3>
                            <p className="text-sm text-white/40">{analysisResult.archetypeAr}</p>
                          </div>
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                            <Stars className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {analysisResult.transcription && (
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-right relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-1 h-full bg-blue-500/50" />
                              <label className="text-[10px] text-white/20 uppercase block mb-1">النص الأصلي والمترجم</label>
                              <p className="text-white/40 text-xs italic mb-2 font-mono" dir="ltr">{analysisResult.transcription}</p>
                              <div className="flex items-center gap-2 justify-end">
                                <p className="text-lg font-bold text-white">{analysisResult.translation}</p>
                                <Copy 
                                  className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" 
                                  onClick={() => {
                                    navigator.clipboard.writeText(analysisResult.translation);
                                    alert("تم نسخ الترجمة!");
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="bg-black/40 p-5 rounded-2xl border border-white/5 text-right">
                            <label className="text-[10px] text-white/20 uppercase block mb-1">وصف نبرة الصوت</label>
                            <p className="text-sm leading-relaxed">{analysisResult.descriptionAr}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 text-right">
                              <label className="text-[10px] text-white/20 uppercase block mb-1">الرنين الأساسي (Gemini)</label>
                              <p className="font-bold text-orange-500">{analysisResult.suggestedBaseVoice || 'Puck'}</p>
                            </div>
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 text-right">
                              <label className="text-[10px] text-white/20 uppercase block mb-1">الحدة المقترحة</label>
                              <p className="font-bold text-orange-500">{analysisResult.suggestedPitch}x</p>
                            </div>
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 text-right">
                              <label className="text-[10px] text-white/20 uppercase block mb-1">السرعة المقترحة</label>
                              <p className="font-bold text-orange-500">{analysisResult.suggestedSpeed}x</p>
                            </div>
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 text-right">
                              <label className="text-[10px] text-white/20 uppercase block mb-1">التصنيف النفسي</label>
                              <p className="font-bold text-orange-500">{analysisResult.temperament || 'متوازن'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button 
                            onClick={applyAnalysis}
                            className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                          >
                            <UserPlus className="w-6 h-6" />
                            <span>محاكاة هذه الشخصية الآن</span>
                          </button>
                          <button 
                            onClick={handleSaveClone}
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                          >
                            <CopyPlus className="w-6 h-6" />
                            <span>استنساخ وحفظ دائم</span>
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-4 bg-orange-600/5 border border-orange-600/20 p-8 rounded-3xl flex flex-col justify-center items-center text-center space-y-4">
                        <div className="p-4 bg-orange-500/10 rounded-full">
                          <Sparkles className="w-8 h-8 text-orange-500" />
                        </div>
                        <h4 className="font-bold">استنساخ الروح</h4>
                        <p className="text-xs text-white/40 leading-relaxed">
                          الذكاء الاصطناعي قام بتحليل الترددات والخصائص الصوتية بدقة. 
                          عند الاعتماد، سيتم ضبط "الشخصية المخصصة" آلياً لمحاكاة هذا الأداء.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6">
                        <div className="text-right">
                           <div className="flex items-center gap-2 justify-end mb-2">
                             <h3 className="text-xl font-black tracking-tight">{compositeEditor?.id ? 'تعديل الصوت الهجين' : 'تكوين المزيج الهجين'}</h3>
                             <div className="p-2 bg-blue-600/20 rounded-xl">
                               <Layers className="w-5 h-5 text-blue-500" />
                             </div>
                           </div>
                           <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest font-bold">Scientific Synthesis Laboratory</p>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold text-white/40 uppercase block text-right">اسم الكيان الصوتي الجديد</label>
                             <input 
                               value={compositeEditor?.nameAr || ''} 
                               onChange={e => setCompositeEditor({ ...(compositeEditor || {}), nameAr: e.target.value })}
                               className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-right outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                               placeholder="مثال: غانوندورف بنفحات زيلدا"
                             />
                           </div>

                           <div className="space-y-2">
                             <label className="text-[10px] font-bold text-white/40 uppercase block text-right">التصنيف أو الوصف المختصر</label>
                             <input 
                               value={compositeEditor?.archetypeAr || ''} 
                               onChange={e => setCompositeEditor({ ...(compositeEditor || {}), archetypeAr: e.target.value })}
                               className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-right outline-none focus:border-blue-500/50 transition-all text-xs"
                               placeholder="مثال: تجسيد متناقض للضوء والظلام"
                             />
                           </div>

                           <div className="space-y-4">
                             <div className="flex justify-between items-center text-[10px] font-bold text-white/40 uppercase">
                               <div className="flex items-center gap-1">
                                 <span>{Math.round((compositeEditor?.blendRatio || 0.5) * 100)}% Focus On B</span>
                               </div>
                               <span>توازن جينات الصوت</span>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-black italic transition-colors ${compositeEditor?.blendRatio === 0 ? 'text-blue-400' : 'text-white/20'}`}>A</span>
                                <div className="flex-1 relative h-4 bg-white/5 rounded-full overflow-hidden">
                                   <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-900 to-blue-600" style={{ width: `${(compositeEditor?.blendRatio || 0.5) * 100}%` }} />
                                   <input 
                                     type="range" 
                                     min="0" 
                                     max="1" 
                                     step="0.01" 
                                     value={compositeEditor?.blendRatio || 0.5} 
                                     onChange={e => setCompositeEditor({ ...(compositeEditor || {}), blendRatio: parseFloat(e.target.value) })}
                                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                   />
                                </div>
                                <span className={`text-[10px] font-black italic transition-colors ${compositeEditor?.blendRatio === 1 ? 'text-blue-400' : 'text-white/20'}`}>B</span>
                             </div>

                             <div className="flex justify-between text-[8px] text-white/20 font-bold uppercase mt-1 px-8">
                               <span>الروح (B)</span>
                               <span>توازن</span>
                               <span>الهيكل (A)</span>
                             </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] text-white/40 block text-right font-black">أيقونة الكيان</label>
                                 <div className="flex flex-wrap gap-1 justify-end">
                                   {[Layers, Target, SlidersHorizontal, Mic2, Sparkles, Wand2, Ghost, Zap, Sword, Flame].map((Icon, i) => (
                                      <button 
                                        key={i} 
                                        onClick={() => setCompositeEditor({ ...compositeEditor, icon: Object.keys(ICON_MAP).find(k => ICON_MAP[k] === Icon) })}
                                        className={`p-2 rounded-lg border transition-all ${getIcon(compositeEditor?.icon) === Icon ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/5'}`}
                                      >
                                        <Icon className="w-3.5 h-3.5" />
                                      </button>
                                   ))}
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] text-white/40 block text-right font-black">طيف اللون</label>
                                 <div className="flex flex-wrap gap-1 justify-end">
                                   {COLOR_OPTIONS.slice(0, 6).map((color, i) => (
                                      <button 
                                        key={i} 
                                        onClick={() => setCompositeEditor({ ...compositeEditor, color })}
                                        className={`w-6 h-6 rounded-lg border transition-all bg-gradient-to-br ${color} ${compositeEditor?.color === color ? 'border-white scale-110' : 'border-white/10'}`}
                                      />
                                   ))}
                                 </div>
                              </div>
                           </div>

                           <div className="flex gap-2">
                              {compositeEditor?.id && (
                                <button 
                                  onClick={() => setCompositeEditor(null)}
                                  className="px-4 py-4 bg-white/5 hover:bg-white/10 text-white/40 rounded-2xl text-xs font-bold transition-all"
                                >
                                  إلغاء التعديل
                                </button>
                              )}
                              <button 
                                disabled={!compositeEditor?.nameAr || !compositeEditor?.voiceAId || !compositeEditor?.voiceBId}
                                onClick={() => {
                                  if (compositeEditor?.nameAr && compositeEditor?.voiceAId && compositeEditor?.voiceBId) {
                                    const isEditing = !!compositeEditor.id;
                                    const finalId = compositeEditor.id || `composite-${crypto.randomUUID()}`;
                                    const finalCV: CompositeVoice = { 
                                      id: finalId, 
                                      nameAr: compositeEditor.nameAr!,
                                      archetypeAr: compositeEditor.archetypeAr || 'Hybrid Entity',
                                      voiceAId: compositeEditor.voiceAId!,
                                      voiceBId: compositeEditor.voiceBId!,
                                      blendRatio: compositeEditor.blendRatio || 0.5,
                                      guidance: 'Balance the nuances of both core essences to achieve a perfectly harmonized hybrid performance.',
                                      icon: compositeEditor.icon || 'Layers',
                                      color: compositeEditor.color || 'from-blue-600 to-indigo-900'
                                    };

                                    if (isEditing) {
                                      setCompositeVoices(prev => prev.map(cv => cv.id === finalId ? finalCV : cv));
                                    } else {
                                      setCompositeVoices(prev => [finalCV, ...prev]);
                                    }
                                    
                                    setSelectedVoice(finalId);
                                    setCompositeEditor(null);
                                    setActiveTab('voice');
                                    alert(isEditing ? "تم حفظ التعديلات على الصوت الهجين." : "تم خلق الكيان الصوتي الجديد بنجاح!");
                                  }
                                }}
                                className="flex-1 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                              >
                                {compositeEditor?.id ? 'حفظ التعديلات' : 'خلق الكيان الهجين'}
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-2 justify-end">
                           <span className="text-xs font-bold text-blue-400">كيانات هجينة سابقة</span>
                           <Layers className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                           {compositeVoices.length === 0 ? (
                             <div className="text-center py-10 opacity-20 flex flex-col items-center gap-2">
                                <Box className="w-8 h-8" />
                                <p className="text-[10px] uppercase font-black">No Entities Found</p>
                             </div>
                           ) : (
                             compositeVoices.map(cv => (
                               <div key={cv.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                 <div className="flex gap-1.5">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setCompositeEditor(cv); }}
                                      className="p-2 text-white/10 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
                                      title="تعديل النسبة"
                                   >
                                      <SlidersHorizontal className="w-3.5 h-3.5" />
                                   </button>
                                   <button 
                                      onClick={() => setCompositeVoices(prev => prev.filter(v => v.id !== cv.id))} 
                                      className="p-2 text-white/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                      title="تدمير الكيان"
                                   >
                                     <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                 </div>
                                 <div className="text-right">
                                   <h4 className="font-bold text-xs">{cv.nameAr}</h4>
                                   <p className="text-[8px] text-white/20 uppercase font-bold tracking-tight">{cv.archetypeAr || 'Hybrid Entity'}</p>
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-8 grid grid-cols-2 gap-8 relative">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                        <div className="w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full animate-pulse" />
                     </div>

                     <div className="space-y-6 z-10">
                        <div className="flex items-center gap-3 justify-end bg-white/5 p-4 rounded-2xl border border-white/5">
                           <div className="text-right">
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Genetic Structure</span>
                             <span className="text-xs font-bold text-blue-400">الصوت (ب): الروح والجرس</span>
                           </div>
                           <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 text-lg font-black italic">B</div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
                           {[...VOICES, ...clonedVoices].map(v => (
                             <button
                               key={v.id}
                               onClick={() => setCompositeEditor({ ...(compositeEditor || {}), voiceBId: v.id })}
                               className={`p-4 rounded-[28px] border transition-all flex items-center gap-4 text-right group relative overflow-hidden ${compositeEditor?.voiceBId === v.id ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50' : 'border-white/5 bg-white/2 hover:border-white/10'}`}
                             >
                               <div className="flex-1">
                                 <p className="font-bold text-sm tracking-tight">{v.nameAr}</p>
                                 <p className="text-[9px] text-white/30 uppercase tracking-tighter">{(v as any).archetypeAr || 'Cloned Pattern'}</p>
                               </div>
                               <div className={`p-2.5 rounded-xl bg-gradient-to-br ${v.color} group-hover:rotate-12 transition-transform shadow-lg`}>
                                 {(() => { const IconComp = getIcon(v.icon); return <IconComp className="w-5 h-5 text-white" /> })()}
                               </div>
                               {compositeEditor?.voiceBId === v.id && (
                                 <motion.div layoutId="sel-b" className="absolute left-2 top-1/2 -translate-y-1/2">
                                    <Check className="w-4 h-4 text-blue-500" />
                                 </motion.div>
                               )}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6 z-10">
                        <div className="flex items-center gap-3 justify-end bg-white/5 p-4 rounded-2xl border border-white/5">
                           <div className="text-right">
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Physical Template</span>
                             <span className="text-xs font-bold text-blue-400">الصوت (أ): الطبقة والحدة</span>
                           </div>
                           <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 text-lg font-black italic">A</div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
                           {[...VOICES, ...clonedVoices].map(v => (
                             <button
                               key={v.id}
                               onClick={() => setCompositeEditor({ ...(compositeEditor || {}), voiceAId: v.id })}
                               className={`p-4 rounded-[28px] border transition-all flex items-center gap-4 text-right group relative overflow-hidden ${compositeEditor?.voiceAId === v.id ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50' : 'border-white/5 bg-white/2 hover:border-white/10'}`}
                             >
                               <div className="flex-1">
                                 <p className="font-bold text-sm tracking-tight">{v.nameAr}</p>
                                 <p className="text-[9px] text-white/30 uppercase tracking-tighter">{(v as any).archetypeAr || 'Cloned Pattern'}</p>
                               </div>
                               <div className={`p-2.5 rounded-xl bg-gradient-to-br ${v.color} group-hover:rotate-12 transition-transform shadow-lg`}>
                                 {(() => { const IconComp = getIcon(v.icon); return <IconComp className="w-5 h-5 text-white" /> })()}
                               </div>
                               {compositeEditor?.voiceAId === v.id && (
                                 <motion.div layoutId="sel-a" className="absolute left-2 top-1/2 -translate-y-1/2">
                                    <Check className="w-4 h-4 text-blue-500" />
                                 </motion.div>
                               )}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="unknown" className="text-center py-20 text-white/20 font-bold">يرجى اختيار تبويب من الأعلى</motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toneEditor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[40px] w-full max-w-lg space-y-6 shadow-2xl overflow-hidden relative"
            >
              <div className="flex items-center justify-between">
                <button onClick={() => setToneEditor(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
                <div className="text-right">
                  <h2 className="text-xl font-bold">تعديل النبرة المخصصة</h2>
                  <p className="text-xs text-orange-500">قم بتخصيص التحريض النصي (Prompt) لهذه النبرة</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase block text-right">اسم النبرة</label>
                  <input 
                    value={toneEditor.tone.labelAr} 
                    onChange={e => setToneEditor({ ...toneEditor, tone: { ...toneEditor.tone, labelAr: e.target.value } })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-right outline-none focus:border-orange-500/50 transition-all font-bold"
                    placeholder="مثال: غضب ملكي هادئ"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase block text-right">التحريض النصي للذكاء الاصطناعي (Prompt)</label>
                  <textarea 
                    rows={5}
                    value={toneEditor.tone.prompt}
                    onChange={e => setToneEditor({ ...toneEditor, tone: { ...toneEditor.tone, prompt: e.target.value } })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-right outline-none focus:border-orange-500/50 transition-all leading-relaxed"
                    placeholder="اكتب وصفاً دقيقاً لطريقة الأداء بالأرقام أو الصفات (مثلاً: Fast, High-pitched, Angry...)"
                  />
                  <div className="flex flex-wrap gap-1 justify-end">
                    {['Angry', 'Whisper', 'Excited', 'Sarcastic', 'Old voice', 'Evil'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setToneEditor({ ...toneEditor, tone: { ...toneEditor.tone, prompt: toneEditor.tone.prompt + ', ' + tag } })}
                        className="text-[9px] px-2 py-1 bg-white/5 border border-white/5 rounded-md hover:bg-white/10 text-white/40"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/20 text-right">هذا النص يوجه الذكاء الاصطناعي لتقمص النبرة المطلوبة باللغة الإنجليزية لأداء أفضل.</p>
                </div>

                <button 
                  onClick={() => saveCustomTone(toneEditor.voiceId, toneEditor.tone)}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20"
                >
                  <Check className="w-5 h-5" />
                  <span>حفظ النبرة المخصصة</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* The redundant fixed modal is removed as we the unified inline Lab tab UI handles everything now. */}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
