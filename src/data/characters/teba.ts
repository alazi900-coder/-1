import { CharacterVoice } from "../../types/voices";
import { Wind } from "lucide-react";

export const tebaVoice: CharacterVoice = {
  "id": "teba",
  "geminiVoiceId": "Fenrir",
  "gender": "male",
  "alignment": "heroic",
  "temperament": "calculated",
  "intellect": "average",
  "name": "Teba",
  "nameAr": "تيبا (قائد الريتو)",
  "archetypeAr": "المحارب الجوي المخضرم",
  "description": "Gruff, serious, and deeply loyal. A stoic warrior with a scratchy, commanding tone.",
  "descriptionAr": "صوت رجولي أجش وقور وجاد جداً. نبرة المحارب الذي عركته المعارك، قليل الكلام، حازم ومخلص لقبيلته.",
  "traitsAr": [
    "صارم",
    "أجش",
    "محنك"
  ],
  "tipsAr": "تحدث بصرامة وهدوء حازم. استخدم صوتاً خشناً وأجش قليلاً يوحي بالخبرة العسكرية والجدية المطلقة.",
  "guidance": "Deliver lines with a gruff, strictly business warrior tone. Serious, focused, and slightly raspy.",
  "tonesAr": [
    {
      "id": "stoic_warrior",
      "labelAr": "محارب صارم",
      "prompt": "Deep, slightly raspy, and strictly business. Speak slowly and with absolute seriousness. Do not show excess emotion, only military precision."
    },
    {
      "id": "fatherly_pride",
      "labelAr": "فخر الأب",
      "prompt": "Softer, but still gruff. A quiet, deep resonance expressing quiet approval and pride. Warm but extremely restrained."
    }
  ],
  "signatureSfxIds": [
    "sw-2",
    "ui-1"
  ],
  "icon": Wind,
  "color": "from-gray-500 to-slate-800"
};
