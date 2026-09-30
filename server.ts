import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with server-side API Key & user-agent header
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('✅ GoogleGenAI initialized with server-side GEMINI_API_KEY');
  } catch (err) {
    console.warn('⚠️ GoogleGenAI SDK initialization note:', err);
  }
} else {
  console.log('ℹ️ No GEMINI_API_KEY detected in environment. Running in certified DEMO MODE.');
}

// Health & System Status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AirSense India',
    isLive: Boolean(apiKey && ai),
    mode: apiKey && ai ? 'LIVE' : 'DEMO MODE',
    model: 'gemini-3.8-flash',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AirSense India',
    isLive: Boolean(apiKey && ai),
    mode: apiKey && ai ? 'LIVE' : 'DEMO MODE',
    model: 'gemini-3.8-flash',
    telemetrySource: 'SIMULATED (CPCB CAAQMS & NASA FIRMS Heuristics)',
    timestamp: new Date().toISOString(),
  });
});

// Server-side Gemini Analysis endpoint for Citizen Reports
app.post('/api/analyze-report', async (req, res) => {
  const { description, image, pollutionType, location, citizenSeverity, language } = req.body;

  // Domain heuristic presets used for certified DEMO MODE fallback
  const fallbackTypeMap: Record<string, { sources: string[]; evidence: string; sop: string }> = {
    'Industrial emission': {
      sources: ['Unscrubbed boiler exhaust stack', 'Chemical solvent venting unit', 'Unauthorized night-shift kiln operation'],
      evidence: 'High-opacity dark grey/yellowish plume column displaying thermal buoyancy and steady conical dispersion pattern downwind.',
      sop: 'Deploy SPCB mobile inspection squad with portable photoionization detector within 1.5 km corridor.',
    },
    'Open burning': {
      sources: ['Municipal solid waste pile smolder', 'Agricultural crop residue / stubble burn', 'Informal cable insulation scrap burning'],
      evidence: 'Dense ground-level grey-white particulate haze with concentrated thermal uplift core and lateral street-level diffusion.',
      sop: 'Notify municipal ward rapid action team for immediate fire suppression and issue fine under Solid Waste Rules.',
    },
    'Dust event': {
      sources: ['Unenclosed high-rise construction site', 'Unpaved transit arterial resuspension', 'Ready-mix concrete aggregate handling'],
      evidence: 'Coarse particulate curtain (PM10 dominant), high light-scattering index exceeding 450 µg/m³ equivalent visual opacity.',
      sop: 'Issue automated stop-work compliance notice; mandate anti-smog mist cannon deployment and perimeter geotextile sheeting.',
    },
    'Smoke event': {
      sources: ['Biomass cookstove cluster', 'Commercial tandoor wood/charcoal flare', 'Spontaneous landfill subsurface methane flare'],
      evidence: 'Stratified blue-grey particulate layer trapped beneath morning boundary layer inversion.',
      sop: 'Audit landfill sector methane probe logs and cross-check thermal infrared satellite pass.',
    },
    'Traffic-related pollution': {
      sources: ['Heavy commercial diesel trucks idling at toll corridor', 'High congestion canyon trapped exhaust', 'Old vintage transit fleet'],
      evidence: 'Fine black carbon (PM2.5/NO2) street-level stagnation trapped between urban building geometries.',
      sop: 'Trigger dynamic traffic police advisory to divert multi-axle freight traffic and synchronize traffic signal green waves.',
    },
    'Unknown source': {
      sources: ['Localized particulate anomaly', 'Fugitive combustion emission', 'Suspended micro-particulates'],
      evidence: 'Unstratified particulate plume observed near ground level with elevated light scattering index.',
      sop: 'Initiate sensor calibration check and dispatch local ward field surveillance officer.',
    },
  };

  const key = (pollutionType && fallbackTypeMap[pollutionType]) ? pollutionType : 'Open burning';
  const fallbackData = fallbackTypeMap[key];
  const calculatedSeverity = (citizenSeverity || (key === 'Industrial emission' ? 'CRITICAL' : 'HIGH')).toUpperCase();
  const fallbackConfidence = Math.floor(Math.random() * 9) + 88; // 88-96%

  // 1. If Gemini API is available, perform real multimodal analysis
  if (ai && apiKey) {
    try {
      const contentsParts: any[] = [];

      const promptText = `You are the core environmental intelligence engine of AirSense India.
Analyze this citizen pollution report:
- Reported Location: ${location || 'Unknown location in India'}
- Citizen Observed Type: ${pollutionType || 'Unknown'}
- Perceived Severity: ${citizenSeverity || 'MODERATE'}
- Citizen Description: "${description || 'Dense smoke or localized dust anomaly observed'}"
- Language of Report: ${language || 'English'}

Instructions:
1. Examine the visual evidence (if image attached) or reported description.
2. Determine if a localized pollution event is detected.
3. Classify eventType strictly into one of: "Industrial emission", "Open burning", "Dust event", "Smoke event", "Traffic-related pollution", or "Unknown source".
4. Describe the visual evidence (optical opacity, plume characteristics, particulate stratification).
5. Hypothesize 2 to 4 probable micro-sources based on the Indian urban/industrial context.
6. Classify severity strictly as: "LOW", "MODERATE", "HIGH", or "CRITICAL".
7. Assign an AI confidence score between 65 and 98.
8. Specify recommended regulatory verification protocols for state pollution control boards (SPCB / CPCB) or civic task force.`;

      // Handle image: data URL or remote URL
      if (image && typeof image === 'string') {
        if (image.startsWith('data:')) {
          const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            contentsParts.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2],
              },
            });
          }
        } else if (image.startsWith('http://') || image.startsWith('https://')) {
          try {
            const imgRes = await fetch(image);
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              const base64Data = Buffer.from(arrayBuffer).toString('base64');
              const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
              contentsParts.push({
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              });
            }
          } catch (fetchErr) {
            console.warn('Could not fetch remote preset image for multimodal analysis, continuing with text:', fetchErr);
          }
        }
      }

      contentsParts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ parts: contentsParts }],
        config: {
          systemInstruction:
            'You are AirSense India\'s expert environmental intelligence model. Your role is to produce objective, structured incident assessments from citizen visual reports. Your output is an AI-assisted hypothesis for regulatory triage, not a definitive scientific attribution.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              eventDetected: {
                type: Type.BOOLEAN,
                description: 'True if a genuine localized pollution event is identified.',
              },
              eventType: {
                type: Type.STRING,
                description: 'Classified event type: Industrial emission, Open burning, Dust event, Smoke event, Traffic-related pollution, or Unknown source.',
              },
              visualEvidence: {
                type: Type.STRING,
                description: 'Optical analysis of plume density, opacity, color spectrum, dispersion stratification, or particulate suspension.',
              },
              possibleSources: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 4 probable micro-sources based on Indian urban/industrial context.',
              },
              severity: {
                type: Type.STRING,
                enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
                description: 'Assessed severity level: LOW, MODERATE, HIGH, or CRITICAL.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Estimated AI confidence score from 65 to 98 percent.',
              },
              recommendedVerification: {
                type: Type.STRING,
                description: 'Actionable protocol for state pollution control boards (SPCB / CPCB) or local civic task force.',
              },
            },
            required: [
              'eventDetected',
              'eventType',
              'visualEvidence',
              'possibleSources',
              'severity',
              'confidence',
              'recommendedVerification',
            ],
          },
        },
      });

      const responseText = response.text?.trim();
      if (responseText) {
        const parsed = JSON.parse(responseText);
        const normalizedSeverity = (parsed.severity || 'MODERATE').toUpperCase();

        return res.json({
          success: true,
          isLive: true,
          mode: 'LIVE',
          model: 'gemini-3.8-flash',
          analysis: {
            eventDetected: Boolean(parsed.eventDetected),
            eventType: parsed.eventType || key,
            visualEvidence: parsed.visualEvidence || 'Optical analysis indicates elevated particulate concentration.',
            possibleSources: Array.isArray(parsed.possibleSources) && parsed.possibleSources.length > 0
              ? parsed.possibleSources
              : fallbackData.sources,
            severity: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].includes(normalizedSeverity)
              ? normalizedSeverity
              : 'MODERATE',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 92,
            recommendedVerification: parsed.recommendedVerification || fallbackData.sop,
          },
        });
      }
    } catch (err: any) {
      console.error('Gemini API call failed or encountered error, activating DEMO MODE fallback:', err.message);
    }
  }

  // 2. Clearly labeled DEMO MODE fallback when API key is missing or unavailable
  return res.json({
    success: true,
    isLive: false,
    mode: 'DEMO MODE',
    model: 'AirSense Heuristic Engine (DEMO MODE)',
    reason: apiKey ? 'Gemini API call temporarily unavailable — falling back to deterministic demo simulation' : 'GEMINI_API_KEY unconfigured — operating in certified DEMO MODE',
    analysis: {
      eventDetected: true,
      eventType: key,
      visualEvidence: `${fallbackData.evidence} (Heuristic baseline correlated with typical local meteorology).`,
      possibleSources: fallbackData.sources,
      severity: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].includes(calculatedSeverity)
        ? calculatedSeverity
        : 'HIGH',
      confidence: fallbackConfidence,
      recommendedVerification: fallbackData.sop,
    },
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AirSense India operational server running on port ${PORT}`);
  });
}

startServer();
