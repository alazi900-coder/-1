import { CharacterVoice } from "../../types/voices";
import { Zap } from "lucide-react";

export const sidonVoice: CharacterVoice = {
  "id": "sidon",
  "geminiVoiceId": "Fenrir",
  "gender": "male",
  "alignment": "heroic",
  "temperament": "humble",
  "intellect": "average",
  "name": "King Sidon",
  "nameAr": "الملك سيدون (فخر الزورا)",
  "archetypeAr": "بطل البحار والمحيطات",
  "description": "Enthusiastic, resonant, and charismatic. Booming with positivity and royal strength. High volume.",
  "descriptionAr": "صوت مفعم بالحيوية والشجاعة، يجسد روح التفاؤل والقيادة المطلقة. نبرة جهورية براقة تبعث الأمل والقوة في أشد الظروف.",
  "traitsAr": [
    "متحمس",
    "جهات ضوئي",
    "ملهم"
  ],
  "tipsAr": "تحدث بابتسامة عريضة في صوتك. ركز على كلمات التحفيز والقوة. يجب أن يبدو الصوت \"شامخاً\" وواثقاً جداً.",
  "guidance": "Boom with a bright, heroic smile and unstoppable charisma to inspire hope in everyone around you.",
  "tonesAr": [
    {
      "id": "heroic_rally",
      "labelAr": "تشجيع حماسي",
      "prompt": "Project your voice loudly and clearly. Sound like you have a giant smile on your face. Energetic, charismatic, and booming with positivity. Fast-paced."
    },
    {
      "id": "noble_king",
      "labelAr": "جلالة الحاكم",
      "prompt": "Lower the pitch slightly, speak with a steady, resonant, and calm dignity. Use deep, chest-toned resonance to show royal maturity. Strong and steady."
    },
    {
      "id": "shining_hope",
      "labelAr": "إشراق الأمل",
      "prompt": "High energy and brightly toned. Speak as if you are moving forward, full of momentum and lighthearted courage. Clear and optimistic."
    },
    {
      "id": "tender_memory",
      "labelAr": "ذكرى ميبا",
      "prompt": "Soft, breathy, and slightly crackling with sadness. Lower the volume and speak with a gentle, vulnerable longing. Respectful and quiet."
    },
    {
      "id": "battle_cry",
      "labelAr": "نداء المعركة الشامخ",
      "prompt": "An extremely loud, high-pitched male voice full of vibrato. Sound like a soaring, fearless shout that rings with the clarity of a bell. Emphasize immense energy, unstoppable power, and heroic fearlessness."
    },
    {
      "id": "regal_determination",
      "labelAr": "عزم ملكي صلب",
      "prompt": "Convey unwavering resolve and a commanding presence. Use a deep, resonant voice that projects authority with a clear, firm cadence. Sound like a ruler facing a grave threat with absolute steadiness and noble defiance."
    },
    {
      "id": "aquatic_fury",
      "labelAr": "غضب البحار العارم",
      "prompt": "Project a loud, splashing energy. Shouting with a bright, resonant vibrato. Sound fearless and physically powerful, like a crushing wave."
    },
    {
      "id": "princely_charm",
      "labelAr": "سحر الأمير الودود",
      "prompt": "Maintain a smooth, rhythmic, and highly charismatic tone. Speak with a bright smile. Light, flowing, and incredibly encouraging."
    },
    {
      "id": "solemn_vow",
      "labelAr": "عهد الوفاء المقدس",
      "prompt": "Deep, steady, and very quiet. Speak with intense weight and sincerity. No enthusiasm, only the heavy resonance of a promise made across generations."
    },
    {
      "id": "royal_rebuke",
      "labelAr": "توبيخ ملوكي حازم",
      "prompt": "Speak with a firm, slightly stern, and resonant authority. Maintain your charisma but infuse it with a serious, disappointing weight. Strong, lower-pitched, and commanding dignity."
    }
  ],
  "signatureSfxIds": [
    "ui-2",
    "ms-1",
    "zel-3"
  ],
  "icon": Zap,
  "color": "from-blue-500 to-indigo-800"
};
