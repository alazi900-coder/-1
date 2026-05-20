const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

const imports = `import { ALL_VOICES } from './data/characters';
import { ZELDA_TEMPLATES, SFX_TAGS, PROMPT_EXAMPLES } from './data/config';
import { VoiceName, sanitizeVoiceName, VoiceTone, CharacterVoice } from './types/voices';
const VOICES = ALL_VOICES;
`;

const newLines = [
  ...lines.slice(0, 95),
  imports,
  ...lines.slice(655)
];

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
