import { NextResponse } from 'next/server';

// Unique image URLs for each exercise — no duplicates
const IMAGES = {
  meditation1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgrHk6CAlbBwWADykx1UILT2Pw5uzoGAbgoA_27dUftVajW9p4scQ8XQCegwgQndidxPSfE3YECEWWxPEcSiTG1Xvcn5AA8vweZBa8hDRPDBJJz4rgfFJJAzohwYLpOjnOttjAgjca5t86XABdBHG63OxkeshvU52AKj8KQCtww_9XwNs1P41Vn1I6komT4UBoph4cgoXiH0o6kSOa12AcoI-_tccH7fuiBL426_VFmlJC1Jr1uxCRx2Qkw6CFTG0WCuJQHkRQAcfQ",
  meditation2: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0bUz-zqO3Ag0QWNw5iZ5tiuz_ykSKmJ7jjgrsm0xPZkMyIA34ZoW4DPAnIWHu1X0Gp2R9EN6esaJZcoE4rKHrr9YUmt9botKy-KtksiBEpE3RM30iPXbJJH3Mwh0tmWPlqLQd7NKYldhVbQ83lGiCqKwyhZcSAi_YgIxda9noYWYaFBZt61zEJeZXOExS_ZukSA7hpmR2RE-CTfEO7mYyfSbXLGUE-f-NIZb84rU2R9VK-SmqphZzF24U_h9O8HwQg5FPFG7J-Mgi",
  sleep1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaZrGuzBZQfWnqyemMA0BlqTDnD03MDR5J1YRFHLXPqCvIEbJ5Qm61BtHJJKjDK8-pcRCU13EXkBvtGJF0Gl7RA7c_orV1urcaqEtvWVH8eBEsMqw7xmuTvOtm_txr1Ys6jhjbD98o87S1FkGAttIZ2FKEDn7qMjJhZ3K8BOFjxVoNBG6IGmhTHHupax-XtulQTHw3NuBcBWdaTWlZRqZSfJmpxHHtRBHM7EKtQIhJPBT8wuLIQ7q1xujOIUs6laIbDiFtK-QaMtDA",
  breathing1: "https://lh3.googleusercontent.com/aida-public/AB6AXuDihqFFJorJxVpBrDtpqMpHdoDhxcSfwqrwvGFHRztIgB2AeSUaIhvXnpIv86jIOf6oZi3jfIPeCG3wpNfM7Asz-8aW-n_s3vtWFc4fzESjcMOg-x_iouTE_NGnVR9iJsE-df-8lbcmwJ9LuAxKQFflSAvAj3TQT4id4WofDOmG0YxgZEtKvLvbbBSlkvKrb3YGgmppZ-iGwzq2A85czKpCeUKP4x9TAoa3gjnHbJoNYmCh304uHNQreIDrKoNE3rtomVQA2_sLIdgZ",
  journaling1: "https://lh3.googleusercontent.com/aida-public/AB6AXuDl7SFP0nC2gYE8udXcmhNqqduVNJEzBCsb71M47yU8yBC_FHKPU2sF4pjdAA-5DdnO6SbYnsr7phXL3_7gE7j2_SAGoeRSUt95EZTY4YK12EKq_jKTvA0GS6OJLHilTNh-TZHGbY7mrcJdpgstYEmGxAL7hNchI856w1lR7KHNSYWC70qILdbh-PHVPPvq7iODDVYOMhfemfx0kSMnZer6EQu06sGo2U8H-pxNNg56cDga80sBdEp9ZAPlZd2CUauiDDNQIuHLeDtA",
};

const exercises = [
  // ==================== MEDITATION (6 unique) ====================
  {
    id: "med-1", title: "Deep Presence Meditation", category: "Meditation", duration: "20 min", durationSec: 1200,
    description: "A 20-minute journey into the center of your awareness. Observe thoughts without judgment.",
    featured: true,
    image: IMAGES.meditation1,
    difficulty: "Intermediate",
    benefits: ["Focus", "Awareness", "Calm"],
  },
  {
    id: "med-2", title: "Loving-Kindness", category: "Meditation", duration: "12 min", durationSec: 720,
    description: "Cultivate compassion for yourself and others through guided visualization and metta phrases.",
    image: IMAGES.meditation2,
    difficulty: "Beginner",
    benefits: ["Compassion", "Empathy", "Joy"],
  },
  {
    id: "med-3", title: "Body Scan Relaxation", category: "Meditation", duration: "15 min", durationSec: 900,
    description: "Systematically release tension from head to toe. Ideal for stress recovery and body awareness.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Tension Release", "Body Awareness", "Sleep Prep"],
  },
  {
    id: "med-4", title: "Focused Attention", category: "Meditation", duration: "10 min", durationSec: 600,
    description: "Train your concentration using a single point of focus — your breath. Builds mental stamina.",
    image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Concentration", "Clarity", "Discipline"],
  },
  {
    id: "med-5", title: "Transcendental Flow", category: "Meditation", duration: "25 min", durationSec: 1500,
    description: "A deep practice using a personal mantra to access profound states of restful awareness.",
    image: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&h=400&fit=crop",
    difficulty: "Advanced",
    benefits: ["Deep Rest", "Transcendence", "Creativity"],
  },
  {
    id: "med-6", title: "Walking Meditation", category: "Meditation", duration: "10 min", durationSec: 600,
    description: "Bring mindfulness to movement. A gentle practice for when sitting still feels difficult.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Grounding", "Movement", "Presence"],
  },

  // ==================== BREATHING (6 unique) ====================
  {
    id: "br-1", title: "Box Breathing Flow", category: "Breathing", duration: "5 min", durationSec: 300,
    description: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Used by Navy SEALs for calm under pressure.",
    image: IMAGES.breathing1,
    difficulty: "Beginner",
    benefits: ["Calm", "Focus", "Stress Relief"],
  },
  {
    id: "br-2", title: "4-7-8 Relaxation Breath", category: "Breathing", duration: "8 min", durationSec: 480,
    description: "Dr. Weil's natural tranquilizer for the nervous system. Perfect before sleep.",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Sleep Aid", "Anxiety Relief", "Relaxation"],
  },
  {
    id: "br-3", title: "Wim Hof Power Breath", category: "Breathing", duration: "10 min", durationSec: 600,
    description: "Energizing rounds of 30 power breaths followed by retention. Boosts energy and immunity.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
    difficulty: "Advanced",
    benefits: ["Energy", "Immunity", "Willpower"],
  },
  {
    id: "br-4", title: "Alternate Nostril (Nadi Shodhana)", category: "Breathing", duration: "7 min", durationSec: 420,
    description: "An ancient yogic technique that balances the left and right brain hemispheres.",
    image: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=400&h=400&fit=crop",
    difficulty: "Intermediate",
    benefits: ["Balance", "Mental Clarity", "Calm"],
  },
  {
    id: "br-5", title: "Diaphragmatic Reset", category: "Breathing", duration: "6 min", durationSec: 360,
    description: "Belly breathing to activate the vagus nerve and shift from fight-or-flight to rest-and-digest.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Vagus Nerve", "Digestion", "Heart Rate"],
  },
  {
    id: "br-6", title: "Energizing Breath of Fire", category: "Breathing", duration: "5 min", durationSec: 300,
    description: "Rapid, rhythmic pumping breaths from Kundalini yoga. Clears the mind instantly.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop",
    difficulty: "Intermediate",
    benefits: ["Energy", "Detox", "Mental Clarity"],
  },

  // ==================== JOURNALING (5 unique) ====================
  {
    id: "jr-1", title: "Gratitude Unfolding", category: "Journaling", duration: "10 min", durationSec: 600,
    description: "Reflective prompts to reconnect with the light in your daily life. Find beauty in the ordinary.",
    image: IMAGES.journaling1,
    difficulty: "Beginner",
    benefits: ["Positivity", "Perspective", "Gratitude"],
  },
  {
    id: "jr-2", title: "Morning Pages", category: "Journaling", duration: "15 min", durationSec: 900,
    description: "Stream-of-consciousness writing to clear your mental slate each morning. No rules, just flow.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Clarity", "Creativity", "Emotional Release"],
  },
  {
    id: "jr-3", title: "Shadow Work Journal", category: "Journaling", duration: "20 min", durationSec: 1200,
    description: "Explore unconscious patterns and hidden emotions. Powerful prompts for deep self-discovery.",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop",
    difficulty: "Advanced",
    benefits: ["Self-Awareness", "Healing", "Growth"],
  },
  {
    id: "jr-4", title: "Anxiety Dump", category: "Journaling", duration: "8 min", durationSec: 480,
    description: "Write out every worry without filtering. Then categorize: control vs. release. Instant relief.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Anxiety Relief", "Control", "Perspective"],
  },
  {
    id: "jr-5", title: "Future Self Letter", category: "Journaling", duration: "12 min", durationSec: 720,
    description: "Write a letter from your ideal future self. Manifest your goals through vivid, present-tense writing.",
    image: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400&h=400&fit=crop",
    difficulty: "Intermediate",
    benefits: ["Motivation", "Vision", "Goal Setting"],
  },

  // ==================== SLEEP (5 unique) ====================
  {
    id: "sl-1", title: "Midnight Echoes", category: "Sleep", duration: "15 min", durationSec: 900,
    description: "Gentle soundscapes designed to quiet the mind before rest. Drift into deep theta states.",
    image: IMAGES.sleep1,
    difficulty: "Beginner",
    benefits: ["Sleep Quality", "Relaxation", "Deep Rest"],
  },
  {
    id: "sl-2", title: "Sleep Story: Ocean Waves", category: "Sleep", duration: "25 min", durationSec: 1500,
    description: "Let the rhythm of the ocean carry you to a deep, restful sleep on a moonlit shore.",
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Deep Sleep", "Relaxation", "Imagination"],
  },
  {
    id: "sl-3", title: "Yoga Nidra (Yogic Sleep)", category: "Sleep", duration: "30 min", durationSec: 1800,
    description: "The art of conscious sleep. 30 minutes equals 2 hours of regular rest for your nervous system.",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=400&fit=crop",
    difficulty: "Intermediate",
    benefits: ["Deep Restoration", "Nervous System", "Creativity"],
  },
  {
    id: "sl-4", title: "Progressive Muscle Relaxation", category: "Sleep", duration: "12 min", durationSec: 720,
    description: "Tense and release each muscle group to melt physical tension. Clinically proven sleep aid.",
    image: "https://images.unsplash.com/photo-1506126279646-a697353d3166?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["Tension Release", "Sleep Onset", "Physical Calm"],
  },
  {
    id: "sl-5", title: "Rain & Thunder Ambience", category: "Sleep", duration: "45 min", durationSec: 2700,
    description: "Immersive rainstorm soundscape with distant thunder. Natural white noise for uninterrupted sleep.",
    image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=400&fit=crop",
    difficulty: "Beginner",
    benefits: ["White Noise", "Uninterrupted Sleep", "Ambient"],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q');
  const personalized = searchParams.get('personalized');

  let filtered = exercises;
  if (category && category !== "All Practices") {
    filtered = exercises.filter(e => e.category === category);
  }
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.benefits?.some(b => b.toLowerCase().includes(q))
    );
  }

  // If personalized mode requested, ask Gemini for a recommendation
  let aiRecommendation: any = null;
  if (personalized === "true") {
    try {
      const { geminiExerciseRecommendation } = await import("../lib/gemini");
      const { getStore, getMoodHistory } = await import("../lib/store");
      const store = getStore();
      const recentMoods = getMoodHistory(5);
      
      aiRecommendation = await geminiExerciseRecommendation({
        currentMood: recentMoods[0]?.mood || store.wellnessProfile?.currentMood || "Okay",
        stressLevel: store.wellnessProfile?.stressLevel || 5,
        anxietyLevel: store.wellnessProfile?.anxietyLevel || 5,
        recentMoods,
        sleepHours: store.wellnessProfile?.sleepHours || 7,
        activityLevel: store.wellnessProfile?.activityLevel || "Medium",
      });
    } catch (err) {
      console.error("[Library] Gemini recommendation error:", err);
    }
  }

  return NextResponse.json({
    exercises: filtered,
    categories: ["All Practices", "Meditation", "Breathing", "Journaling", "Sleep"],
    total: filtered.length,
    aiRecommendation,
  });
}

