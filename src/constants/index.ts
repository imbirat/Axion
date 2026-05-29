export const OWNER_ID = '1229349314736951321';
export const SUPPORT_SERVER = 'https://discord.gg/5ZGTMY6GRj';
export const INVITE_LINK = 'https://discord.com/oauth2/authorize?client_id=1502623528476737627';
export const DEFAULT_PREFIX = '.';
export const SLASH_PREFIX = '/';

export const BOT_NAME = 'Axion';
export const BOT_ACTIVITY = '/help | Axion';

export const EMBED_COLORS = {
  primary: 0x5865f2,
  success: 0x57f287,
  warning: 0xfee75c,
  error: 0xed4245,
  info: 0x5865f2,
  music: 0x1db954,
  economy: 0xf1c40f,
  leveling: 0x9b59b6,
  giveaway: 0xe67e22,
  verification: 0x3498db,
  moderation: 0xe74c3c,
  default: 0x2b2d31,
} as const;

export const XP_CONFIG = {
  messageCooldown: 60_000,
  reactionCooldown: 120_000,
  voiceCooldown: 120_000,
  minMessageXp: 5,
  maxMessageXp: 15,
  minReactionXp: 2,
  maxReactionXp: 5,
  minVoiceXp: 10,
  maxVoiceXp: 20,
  voiceTickInterval: 60_000,
  weeklyReset: false,
} as const;

export const ECONOMY_CONFIG = {
  dailyAmount: 500,
  workMin: 50,
  workMax: 200,
  fishMin: 20,
  fishMax: 100,
  robMin: 10,
  robMax: 100,
  robFailChance: 0.4,
  coinflipMinBet: 10,
  bankInterestRate: 0.02,
  maxBankCapacity: 100000,
} as const;

export const MUSIC_CONFIG = {
  defaultVolume: 80,
  maxVolume: 150,
  autoLeaveTimeout: 300_000,
  maxQueueSize: 500,
  filters: {
    bassboost: { equalizer: [{ band: 0, gain: 0.6 }, { band: 1, gain: 0.4 }] },
    nightcore: { timescale: { speed: 1.3, pitch: 1.3, rate: 1 } },
    vaporwave: { timescale: { speed: 0.8, pitch: 0.8, rate: 1 } },
  } as Record<string, Record<string, unknown>>,
} as const;

export const GIVEAWAY_CONFIG = {
  minDuration: 10_000,
  maxDuration: 7_864_000_000,
  maxWinners: 25,
  defaultDuration: 3_600_000,
} as const;

export const TICKET_CONFIG = {
  maxTicketsPerUser: 5,
  closeTimeout: 5_000,
  transcriptFormat: 'html' as const,
} as const;

export const POLL_CONFIG = {
  maxOptions: 10,
  minOptions: 2,
  maxDuration: 30 * 24 * 60 * 60 * 1000,
} as const;

export const LEVEL_FORMULA = (level: number): number => 5 * (level * level) + 50 * level + 100;

export const CACHE_TTL = {
  guildConfig: 300,
  userData: 600,
  economyData: 300,
  xpData: 120,
  musicPlayer: 60,
} as const;

export const HELP_CATEGORIES = [
  { emoji: '🛡️', name: 'Anti-Nuke' },
  { emoji: '🤖', name: 'Auto-Mod' },
  { emoji: '🔨', name: 'Moderation' },
  { emoji: '🎭', name: 'Reaction Roles' },
  { emoji: '🎉', name: 'Giveaway System' },
  { emoji: '💬', name: 'Social' },
  { emoji: '👋', name: 'Welcome / Farewell' },
  { emoji: '📋', name: 'Logging' },
  { emoji: '🎫', name: 'Ticket System' },
  { emoji: '⭐', name: 'XP / Leveling' },
  { emoji: '💰', name: 'Economy' },
  { emoji: '🎵', name: 'Music' },
  { emoji: '✅', name: 'Verification System' },
  { emoji: '🎨', name: 'Anime' },
  { emoji: '🎮', name: 'Fun' },
  { emoji: '📊', name: 'Analytics' },
  { emoji: '🌙', name: 'AFK' },
  { emoji: '🔧', name: 'Utilities' },
  { emoji: '📌', name: 'Auto-Roles' },
  { emoji: '🎂', name: 'Birthday System' },
  { emoji: '📊', name: 'Advanced Polls' },
  { emoji: '💭', name: 'Quote System' },
  { emoji: '📌', name: 'Sticky Messages' },
  { emoji: '🤖', name: 'AI' },
  { emoji: '🔤', name: 'Prefix' },
  { emoji: '⚙️', name: 'Config' },
] as const;

export const FILTER_NAMES: Record<string, string> = {
  spam: 'Spam Detection',
  mentionSpam: 'Mention Spam',
  links: 'Link Filter',
  invites: 'Invite Filter',
  caps: 'Excessive Caps',
  blockedWords: 'Blocked Words',
  scamLinks: 'Scam Link Detection',
  attachments: 'Attachment Filter',
} as const;

export const THEME = {
  accent: '#5865F2',
  danger: '#ED4245',
  success: '#57F287',
  warning: '#FEE75C',
} as const;
