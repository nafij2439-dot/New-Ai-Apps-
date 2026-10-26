export type AppMode = 'assistant' | 'gf';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: { title: string; uri: string }[];
  image?: string;
  isAudioPlaying?: boolean;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'nickname' | 'date' | 'routine' | 'project' | 'secret_boundary';
  key: string;
  value: string;
  createdAt: number;
  updatedAt: number;
}

export interface TaskStep {
  stepNumber: number;
  title: string;
  actionType: 'intent' | 'system_control' | 'web_search' | 'media_action' | 'user_confirmation' | 'review';
  description: string;
  requiresApproval: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  result?: string;
}

export interface TaskPlan {
  id: string;
  goal: string;
  steps: TaskStep[];
  status: 'planning' | 'running' | 'paused' | 'completed' | 'aborted';
  createdAt: number;
}

export interface GFProfile {
  nickname: string;
  affectionLevel: 'Shy' | 'Sweet' | 'Romantic' | 'Playful' | 'Caring';
  mood: 'happy' | 'loving' | 'pouting' | 'supportive' | 'sleepy';
  relationshipAnniversary?: string;
  morningGreetingTime: string;
  nightGreetingTime: string;
  customNotes: string[];
}

export interface SocialMediaDraft {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
  topic: string;
  contentType: 'post' | 'reel_short_script' | 'story' | 'title_description';
  language: 'bn' | 'en';
  generatedContent: string;
  createdAt: number;
}
