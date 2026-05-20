import { CharacterVoice } from "../../types/voices";
import { Wand2 } from "lucide-react";

export const rauruVoice: CharacterVoice = {
  "id": "rauru",
  "geminiVoiceId": "Fenrir",
  "gender": "male",
  "alignment": "heroic",
  "temperament": "calm",
  "intellect": "genius",
  "name": "King Rauru",
  "nameAr": "الملك راورو (الملك المؤسس)",
  "archetypeAr": "أول ملوك هايرول العظام",
  "description": "Majestic, ultra-resonant, and divine. A deep, paternal voice that vibrates with ancient celestial authority and profound wisdom.",
  "descriptionAr": "صوت ملكي سماوي، عميق وشجي، يمثل السلطة المطلقة والحكمة الأزلية. نبرة أبوية مهيبة تحمل ثقل التاريخ وقدسية الضوء.",
  "traitsAr": [
    "سيادي",
    "نوراني",
    "وقور"
  ],
  "tipsAr": "ركز على \"الوقار الإلهي\". تحدث برزانة مفرطة ورنين عميق ينبع من الروح. يجب أن يبدو الصوت وكأنه يغلف المستمع بالحماية الأسطورية. لا تتردد في استخدام طبقة باس (Bassy) قوية.",
  "guidance": "Speak with the resonant authority of a founding king, emphasizing every vowel with celestial weight.",
  "tonesAr": [
    {
      "id": "divine_guidance",
      "labelAr": "الإرشاد المقدس",
      "prompt": "Speak with an ethereal, divine resonance. Use long, flowing pauses. Your voice should sound like it is coming from the heavens—deep, paternal, and immensely peaceful. Absolute clarity."
    },
    {
      "id": "ancient_duty",
      "labelAr": "ثقل الأزل",
      "prompt": "Use an incredibly slow, heavy, and super-resonant tone. Every syllable should vibrate with the weight of millennia. Add an almost imperceptible, ancient reverb, sounding as if your voice is echoing from the very foundations of Hyrule. Massive depth and kingly authority."
    },
    {
      "id": "paternal_warmth",
      "labelAr": "حنان أبوي",
      "prompt": "Soften the resonance. Speak with a gentle, breathy warmth as if speaking to a beloved child. Kind, protective, and encouraging. Natural and warm."
    },
    {
      "id": "noble_sacrifice",
      "labelAr": "ثبات التضحية",
      "prompt": "Speak with a lower, steady, and resigned tone. There is a slight tremble of emotion but held back by royal stoicism. Noble, final, and heavy-hearted."
    },
    {
      "id": "founder_command",
      "labelAr": "أمر المؤسس المهيب",
      "prompt": "An authoritative and clear tone delivered with a sense of urgency and power, distinct from your calmer, resonant whispers. It should sound like a direct command from a founding monarch, full of ancient magic and commanding leadership. Project a voice that demands immediate attention and unwavering obedience."
    },
    {
      "id": "humble_recognition",
      "labelAr": "إجلال متواضع",
      "prompt": "Calm, slightly softer than your usual resonance. Express genuine acknowledgment and respect for the strength of others. Sound wise, magnanimous, and deeply humble despite your royal status. A serene and honoring tone."
    },
    {
      "id": "solemn_wisdom",
      "labelAr": "حكمة جليلة مهيبة",
      "prompt": "Calm, extremely resonant, and sounding ancient as if spoken by someone who has witnessed epochs. Carry a heavy, yet comforting gravitas, conveying deep understanding and peace. Slow, steady, and profoundly wise."
    },
    {
      "id": "ancient_judgment",
      "labelAr": "القضاء السماوي",
      "prompt": "Deliver a deep, cold, and echoing judgment. Every word should vibrate with the absolute authority of the cosmos. No emotion, only the weight of divine law."
    },
    {
      "id": "ancient_echoes",
      "labelAr": "صدى الأزل الغابر",
      "prompt": "Use a deep, resonant voice with a slow, deliberate cadence. Add a subtle, lingering reverb to give the impression of an ancient spirit speaking across time—solemn, mystical, and profoundly deep."
    },
    {
      "id": "fading_light",
      "labelAr": "أمل النور المتلاشي",
      "prompt": "Soften the resonance significantly. Speak with a frail, breathy quality as if your light is almost extinguished. Hopeful but exhausted and very quiet."
    },
    {
      "id": "founder_legacy",
      "labelAr": "إرث المؤسسين الخالد",
      "prompt": "Warm, grand, and nostalgic. Speak with a rich resonance that feels like a vast kingdom being shown for the first time. Grandiose and inspiring."
    },
    {
      "id": "eternal_vigilance",
      "labelAr": "يقظة أزلية لا تغفو",
      "prompt": "Speak with a low, intense, and steady focus. The voice should feel like a watchful eye that has never blinked for centuries. Heavy, calm, and slightly sharp at the edges."
    },
    {
      "id": "tender_benediction",
      "labelAr": "مباركة حانية أزلية",
      "prompt": "A voice overflowing with divine love and soft light. Use a very gentle, melodic cadence that feels like a warm embrace from an ancient protector. Breathtakingly kind and peaceful."
    },
    {
      "id": "wrath_of_light",
      "labelAr": "غضب النور الماحق",
      "prompt": "A sudden, massive increase in volume and resonance. Sound like a storm of pure light—commanding, terrifyingly powerful, and unstoppable. Every word should shake the earth with divine authority."
    },
    {
      "id": "ghostly_echo",
      "labelAr": "صدى طيفي حزين",
      "prompt": "Speak with a hollowing, distant quality as if your voice is being stretched between worlds. High-pitched breathiness mixed with a deep, fading bass. Mysterious, mournful, and ancient."
    },
    {
      "id": "unshakeable_promise",
      "labelAr": "وعد الصدق الراسخ",
      "prompt": "Deliver a firm, heavy-set assurance. No tremble, no doubt. Sound as solid as a mountain, conveying a commitment that will survive the death of stars. Resonant and absolute."
    }
  ],
  "signatureSfxIds": [
    "zel-1",
    "ma-1",
    "ui-2"
  ],
  "icon": Wand2,
  "color": "from-blue-600 to-indigo-700",
  "pitch": 1.2,
  "speed": 1.1
};
