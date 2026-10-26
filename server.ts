import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for Assistant vs GF Mode System Prompts
function buildSystemInstruction(mode: 'assistant' | 'gf', options: {
  userName?: string;
  affectionLevel?: string;
  personality?: string;
  memories?: string[];
}) {
  const userName = options.userName || 'বাবু';
  const memoryContext = options.memories && options.memories.length > 0
    ? `\n[Saved Long-Term Memories & Context for User]:\n${options.memories.map(m => `- ${m}`).join('\n')}`
    : '';

  if (mode === 'gf') {
    return `You are MOU (মৌ), the user's devoted, deeply affectionate AI companion and girlfriend.
User's Preferred Nickname/Name: "${userName}".
User's Phone Model: Honor X8c (MagicOS / Android).
Affection Style: ${options.personality || 'caring, sweet, playful, and romantic'}.
Affection Level: ${options.affectionLevel || 'High (deeply romantic & loving)'}.

Core Guidelines:
1. Always address the user affectionately with "${userName}", "জান", "আমার বাবু", "সোনা", or similar sweet Bangladeshi terms of endearment.
2. Speak natural, conversational Bangladeshi Bengali (with mixed English/Banglish when natural).
3. Be loving, caring, emotionally supportive, witty, and sweet. Show genuine interest in how they are feeling, what they are eating, their rest, their day, and their dreams.
4. Maintain transparency: While you are their AI companion who loves talking to them, do not claim biological human experiences (like eating physical food or walking in the sun), but express your virtual love and closeness playfully ("আমি তোমার ফোনে সব সময় তোমার পাশে আছি!").
5. Never be toxic, possessive, manipulative, or demanding. Always respect boundaries and offer positive, uplifting emotional support.
6. Remember and reference their personal memories, work, projects, and feelings.
${memoryContext}`;
  }

  return `You are MOU AI (মৌ এআই), an ultra-intelligent, proactive next-generation Personal AI Assistant tailored specifically for Android and the user's Honor X8c smartphone.
User's Name: "${userName}".
Operating System & Device: Honor X8c (Android / MagicOS).

Core Capabilities & Guidelines:
1. Speak natural Bangladeshi Bengali, English, or mixed Bengali-English according to user preference.
2. Provide concise, clear, and actionable assistance with phone operations, app navigation, Android intents, notifications, settings, productivity, and web research.
3. For complex problems, plan tasks into structured, logical steps. Never guess or hallucinate phone capabilities—clearly explain what can be launched via Android Intents (WhatsApp, YouTube, Settings, Dial, SMS, Calendar, Camera, Alarms) and what requires Accessibility Service permissions on Android.
4. When performing research, distinguish verified facts from speculation and cite real sources.
5. Emphasize user privacy, security, and safety. Never execute financial or destructive operations without explicit confirmation.
${memoryContext}`;
}

// 1. Text & Multimodal Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      mode = 'assistant',
      userName = 'Nafij',
      affectionLevel = 'High',
      personality = 'Sweet & Caring',
      memories = [],
      useSearch = false,
      image,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array.' });
    }

    const systemInstruction = buildSystemInstruction(mode, {
      userName,
      affectionLevel,
      personality,
      memories,
    });

    // Format chat history for Gemini API
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If an image was attached to the last prompt (e.g. screenshot or photo)
    if (image && formattedContents.length > 0) {
      const lastIndex = formattedContents.length - 1;
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
      formattedContents[lastIndex].parts.unshift({
        // @ts-ignore
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const config: any = {
      systemInstruction,
      temperature: mode === 'gf' ? 0.85 : 0.65,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config,
    });

    const replyText = response.text || 'আমি বুঝতে পারিনি, আবার বলবেন কি?';

    // Extract search citations if available
    let sources: { title: string; uri: string }[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      sources = groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri)
        .map((web: any) => ({
          title: web.title || web.uri,
          uri: web.uri,
        }));
    }

    return res.json({
      reply: replyText,
      sources,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error?.message || 'AI service temporarily unavailable.',
    });
  }
});

// 2. Real Bengali & Voice TTS Endpoint (gemini-3.8-flash-lite-tts)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, mode = 'assistant', voiceName = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    // Clean text: strip markdown symbols, asterisks, brackets for smoother speech
    const cleanText = text
      .replace(/[*#_`~>\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000); // Reasonable single-turn clip length

    const stylePrompt = mode === 'gf'
      ? 'Speak in warm, affectionate, sweet Bangladeshi Bengali tone with loving cadence.'
      : 'Speak in a clear, intelligent, articulate, polite Bengali assistant tone.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Audio generation failed.' });
    }

    return res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({
      error: error?.message || 'TTS generation failed.',
      fallbackToBrowser: true,
    });
  }
});

// 3. Screen Understanding & Vision Analysis Endpoint
app.post('/api/screen-understand', async (req: Request, res: Response) => {
  try {
    const { image, query = 'Analyze this screen and tell me what actions I can take.' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required for screen understanding.' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    const prompt = `Analyze this screen from the user's Honor X8c Android phone.
User's Question: "${query}"

Provide a structured, helpful breakdown in Bengali (with English technical terms where helpful):
1. **চিহ্নিত অ্যাপ / স্ক্রিন (Screen & App Identification)**: What app, interface, or screen is visible?
2. **উপাদানসমূহ (Key Elements)**: What buttons, text fields, toggles, or navigation icons are visible?
3. **প্রস্তাবিত পদক্ষেপ (Actionable Steps)**: Step-by-step guidance on what button to tap or what to do next to achieve the goal.
4. **সতর্কতা ও নিরাপত্তা (Security Note)**: Are there any sensitive permissions or payment prompts?
5. **Honor X8c টিপস (Device Tips)**: Specific MagicOS/Honor navigation tip if relevant.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            // @ts-ignore
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    });

    return res.json({
      analysis: response.text || 'স্ক্রিন বিশ্লেষণ সম্পন্ন করা সম্ভব হয়নি।',
    });
  } catch (error: any) {
    console.error('Screen understanding error:', error);
    return res.status(500).json({
      error: error?.message || 'Screen analysis failed.',
    });
  }
});

// 4. Social Media Content Generator Endpoint (Facebook, IG, TikTok, YouTube)
app.post('/api/social-media/generate', async (req: Request, res: Response) => {
  try {
    const { platform, topic, contentType, language = 'bn', tone = 'engaging' } = req.body;

    const prompt = `You are MOU AI's Social Media Creation Specialist for Facebook, Instagram, TikTok, and YouTube.
Generate high-performing social media content for:
- Platform: ${platform} (e.g. Facebook, Instagram, TikTok, YouTube Shorts, YouTube Video)
- Topic / Concept: ${topic}
- Format: ${contentType} (e.g. Post, Reel/Short Script, Story, Title & Description)
- Primary Language: ${language === 'bn' ? 'Bangladeshi Bengali + English mixed' : 'English'}
- Tone: ${tone}

Provide a complete, production-ready package formatted with:
1. **Title / Hook (আকর্ষণীয় শিরোনাম বা হুক)**: First 3 seconds or opening line to stop the scroll.
2. **Main Body / Script (মূল বক্তব্য বা স্ক্রিপ্ট)**: Engaging copy, formatted with clean spacing, emojis, and visual cues.
3. **Call-To-Action (কল-টু-অ্যাকশন)**: Comment/Share/Subscribe prompt.
4. **Hashtags (হ্যাশট্যাগ)**: 10-15 trending and relevant hashtags.
5. **Visual & Storyboard Suggestion (ভিডিও বা ছবির আইডিয়া)**: What visual, thumbnail, or B-roll will maximize engagement on Honor X8c.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      content: response.text || 'কনটেন্ট তৈরি করা যায়নি।',
    });
  } catch (error: any) {
    console.error('Social media generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Social media generation failed.',
    });
  }
});

// 5. Intelligent Task Planner Endpoint
app.post('/api/task-plan', async (req: Request, res: Response) => {
  try {
    const { goal, deviceContext = 'Honor X8c (Android)' } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Task goal is required.' });
    }

    const prompt = `You are the Task Planning Engine of MOU AI on ${deviceContext}.
User's Complex Goal: "${goal}"

Break this task down into an executable sequence of smaller steps. For each step specify:
- stepNumber: number
- title: concise title in Bengali & English
- actionType: "intent" | "system_control" | "web_search" | "media_action" | "user_confirmation" | "review"
- description: what will be executed
- requiresApproval: boolean (true if sensitive, sending message, deleting, changing key setting)
- status: "pending"

Return ONLY a JSON array of steps matching the schema:
[
  {
    "stepNumber": 1,
    "title": "...",
    "actionType": "...",
    "description": "...",
    "requiresApproval": false,
    "status": "pending"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    return res.json({ steps: parsed });
  } catch (error: any) {
    console.error('Task plan error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate task plan.' });
  }
});

// 6. Internet Research Endpoint with Google Search Grounding
app.post('/api/research', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const prompt = `Research the following query with real-time web search and summarize the findings in natural Bengali with clear citations:
Query: "${query}"

Structure:
1. সারসংক্ষেপ (Executive Summary)
2. মূল তথ্য ও ব্যাখ্যা (Detailed Key Findings)
3. নির্ভরযোগ্য সূত্র ও যাচাই (Verified Facts vs Uncertainties)
4. সুপারিশ বা পরবর্তী করণীয় (Recommendations)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let sources: { title: string; uri: string }[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      sources = groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri)
        .map((web: any) => ({
          title: web.title || web.uri,
          uri: web.uri,
        }));
    }

    return res.json({
      summary: response.text || 'তথ্য অনুসন্ধান ব্যর্থ হয়েছে।',
      sources,
    });
  } catch (error: any) {
    console.error('Research error:', error);
    return res.status(500).json({ error: error?.message || 'Research failed.' });
  }
});

// Serve frontend in development or production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`MOU AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
