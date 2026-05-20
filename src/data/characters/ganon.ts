import { CharacterVoice } from "../../types/voices";
import { Ghost } from "lucide-react";

export const ganonVoice: CharacterVoice = {
  "id": "ganon",
  "geminiVoiceId": "Charon",
  "gender": "male",
  "alignment": "villainous",
  "temperament": "arrogant",
  "intellect": "genius",
  "name": "Ganondorf",
  "nameAr": "غانوندورف (الملك المحنط)",
  "archetypeAr": "تجسيد الحقد الأزلي",
  "description": "Dry, raspy, and ancient. Sounds like stone grinding on bone. Malevolent and mummified. Subterranean growls.",
  "descriptionAr": "صوت متهالك جاف كرمال قرون من القحط. نبرة مبحوحة تخرج من جسد محنط، مشحونة بحقد أزلي وفحيح قاتل ورنين مظلم هز الأرض.",
  "traitsAr": [
    "موت حي",
    "مبحوح",
    "حقود"
  ],
  "tipsAr": "أكثر من \"الفحيح\" في الحروف الساكنة. اطلب صوتاً متهالكاً جداً وكأن الحبال الصوتية متآكلة من الجفاف والظلام. استهدف طبقة صوتية منخفضة للغاية وجافة.",
  "guidance": "Grasp for power with a dry, guttural rasp that sounds like shifting desert sands and ancient malice.",
  "tonesAr": [
    {
      "id": "mummified_wheeze",
      "labelAr": "فحيح المومياء (جاف جداً)",
      "prompt": "Speak with an agonizingly dry, scratchy, and breathy wheeze. Sound like dust and ancient bone grinding together with a faint, brittle crackle."
    },
    {
      "id": "kingly_threat",
      "labelAr": "تهديد ملوكي (زمجرة عميقة)",
      "prompt": "Deliver a deep, guttural growl with a subterranean resonance. Every word should vibrate with immense power and ancient malice."
    },
    {
      "id": "manic_mockery",
      "labelAr": "سخرية هوسية",
      "prompt": "A hollow, rasping laugh that transitions into a sharp, high-pitched sneer. Sound completely condescending and cruel, with an audible vocal smirk. Add a dry, brittle quality to the laughter."
    },
    {
      "id": "dark_incantation",
      "labelAr": "ترتيل الظلام",
      "prompt": "Low-pitched, rhythmic, and buzzing with evil energy. Sound like you are chanting an ancient curse with a heavy, vibrating rasp. Deep resonance."
    },
    {
      "id": "ancient_hunger",
      "labelAr": "جوع القوة الأرعن",
      "prompt": "Fast and aggressive rasping. Sound desperate and ravenous for power, like a beast trapped in a human shell. Guttural and intense."
    },
    {
      "id": "envious_hiss",
      "labelAr": "فحيح الحسد المسموم",
      "prompt": "A low, extremely sibilant hiss conveying deep jealousy and resentment. Pronounce \"s\" sounds with a razor-sharp, pronounced emphasis and a faint, dry rasp, as if the envy itself is decaying you from within. Sound like a poisonous snake's whisper—quiet, sharp, and dripping with ancient bitterness."
    },
    {
      "id": "whispering_dread",
      "labelAr": "همس الرهبة المرعب",
      "prompt": "A low, guttural whisper that evokes a sense of deep-seated fear and impending doom. Sound ancient and menacing, with a dry, rasping quality that chills the listener. Speak with a subterranean, breathy authority that feels like a shadow creeping over the soul."
    },
    {
      "id": "mocking_victory",
      "labelAr": "سخرية الانتصار المظلم",
      "prompt": "Deliver a deep, vibrating laugh embedded within the words. Sound immensely powerful and completely superior. A low-pitched, condescending tone of triumph."
    },
    {
      "id": "cold_calculation",
      "labelAr": "تخطيط بارد وقاتل",
      "prompt": "Lower the volume to a sharp, precise whisper. Sound incredibly intelligent and devoid of all mercy. Every word is a calculated strike. Low pitch, sharp articulation."
    },
    {
      "id": "unleashed_malice",
      "labelAr": "انفجار الحقد الأزلي",
      "prompt": "An echoing, guttural shout of absolute hatred. Every syllable should vibrate with dark magic and ancient rage. Extremely loud and terrifying resonance."
    },
    {
      "id": "veiled_malice",
      "labelAr": "مكر خفي مرعب",
      "prompt": "Speak with a low, subtly menacing whisper, conveying hidden rage and manipulative intent. Sound unnervingly calm on the surface but hint at immense darkness underneath, with a very slight, dry rasp. Controlled, calculated, and dangerous."
    },
    {
      "id": "dark_prophecy",
      "labelAr": "نبوءة الظلام الملعونة",
      "prompt": "A low-pitched, rhythmic, and buzzing chant filled with evil energy, like an ancient curse being chanted with a heavy, vibrating rasp and deep resonance. Every word should sound like a decree of inevitable doom."
    }
  ],
  "signatureSfxIds": [
    "ms-2",
    "sw-2",
    "ma-1"
  ],
  "icon": Ghost,
  "color": "from-orange-950 to-red-900"
};
