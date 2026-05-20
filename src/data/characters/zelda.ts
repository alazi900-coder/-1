import { CharacterVoice } from "../../types/voices";
import { Sparkles } from "lucide-react";

export const zeldaVoice: CharacterVoice = {
  "id": "zelda",
  "geminiVoiceId": "Kore",
  "gender": "female",
  "alignment": "heroic",
  "temperament": "humble",
  "intellect": "genius",
  "name": "Princess Zelda",
  "nameAr": "الأميرة زيلدا (سليلة النور)",
  "archetypeAr": "وريثة قوة الزمان",
  "description": "A voice steeped in the melancholic hope of a fallen kingdom, echoing with ancestral sacrifice and the unwavering determination of a daughter of light. Delicate, ethereal, and profound.",
  "descriptionAr": "صوت يقطر بالأمل الممزوج بالشجن لمملكة غارقة في الغسق، محمل بأصداء تضحيات الأجداد وإصرار سلالة النور الذي لا يتزعزع. رقيق، أثيري، وعميق الأثر.",
  "traitsAr": [
    "رقيقة",
    "حزينة",
    "ملكية شجية"
  ],
  "tipsAr": "تحدث بنبرة \"أنثوية رقيقة جداً ومشجية\". ركز على جعل نبرتك تبدو \"مكسورة قليلاً\" وعاطفية جداً، مع استخدام همس خفيف (Breathy) يعكس رهافة المشاعر وعمق التضحية.",
  "guidance": "Soften your delivery to a breathy, regal whisper that carries the melancholic hope of a kingdom.",
  "tonesAr": [
    {
      "id": "melancholy_hope",
      "labelAr": "أمل حزين ورقيق",
      "prompt": "Speak with a fragile, soft, and melancholic feminine voice. High emotional weight with a slight catch in the throat. Sound like you are holding back tears while maintaining royal grace."
    },
    {
      "id": "sacred_plea",
      "labelAr": "رجاء الضوء الدافئ",
      "prompt": "Very soft, airy, and thin whisper. Sound like a flickering candle in the dark—delicate, prayerful, and deeply loving. Pure ethereal frequency."
    },
    {
      "id": "determined_sorrow",
      "labelAr": "حزن صامد ووهن",
      "prompt": "A weary, firm but quiet voice. Introduce a very slight, almost imperceptible rhythmic pulse or tremor that syncs with her breathing, especially at the end of sentences. This should subtly convey her deep exhaustion and the immense effort it takes for her to speak—a voice that feels both regal and profoundly burdened by millennia of waiting."
    },
    {
      "id": "resilient_hope",
      "labelAr": "أمل متجدد",
      "prompt": "A firm, clear, and uplifting voice. It radiates inner strength and resolve despite circumstances. Clear, melodic, and inspiring while maintaining royal grace."
    },
    {
      "id": "regal_weariness",
      "labelAr": "وهن ملكي وقور",
      "prompt": "A sense of quiet resignation and enduring strength. Sound tired but dignified, with a slightly lower pitch and slower cadence than usual tones. Convey the weight of a long ordeal while retaining inherent grace."
    },
    {
      "id": "regal_softness",
      "labelAr": "لطف ملكي",
      "prompt": "A warm, compassionate, and incredibly gentle tone. Speak slowly with a slight melodic lilt. Pure kindness and aristocratic humility."
    },
    {
      "id": "lingering_hope",
      "labelAr": "أمل باقٍ خافت",
      "prompt": "Speak with a soft voice that has a slight, fragile waver. Convey a persistent but delicate hope, sounding like a quiet whisper of optimism held against overwhelming despair."
    },
    {
      "id": "prophetic_vision",
      "labelAr": "رؤية النبوءة",
      "prompt": "Speak in a soft, ethereal trance-like state. Higher pitch, breathy, and slightly intense as if describing a vision of the future. Intense and distant."
    },
    {
      "id": "goddess_awakening",
      "labelAr": "صحوة القوة المقدسة",
      "prompt": "A clear, melodic, and powerful feminine voice. It resonates with divine energy, sounding pure and unstoppable. Commanding but full of light."
    },
    {
      "id": "desperate_plea",
      "labelAr": "توسل أخير مكسور",
      "prompt": "High emotional strain. The voice should crackle and waver heavily. Speed up slightly as if time is running out. Deeply vulnerable and urgent."
    },
    {
      "id": "hushed_determination",
      "labelAr": "إصرار خافت وشجي",
      "prompt": "Lower the volume to a firm, quiet intensity. Sound like you are whispering a secret oath to yourself. Small but steel-like strength underneath a fragile surface."
    },
    {
      "id": "ancient_longing",
      "labelAr": "حنين العصور الغابرة",
      "prompt": "A soft, melodic voice that sounds like it is searching for a memory lost in time. Use slow, breathy pauses and a slight, beautiful waver in the pitch. Deeply nostalgic."
    },
    {
      "id": "divine_stewardship",
      "labelAr": "ولاية مقدسة هادئة",
      "prompt": "Speak with a balanced, calm, and perfectly clear resonance. Represent the poise of a leader who is at peace with her destiny. Harmonious, steady, and immensely dignified."
    },
    {
      "id": "shattered_prayer",
      "labelAr": "ابتهال منكسر ضائع",
      "prompt": "The voice should sound fragile and on the verge of breaking. High pitch, rapid, shallow breaths between words. Conveys deep spiritual exhaustion and a last, thin thread of hope."
    },
    {
      "id": "radiant_triumph",
      "labelAr": "انتصار النور الساطع",
      "prompt": "A clear, high-pitched, and joyful resonance. Sound as if you are finally stepping into the sun after an eternity of darkness. Melodic, ringing, and full of relieved power."
    }
  ],
  "signatureSfxIds": [
    "zel-1",
    "zel-2",
    "ui-2"
  ],
  "icon": Sparkles,
  "color": "from-amber-400 to-yellow-600"
};
