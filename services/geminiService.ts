import { GoogleGenAI, Type } from "@google/genai";
import { PosterConcept } from "../types";

// Initialize Gemini Client
// const apiKey = process.env.API_KEY || "";
// const ai = new GoogleGenAI({ apiKey: apiKey });

// --- GEOLOGY & PROSPECTING ENGINE ---
// Topik diubah khusus untuk Geologi, Pencarian Emas Alam, dan Identifikasi Batuan
const themes = [
  "Reading the River: Inside Bends & Drop Zones",
  "Bedrock Cracks: The Natural Gold Trap",
  "Quartz Identification: Rusty vs. Bull Quartz",
  "Iron Staining: The Red Flag of Gold",
  "Black Sand: The Heavy Indicator",
  "Pyrite vs. Gold: The Shatter Test",
  "Ancient Channels: High Bench Deposits",
  "Placer vs. Lode: Tracking the Source",
  "Garnets & Gold: The Ruby Companions",
  "Clay Layers: False Bedrock Secrets",
  "Sulfides: The Invisible Gold Host",
  "Gossan Caps: The Rusty Hat of a Gold Vein",
  "Contact Zones: Where Geology Changes",
  "Fault Lines: Nature's Gold Plumbing",
  "Skarn Deposits: Gold in Limestone",
  "Porphyry Systems: Low Grade, Huge Tonnage",
  "Epithermal Veins: Boiling Zone Bonanzas",
  "Greenstone Belts: Ancient Volcanic Gold",
  "Slate Belts: The Nugget Factories",
  "Glacial Gold: Moraines & Flour Gold",
  "Desert Prospecting: Dry Washing Tactics",
  "Beach Placers: Wave Action Gold",
  "Eluvial Deposits: Gold That Hasn't Moved",
  "Residual Deposits: Weathered in Place",
  "Specific Gravity: Why Gold Sinks",
  "The Streak Test: Gold vs. Chalcopyrite",
  "Arsenopyrite: The Garlic-Smelling Indicator",
  "Galena: Silver-Lead & Gold Friends",
  "Magnetite vs. Hematite: Know Your Irons",
  "Serpentine Rock: The Green Host",
  "Calcite vs. Quartz: The Acid Test",
  "Boxwork Texture: Where Sulfides Used to Be",
  "Boiling Zones: Textures of Epithermal Gold",
  "Nugget Patches: Detecting Shallow Ground",
  "Paystreaks: Reading the Path of Least Resistance",
  "Flood Gold: Skim Bars & Moss Mats",
  "Crevicing: Snipping Gold from Cracks",
  "Booming: Ancient Water Methods",
  "Mercury in Gold: The Amalgam Danger",
  "Tellurides: The Silver-Gold Mix",
  "Carlin-Type Gold: Invisible & Disseminated",
  "Orogenic Gold: Mountain Building Riches",
  "VMS Deposits: Volcanic Massive Sulfides",
  "Witwatersrand: The Pebble Conglomerates",
  "Breccia Pipes: Exploded Rock Gold",
  "Shear Zones: Crushed Rock Pathways",
  "Fold Hinges: Structural Traps",
  "Saddle Reefs: Gold at the Top of the Fold",
  "Stockworks: Networks of Tiny Veins",
  "Laterite Gold: Tropical Weathering",

  // --- US SPECIFIC & REGIONAL GEOLOGY EXPANSION (50 TOPICS) ---
  // California Mother Lode & Sierra Nevada
  "Tertiary Gravels: Hunting Ancient River Benches 50ft Up",
  "Hydraulic Pit Rims: Prospecting the 1850s Placer Scars",
  "The Mariposa Slate Belt: Ribbon Quartz & Pocket Gold",
  "Spring Runoff Strategy: How Sierra Floods Reset Riverbeds",
  "Feather & Yuba Rivers: Reading Heavy Cobble Bars",
  "Serpentine Contact Dikes: The California Gold Trap",
  "Glory Holes & Pocket Mining: Tracking Float to the Lode",
  "Gold Bluffs: Ocean Wave Placers of Northern California",

  // Southwest Desert & Metal Detecting
  "Hunting the Caliche Layer: The Cemented False Bedrock",
  "Dry Wash Blowouts: Where Wind & Gravity Trap Nuggets",
  "Ironstone Dikes of Arizona: The Red Flag in the Desert",
  "VLF vs. Pulse Induction: Taming Mineralized Red Soils",
  "Detecting Deep Nugget Traps: Inside Mountain Arroyo Bends",
  "The Bradshaw Mountains: Decomposed Granite & Rough Gold",
  "Desert Pavement: Why Gold Sits on Flat Hardpan",
  "Drywashing Efficiency: Air Flow vs. Recovery Rates",

  // Rocky Mountains & High Altitude
  "Colorado Glacial Outwash: Terminal Moraines vs. Kames",
  "Clear Creek Flake Gold: High-Velocity Stream Panning",
  "High Altitude Lodes: Prospecting Above Timberline (10,000+ ft)",
  "Breccia Volcano Pipes: Cripple Creek's Unique Geology",
  "Montana Gravel Bars: Alder Gulch Placer Science",
  "Idaho Basin Paystreaks: Deep Valley Terrace Deposits",
  "Pyrite vs. Tellurides: Identifying Rich Colorado Gold Ore",

  // Alaska & The Klondike
  "Nome Beach Sands: Tidal Wave Gold Recovery Tactics",
  "Permafrost Paydirt: Thaw Zones & Ancient Channels",
  "Glacial Flour vs. Heavy Pickers: Sorting Alaska Gold",
  "Kenai Peninsula River Tactics: High Water Crevicing",
  "Black Sand Overload: Managing Heavy Magnetite in Alaska",
  "Fairbanks Gold Belts: Deep Muck Layer Strategies",
  "Yukon Bench Mining: The White Channel Deposits",

  // Southeast & Appalachian Gold Belt
  "Dahlonega Gold Belt: America's First Real Gold Rush (1828)",
  "Carolina Saprolite: Rotten Rock Gold in Red Clay",
  "Reed Gold Mine: The 1799 Nugget Discovery Geology",
  "Appalachian Greenstone: Hidden Veins in Old Mountains",
  "Virginia Gold-Pyrite Belt: Tracking East Coast Veins",
  "Red Clay Panning: Breaking Down Sticky Mud for Fine Gold",

  // Old-Timer Clues & Historic Relics
  "Hand-Stacked Rock Walls: Reading Chinese Miner Tailing Piles",
  "Rocker Box & Long Tom Tailing Scatters",
  "Stamp Mill Ruins: How to Sample Waste Tailings Safely",
  "Drift Mine Portals: Finding Unworked Pillar Veins",
  "Old Placer Ditches & Flumes: Tracing Forgotten Waterways",
  "Arrastra Sites: Mexican Gold Grinding Stones Clues",
  "Square Nails & Purple Glass: Dating Abandoned Claim Sites",
  "The Boot Test: Identifying Old High-Grade Dumps",

  // US Mining Claims & Public Land Navigation
  "BLM vs. USFS Land: Where Recreational Panning is Legal",
  "The Mining Law of 1872: Understanding Unpatented Claims",
  "How to Read BLM MLRS Maps to Avoid Claim Jumping",
  "Staking a 20-Acre Placer Claim: Corner Posts & Discovery Points",
  "Casual Use vs. Plan of Operations: Equipment Regulations",
  "GPAA Claims: How Club Membership Access Works"
];

// Gaya visual diubah menjadi "Field Guide", "Geological Diagram", dan "Textured"
const visualStyles = [
  "Vintage Field Guide: Aged parchment paper texture, hand-drawn scientific illustrations mixed with realistic rock textures, typography looks like an old manual.",
  "National Geographic Cross-Section: Clean, highly realistic 3D cutaway of riverbeds or mountains, educational labels, bright daylight lighting.",
  "Dark Rock Macro: Dark slate/granite background, extreme close-up of gold veins, high contrast white/yellow text, gritty texture.",
  "Survivor Manual: Rough wood or dirt background, rugged aesthetic, tools like pickaxes and pans arranged as borders, bold grunge typography.",
  "Detailed Diagrammatic: Split screens showing 'Good Rock' vs 'Bad Rock', clear checkmarks and cross icons, hyper-realistic mineral rendering."
];

// Struktur layout khusus edukasi/instruksi
const layoutStructures = [
  "CROSS-SECTION CUTAWAY: A side-view of a riverbed showing the water, gravel layers, and GOLD nuggets trapped deep in bedrock cracks.",
  "VISUAL CHECKLIST (SPLIT SCREEN): Left side showing a 'Barren Rock' (Smooth white quartz), Right side showing 'Gold Bearing Rock' (Rusty, fractured, sulfides).",
  "STEP-BY-STEP PROCESS: Vertical flow showing 1. The Mountain Source -> 2. Erosion -> 3. River Transport -> 4. Settlement in Crevices.",
  "FIELD SIGNS GRID: A 2x2 grid showing close-ups of specific indicators: Black Sand, Iron Rust, Fractured Quartz, and Pyrite Cubes.",
  "THE GOLDEN PATH: A winding river illustration viewed from above, with arrows pointing to the 'Inside Bends' and 'Behind Boulders' where gold drops.",
  "THE MAGNIFYING GLASS: A macro view of a specific rock texture or mineral grain, highlighting tiny gold inclusions invisible to the naked eye.",
  "BEFORE & AFTER: A landscape split view showing a river channel 'Before Flood' (Normal) and 'After Flood' (New deposit zones marked).",
  "THE GEOLOGIST'S NOTEBOOK: A sketch-style layout with handwritten notes, arrows, and circled areas pointing to key geological features on a rock face.",
  "3D BLOCK DIAGRAM: An isometric view of a mountain or river section to show depth, layers, and how gold veins travel underground.",
  "THE PROSPECTOR'S MAP: A top-down map view with 'X' marks, trails, and contour lines showing where to sample in a valley.",
  "BEGINNER VS. PRO (SIDE-BY-SIDE): Split-screen comparison showing 'Where Beginners Dig' (fast turbulent currents, barren sand bars) versus 'Where Pros Dig' (inside bend paystreaks, jagged bedrock riffles, concentrated black sand).",
  "ANATOMY OF A PAYSTREAK (EXPLODED CALLOUTS): Detailed cutaway with callout lines pointing out hydraulic flow vectors, false bedrock clay seals, heavy gravel sorting, and high-density nugget traps.",
  "EQUIPMENT SCHEMATIC (BLUEPRINT STYLE): Vintage technical schematic illustrating the physics of gold recovery equipment (Sluice Box, Highbanker, or Gold Pan) showing riffle turbulence, fluid dynamics, and where gold settles into miners moss.",
  "STRATIGRAPHY COLUMN (VERTICAL PROFILE): A clear vertical profile column slicing through the ground layers: 1. Topsoil Overburden -> 2. Glacial Outwash Gravels -> 3. Ancient Tertiary Gold Channel -> 4. Decomposed Rotten Bedrock -> 5. Hard Fractured Bedrock.",
  "FIELD IDENTIFICATION FLOWCHART: A clean decision-tree infographic layout with arrows and test checkmarks guiding prospectors through real field tests (e.g. Malleability/Crush test, Acid test, Streak test, and Specific Gravity)."
];

/**
 * Helper to get history from localStorage
 */
const getPreviousTopics = (): string => {
  if (typeof window === 'undefined') return "";
  try {
    const history = localStorage.getItem('goldgen_history');
    if (!history) return "";
    const parsed = JSON.parse(history);
    // Extract last 10 titles to avoid token overflow
    const titles = parsed.map((item: any) => item.title).slice(0, 10).join(", ");
    return titles;
  } catch (e) {
    return "";
  }
};

export const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('gemini_api_key');
    if (local && local.trim()) {
      return local.trim();
    }
  }
  return (process.env.API_KEY || process.env.GEMINI_API_KEY || "").trim();
};

export const setStoredApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }
};

export const removeStoredApiKey = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gemini_api_key');
  }
};

/**
 * Generates a creative concept for a Gold Prospecting/Geology poster.
 */
export const generatePosterConcept = async (): Promise<PosterConcept> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key belum diatur. Silakan klik tombol 'API Key' di pojok kanan atas untuk memasukkan API Key Gemini Anda.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey });

  // --- SEQUENTIAL ROTATION LOGIC (TOPIC, LAYOUT, & STYLE) ---
  let nextTopicIndex = 0;
  let nextLayoutIndex = 0;
  let nextStyleIndex = 0;

  if (typeof window !== 'undefined') {
    // 1. Topic Rotation (Cycles 1 to 100)
    const storedTopic = localStorage.getItem('goldgen_topic_index');
    if (storedTopic !== null) {
      nextTopicIndex = (parseInt(storedTopic, 10) + 1) % themes.length;
    }
    localStorage.setItem('goldgen_topic_index', nextTopicIndex.toString());

    // 2. Layout Structure Rotation (Cycles through all 15 layouts)
    const storedLayout = localStorage.getItem('goldgen_layout_index');
    if (storedLayout !== null) {
      nextLayoutIndex = (parseInt(storedLayout, 10) + 1) % layoutStructures.length;
    } else {
      nextLayoutIndex = Math.floor(Math.random() * layoutStructures.length);
    }
    localStorage.setItem('goldgen_layout_index', nextLayoutIndex.toString());

    // 3. Visual Style Rotation (Cycles through all 5 visual styles)
    const storedStyle = localStorage.getItem('goldgen_style_index');
    if (storedStyle !== null) {
      nextStyleIndex = (parseInt(storedStyle, 10) + 1) % visualStyles.length;
    } else {
      nextStyleIndex = Math.floor(Math.random() * visualStyles.length);
    }
    localStorage.setItem('goldgen_style_index', nextStyleIndex.toString());
  }

  const selectedTheme = themes[nextTopicIndex];
  const selectedStyle = visualStyles[nextStyleIndex];
  const selectedLayout = layoutStructures[nextLayoutIndex];
  // -------------------------------------------------------------

  // Get history to prevent duplicates (still useful for context, though rotation solves the main issue)
  const previouslyGenerated = getPreviousTopics();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a concept for a REALISTIC GEOLOGICAL PROSPECTING INFOGRAPHIC.
      
      PARAMETERS:
      - Core Topic Suggestions: "${selectedTheme}" (You can vary this)
      - Visual Style: "${selectedStyle}"
      - Layout Structure: "${selectedLayout}"
      
      HISTORY EXCLUSION LIST (DO NOT REPEAT THESE EXACT TITLES):
      [${previouslyGenerated}]
      
      Target Audience: Gold Prospectors, Geologists, Treasure Hunters.
      Language: ENGLISH ONLY.
      
      Requirements:
      1. Title: Short, punchy, educational (e.g., "IS THIS ROCK RICH?", "READ THE RIVER").
      2. Tagline: A practical rule of thumb (e.g., "Follow the black sand to find the gold.").
      3. Data Points: 4-5 Practical, actionable field tips. NOT abstract financial advice. REAL GEOLOGY.
      4. Visual Prompt: Describe a SCENE with rocks, water, dirt, tools (pickaxe, pan). MUST BE REALISTIC.
      5. Social Caption: WRITE A SHORT EDUCATIONAL CAPTION (Max 500 characters). 
         - Structure: 
           (a) Hook Question.
           (b) THE SCIENCE: Brief explanation.
           (c) FIELD TIP: Actionable advice.
           (d) DISCUSSION QUESTION: Ask the audience about their experience to provoke comments (e.g., "Have you seen this?", "What's your biggest find?").
           (e) Hashtags.
      `,
      config: {
        systemInstruction: "You are an Expert Geologist. Create educational field guides. Keep captions concise (under 500 chars). ALWAYS end with a question to the audience.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Bold Poster Title" },
            tagline: { type: Type.STRING, description: "Educational Subtitle" },
            description: { type: Type.STRING, description: "Brief concept rationale" },
            visualPrompt: { type: Type.STRING, description: "Detailed prompt for generating the infographic image." },
            colorPalette: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Earthy colors (Browns, Greys, Greens, Gold)" 
            },
            infographicTitle: { type: Type.STRING, description: "Header for the tips section" },
            infographicPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4-5 short geological tips."
            },
            socialCaption: {
              type: Type.STRING,
              description: "Short educational caption (Max 500 characters)."
            }
          },
          required: ["title", "tagline", "description", "visualPrompt", "colorPalette", "infographicTitle", "infographicPoints", "socialCaption"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PosterConcept;
    }
    throw new Error("Gemini API returned no text.");
  } catch (error: any) {
    console.error("Error generating concept:", error);
    throw error;
  }
};

/**
 * Builds the exact prompt that is passed into the Gemini image generation model.
 */
export const buildImagePrompt = (concept: PosterConcept): string => {
  return `Create a VERTICAL EDUCATIONAL INFOGRAPHIC POSTER about GOLD PROSPECTING.

TEXT CONTENT TO INCLUDE (Must be legible):
HEADLINE: "${concept.title}"
SUBTITLE: "${concept.tagline}"
LIST HEADER: "${concept.infographicTitle}"
LIST POINTS:
${concept.infographicPoints.map((p) => `- ${p}`).join('\n')}

VISUAL STYLE & COMPOSITION:
${concept.visualPrompt}

MANDATORY ART DIRECTION:
- STYLE: Realistic Illustration / Field Guide / National Geographic Diagram.
- TEXTURE: Detailed Rock textures, flowing water, dirt, rust, metallic gold.
- ATMOSPHERE: Educational, scientific, rugged, outdoors.
- LAYOUT: Use distinct sections, arrows, or split screens to organize information.
- NO ABSTRACT ART. NO CARTOONS. It must look like a professional reference guide.
- Color Grading: Earth tones, Slate Grey, River Blue, Rusty Orange, Bright Gold.`.trim();
};

/**
 * Generates the actual poster image.
 */
export const generatePosterImage = async (concept: PosterConcept, customPrompt?: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key belum diatur. Silakan klik tombol 'API Key' di pojok kanan atas untuk memasukkan API Key Gemini Anda.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const prompt = customPrompt && customPrompt.trim() ? customPrompt.trim() : buildImagePrompt(concept);

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview", 
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: "9:16",
            imageSize: "1K" 
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response.");
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw error;
  }
};