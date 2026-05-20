import { CharacterVoice } from "../../types/voices";
import { Sparkles } from "lucide-react";

export const soniaVoice: CharacterVoice = {
  "id": "sonia",
  "geminiVoiceId": "Kore",
  "gender": "female",
  "alignment": "heroic",
  "temperament": "calm",
  "intellect": "genius",
  "name": "Queen Sonia",
  "nameAr": "الأميرة سونيا (ملكة هايرول الأولى)",
  "archetypeAr": "حاكمة النور والزمان وقورية",
  "description": "Ethereal, wise, and profoundly peaceful. A melodic, shimmering voice representing the source of Zelda's divine power.",
  "descriptionAr": "صوت نسائي نوراني وقور، يتسم بالهدوء العميق واللحن الشجي. يمثل الحكمة الأزلية وقوة الزمان والنور في مهدها الأول.",
  "traitsAr": [
    "نورانية",
    "وقورة",
    "حكيمة"
  ],
  "tipsAr": "اطلب \"نبرة أنثوية ملكية سماوية وهادئة جداً\". تحدث برزانة مفرطة واستخدم صدى شفيفاً يوحي بالقدسية والارتباط بالزمان.",
  "guidance": "Radiate a shimmering, ethereal peace that flows like the river of time itself.",
  "tonesAr": [
    {
      "id": "ethereal_guidance",
      "labelAr": "إرشاد الشيوخ الأثيري",
      "prompt": "Speak with a very light, airy, and shimmering resonance. The voice should feel like it is floating in the air—deeply peaceful, divine, and helpful."
    },
    {
      "id": "regal_calm",
      "labelAr": "سكينة الملوك",
      "prompt": "Maintain an unshakable, graceful peace. The voice should be soft but perfectly clear, radiating inner strength and royal dignity even in the face of chaos."
    },
    {
      "id": "visionary_echo",
      "labelAr": "صدى الرؤى البعيدة",
      "prompt": "Speak with a distant, shimmering quality. Use soft, breathy pauses and a slight melodic waver, as if relaying a vision seen across the rivers of time."
    }
  ],
  "signatureSfxIds": [
    "zel-1",
    "ma-2",
    "ui-1"
  ],
  "icon": Sparkles,
  "color": "from-yellow-300 to-amber-500"
};
