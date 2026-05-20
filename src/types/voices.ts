import { LucideIcon } from 'lucide-react';

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export const sanitizeVoiceName = (voice: string | undefined | null): VoiceName => {
  if (!voice) return 'Fenrir';
  const clean = voice.trim().split(/[\s(]/)[0].replace(/[^a-zA-Z]/g, '');
  const validVoices: VoiceName[] = ['Puck', 'Kore', 'Fenrir', 'Charon', 'Zephyr'];
  return validVoices.includes(clean as VoiceName) ? (clean as VoiceName) : 'Fenrir';
};

export interface VoiceTone {
  id: string;
  labelAr: string;
  prompt: string;
}

export interface CharacterVoice {
  id: string;
  geminiVoiceId: VoiceName;
  gender: 'male' | 'female';
  alignment?: 'heroic' | 'villainous' | 'neutral';
  temperament?: 'arrogant' | 'humble' | 'eccentric' | 'calm' | 'cunning' | 'calculated';
  intellect?: 'genius' | 'average' | 'foolish' | 'ancient' | 'hyper-intelligent';
  age?: 'young' | 'middle-aged' | 'old';
  timbre?: 'smooth' | 'husky' | 'booming' | 'nasal' | 'ethereal';
  name: string;
  nameAr: string;
  archetypeAr: string;
  description: string;
  descriptionAr: string;
  traitsAr: string[];
  tipsAr: string;
  guidance: string;
  tonesAr: VoiceTone[];
  signatureSfxIds?: string[];
  icon: any; // Using any for easier serialization or you can use LucideIcon|string
  color: string;
  pitch?: number;
  speed?: number;
}
