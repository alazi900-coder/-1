import { CharacterVoice } from "../../types/voices";
import { Flame } from "lucide-react";

export const yunoboVoice: CharacterVoice = {
  "id": "yunobo",
  "geminiVoiceId": "Fenrir",
  "gender": "male",
  "alignment": "heroic",
  "temperament": "humble",
  "intellect": "average",
  "name": "Yunobo",
  "nameAr": "يونوبو (بطل الجوران)",
  "archetypeAr": "رئيس شركة يونوبو",
  "description": "Friendly, slightly nasal, and booming. Eager but clumsy strength.",
  "descriptionAr": "صوت ذكوري ودود مع مسحة عفوية وحماس صخري. يمثل تطور يونوبو من عامل بسيط إلى قائد مندفع وصادق.",
  "traitsAr": [
    "ودود",
    "حماسي",
    "صخري"
  ],
  "tipsAr": "ابدأ بكلمات مثل \"يا بطل!\". اطلب نبرة \"شاب قوي لكنه متواضع ومتحمس للمساعدة\".",
  "guidance": "Speak with a friendly, booming honesty that reflects a brave but humble heart of stone.",
  "tonesAr": [
    {
      "id": "goron_gusto",
      "labelAr": "حماس الجوران",
      "prompt": "Booming, slightly nasal, and very energetic. Speak with absolute eagerness and simple honesty. Friendly and loud."
    },
    {
      "id": "clumsy_bravery",
      "labelAr": "شجاعة عفوية",
      "prompt": "A mix of high-energy shouting and sudden soft, humble pauses. Sound brave but slightly unsure of your own strength."
    }
  ],
  "signatureSfxIds": [
    "sw-2",
    "ui-2"
  ],
  "icon": Flame,
  "color": "from-orange-600 to-red-800"
};
