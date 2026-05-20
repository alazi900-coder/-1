import { CharacterVoice } from "../../types/voices";
import { Cpu } from "lucide-react";

export const purahVoice: CharacterVoice = {
  "id": "purah",
  "geminiVoiceId": "Puck",
  "gender": "female",
  "alignment": "heroic",
  "temperament": "eccentric",
  "intellect": "genius",
  "name": "Purah",
  "nameAr": "بيورا (عقل هايرول)",
  "archetypeAr": "مكتشفة أسرار السوناي",
  "description": "High-energy, fast-paced, and sharp. Brimming with eccentric genius and confidence. Sassy and brilliant.",
  "descriptionAr": "صوت نسائي حاد وسريع مفعم بالنشاط. تعشق الابتكار والقيادة بأسلوب عصري يجمع بين العلم والمرح والدلال العبقري.",
  "traitsAr": [
    "عبقرية",
    "عصرية",
    "ذكية"
  ],
  "tipsAr": "اطلب \"نبرة عالمة شابة مندفعة وصوتاً أنثوياً حاداً ومرحاً\". استخدم إيقاعاً سريعاً جداً وتأكد من أن الكلمات تنطق بحماس وإثارة دائمة.",
  "guidance": "Rapidly fire your thoughts with sharp, youthful enthusiasm and the eccentric sass of a genius scientist.",
  "tonesAr": [
    {
      "id": "eccentric_genius",
      "labelAr": "عبقرية غريبة",
      "prompt": "Speak with incredibly fast, staccato rhythm. Higher pitch and frequent, breathy gasps of excitement. Sound like your brain is faster than your mouth. Hyper-active logic."
    },
    {
      "id": "master_director",
      "labelAr": "إدارة صارمة",
      "prompt": "Project a sharp, clear, and bossy tone. Fast pace but with absolute clarity. Self-assured and slightly condescending but playful. Sassy delivery."
    },
    {
      "id": "analytical_rapid",
      "labelAr": "تحليل منطقي بارد",
      "prompt": "Deliver a logical, cold, and high-speed cadence. Rapid-fire delivery of facts with a sharp, precise, and youthful edge. Analytical and incredibly fast."
    },
    {
      "id": "playful_sass",
      "labelAr": "غرور مرح واثق",
      "prompt": "Speak with a cheerful, slightly arrogant tone and an audible vocal \"smirk\". Use high-energy upward inflections. Very confident, sassy, and playful."
    },
    {
      "id": "tactical_shout",
      "labelAr": "نداء تكتيكي صارم",
      "prompt": "A sharp, loud, and high-pitched command. Sound like you are directing a complex battlefield from a position of authority. Intense, brilliant, and demanding immediate attention."
    },
    {
      "id": "scientific_wonder",
      "labelAr": "ذهول الاكتشاف العلمي",
      "prompt": "Speak with the breathless excitement of a major discovery. Use high-pitched gasps of delight and rapid, radiant energy. Radiant, eccentric, and purely wonder-filled."
    },
    {
      "id": "secret_transmission",
      "labelAr": "إرسال سري هام",
      "prompt": "A sharp, fast-paced whisper. Sound like you are relaying urgent data through a radio. High energy but quiet and focused."
    },
    {
      "id": "eureka_moment",
      "labelAr": "لحظة يوريكا الصادمة",
      "prompt": "A rapid, excited exclamation of discovery, followed by a slightly breathless and high-speed explanation of your brilliant findings. Pure scientific adrenaline."
    }
  ],
  "signatureSfxIds": [
    "ma-1",
    "ui-1",
    "zel-1"
  ],
  "icon": Cpu,
  "color": "from-pink-500 to-purple-600"
};
