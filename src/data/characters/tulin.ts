import { CharacterVoice } from "../../types/voices";
import { Wind } from "lucide-react";

export const tulinVoice: CharacterVoice = {
  "id": "tulin",
  "geminiVoiceId": "Puck",
  "gender": "male",
  "alignment": "heroic",
  "temperament": "eccentric",
  "intellect": "average",
  "name": "Tulin",
  "nameAr": "تولين (محارب الرياح)",
  "archetypeAr": "صياد ريتو الصغير",
  "description": "Youthful, determined, and energetic. A high-pitched, brave boy who wants to prove himself.",
  "descriptionAr": "صوت فتى يافع ومندفع يملؤه حماس الشباب والرغبة في إثبات ذاته. نبرة قوية وسريعة تجسد عنفوان الرياح.",
  "traitsAr": [
    "يافع",
    "مندفع",
    "شجاع"
  ],
  "tipsAr": "استخدم نبرة فتى صغير متحمس للغاية. اجعل صوتك سريعاً وواثقاً، وتحدث كما لو كنت تحلق في السماء.",
  "guidance": "Speak with youthful bravado and high-energy enthusiasm, like a young warrior eager to fly into battle.",
  "tonesAr": [
    {
      "id": "youthful_bravado",
      "labelAr": "شجاعة الشباب",
      "prompt": "High-pitched, energetic, and slightly breathless. Speak with the overconfidence and bravery of a young boy trying to act like a seasoned warrior."
    },
    {
      "id": "wind_caller",
      "labelAr": "نداء الرياح",
      "prompt": "Loud, clear, and soaring. Shouting excitedly over the sound of rushing wind. Enthusiastic and deeply loyal."
    }
  ],
  "signatureSfxIds": [
    "sw-1",
    "ui-2"
  ],
  "icon": Wind,
  "color": "from-sky-400 to-cyan-600"
};
