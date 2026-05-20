import { CharacterVoice } from "../../types/voices";
import { Zap } from "lucide-react";

export const rijuVoice: CharacterVoice = {
  "id": "riju",
  "geminiVoiceId": "Kore",
  "gender": "female",
  "alignment": "heroic",
  "temperament": "calm",
  "intellect": "genius",
  "name": "Riju",
  "nameAr": "ريجو (حاكمة الجيرودو)",
  "archetypeAr": "الملكة الصاعقة",
  "description": "Youthful, authoritative, and regal. A voice that commands lightning and leads her people with wisdom.",
  "descriptionAr": "صوت أنثوي يافع ولكنه وقور وحازم. يجمع بين كرامة الملوك وقوة الصاعقة، مع مسحة من الرزانة الصحراوية.",
  "traitsAr": [
    "حازمة",
    "ملكية",
    "صاعقة"
  ],
  "tipsAr": "اطلب نبرة \"قيادية صحراوية حادة\". تحدث برزانة الملوك وتأكد من وضوح المخارج بقوة الحزم وتأثير البرق.",
  "guidance": "Lead with a youthful but sharp desert authority that commands the very lightning of the Gerudo.",
  "tonesAr": [
    {
      "id": "lightning_command",
      "labelAr": "نداء الحسم الكهربائي",
      "prompt": "Sharp, fast-paced, and incredibly authoritative. Sound like you are directing a lightning strike on the battlefield. Powerful and clear."
    },
    {
      "id": "desert_wisdom",
      "labelAr": "حكمة الرمال",
      "prompt": "Calm, deep, and steady. Speak with the weight of responsibility for an entire nation. Low energy but high authority."
    },
    {
      "id": "ancestral_vibration",
      "labelAr": "صدى المحاربات القدامى",
      "prompt": "Speak with a deep, authoritative resonance that vibrates with the power of lightning and desert ancestors. Sound ancient and commanding."
    }
  ],
  "signatureSfxIds": [
    "ms-2",
    "ui-2"
  ],
  "icon": Zap,
  "color": "from-yellow-500 to-amber-700"
};
