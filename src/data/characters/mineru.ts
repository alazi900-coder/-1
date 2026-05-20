import { CharacterVoice } from "../../types/voices";
import { Wand2 } from "lucide-react";

export const mineruVoice: CharacterVoice = {
  "id": "mineru",
  "geminiVoiceId": "Kore",
  "gender": "female",
  "alignment": "heroic",
  "temperament": "calm",
  "intellect": "genius",
  "name": "Mineru",
  "nameAr": "مينيرو (حكيمة الروح)",
  "archetypeAr": "المستشارة العلمية القديمة",
  "description": "Elegant, calm, and highly intelligent. A gentle, maternal spirit with ancient technical clarity.",
  "descriptionAr": "صوت نسائي وقور يتسم بالسكينة والذكاء الحاد. نبرة روحانية رقيقة تحمل خبرة علوم السوناي القديمة.",
  "traitsAr": [
    "حكيمة",
    "روحانية",
    "تقنية"
  ],
  "tipsAr": "استخدم نبرة \"هدوء العلماء\". تحدث بوضوح شديد ورزانة، مع صدى خفيف يوحي بان الصوت ينبع من داخل آلة أو روح.",
  "guidance": "Project a calm, maternal clarity that echoes with the ancient technical wisdom of the Zonai soul.",
  "tonesAr": [
    {
      "id": "ancient_scholar",
      "labelAr": "حكمة الأرواح",
      "prompt": "Speak with a very calm, measured, and breathy resonance. Use a slight spectral echo. Sound like an ancient teacher sharing sacred secrets."
    },
    {
      "id": "maternal_spirit",
      "labelAr": "حنان حكيمة",
      "prompt": "Soften the delivery. A gentle, nurturing, and steady voice. Very low and peaceful, radiating protective love and age."
    },
    {
      "id": "technical_clarity",
      "labelAr": "وضوح السوناي",
      "prompt": "A clear, neutral, and highly articulate tone. Speak with the objective precision of an advanced scientist from a forgotten civilization."
    },
    {
      "id": "heavy_regret",
      "labelAr": "ندم خالد",
      "prompt": "Slower tempo with pauses. The voice should sound fragile and light, as if carrying the weight of a multi-generational burden."
    },
    {
      "id": "spiritual_resolve",
      "labelAr": "ثبات الروح",
      "prompt": "Steady and immovable resonance. A calm but powerful declaration of duty, perfectly controlled and ancient."
    },
    {
      "id": "ethereal_guidance",
      "labelAr": "إرشاد الأرواح النوراني",
      "prompt": "Speak with a very light, airy, and shimmering resonance. The voice should feel like it is floating in the air. Deeply peaceful and divine."
    },
    {
      "id": "scientific_nostalgia",
      "labelAr": "حنين العلم المنسي",
      "prompt": "Calm, measured, but with a slight melodic sadness. Reflecting on the glory of the Zonai era with intellectual pride and deep longing."
    }
  ],
  "signatureSfxIds": [
    "ma-2",
    "ma-1",
    "ms-1"
  ],
  "icon": Wand2,
  "color": "from-teal-600 to-blue-900"
};
