import {
  PermissionResolvable,
  ChatInputCommandInteraction,
  Message,
  GuildMember,
  TextChannel,
  VoiceChannel,
  CategoryChannel,
  NewsChannel,
  ThreadChannel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { KazagumoPlayer } from 'kazagumo';

export type CommandType = 'slash' | 'prefix' | 'both';

export interface CommandOptions {
  name: string;
  description: string;
  category: CommandCategory;
  usage?: string;
  aliases?: string[];
  cooldown?: number;
  permissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  ownerOnly?: boolean;
  guildOnly?: boolean;
  type?: CommandType;
  options?: SlashCommandOption[];
  execute: CommandExecuteFunction;
}

export interface SlashCommandOption {
  name: string;
  description: string;
  type: 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role' | 'mentionable' | 'number' | 'attachment';
  required?: boolean;
  choices?: { name: string; value: string | number }[];
  options?: SlashCommandOption[];
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
}

export type CommandExecuteFunction = (
  client: any,
  interaction: ChatInputCommandInteraction | Message,
  args?: string[],
) => Promise<void>;

export type CommandCategory =
  | 'utility'
  | 'moderation'
  | 'leveling'
  | 'economy'
  | 'music'
  | 'giveaway'
  | 'tickets'
  | 'automod'
  | 'antinuke'
  | 'logging'
  | 'welcome'
  | 'verification'
  | 'reactionroles'
  | 'autoroles'
  | 'analytics'
  | 'birthday'
  | 'polls'
  | 'quotes'
  | 'sticky'
  | 'prefix'
  | 'config'
  | 'ai'
  | 'fun'
  | 'anime'
  | 'social'
  | 'general';

export interface EventOptions {
  name: string;
  once?: boolean;
  execute: (...args: unknown[]) => Promise<void> | void;
}

export interface ComponentOptions {
  customId: string;
  type: 'button' | 'select' | 'modal';
  execute: (interaction: any) => Promise<void>;
}

export interface GuildConfig {
  guildId: string;
  prefix: string[];
  premium: boolean;
  premiumUntil: Date | null;
  locale: string;
  modules: {
    automod: boolean;
    antinuke: boolean;
    logging: boolean;
    verification: boolean;
    welcome: boolean;
    farewell: boolean;
    booster: boolean;
    levelup: boolean;
    autorole: boolean;
    birthday: boolean;
    sticky: boolean;
  };
  automodConfig: {
    spam: boolean;
    mentionSpam: boolean;
    links: boolean;
    invites: boolean;
    caps: boolean;
    blockedWords: boolean;
    scamLinks: boolean;
    attachments: boolean;
    action: 'delete' | 'warn' | 'timeout' | 'mute' | 'kick' | 'ban';
    maxMentions: number;
    maxCapsPercent: number;
    blockedWordsList: string[];
    allowedLinks: string[];
  };
  antinukeConfig: {
    threshold: number;
    action: 'lockdown' | 'strip' | 'ban';
    whitelist: string[];
  };
  loggingConfig: {
    channelId: string | null;
    events: {
      messageDelete: boolean;
      messageEdit: boolean;
      memberJoin: boolean;
      memberLeave: boolean;
      voiceState: boolean;
      roleUpdate: boolean;
      channelUpdate: boolean;
      serverBoost: boolean;
      moderation: boolean;
    };
  };
  verificationConfig: {
    enabled: boolean;
    mode: 'button' | 'math' | 'image';
    verifiedRole: string | null;
    minAccountAge: number;
    channelId: string | null;
  };
  welcomeConfig: {
    enabled: boolean;
    channelId: string | null;
    message: string;
    embed: boolean;
  };
  farewellConfig: {
    enabled: boolean;
    channelId: string | null;
    message: string;
    embed: boolean;
  };
  boosterConfig: {
    enabled: boolean;
    channelId: string | null;
    message: string;
  };
  levelupConfig: {
    enabled: boolean;
    channelId: string | null;
  };
  autoroleConfig: {
    enabled: boolean;
    humanRoles: string[];
    botRoles: string[];
  };
  birthdayConfig: {
    enabled: boolean;
    channelId: string | null;
    roleId: string | null;
  };
  stickyConfig: {
    enabled: boolean;
    channels: string[];
  };
  autoRoles: string[];
  botAutoRoles: string[];
  djRole: string | null;
  modRole: string | null;
  adminRole: string | null;
  muteRole: string | null;
  jailRole: string | null;
  ticketCategory: string | null;
  ticketStaffRole: string | null;
  ticketLogChannel: string | null;
  modLogChannel: string | null;
  levelUpChannel: string | null;
  levelUpMessage: string;
  levelRoles: { level: number; roleId: string }[];
  xpMultiplier: number;
  xpCooldown: number;
  weeklyXpReset: boolean;
  prestigeEnabled: boolean;
  economyEnabled: boolean;
  musicEnabled: boolean;
  giveawayEnabled: boolean;
  ticketsEnabled: boolean;
  reactionRolesEnabled: boolean;
}

export interface PlayerState {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  volume: number;
  loop: 'none' | 'track' | 'queue';
  shuffle: boolean;
  autoplay: boolean;
  queue: TrackData[];
  currentTrack: TrackData | null;
  position: number;
  paused: boolean;
}

export interface TrackData {
  title: string;
  uri: string;
  identifier: string;
  length: number;
  author: string;
  requester: string;
  thumbnail: string | null;
}

export interface PaginationOptions {
  embeds: EmbedBuilder[];
  interaction: ChatInputCommandInteraction;
  userId: string;
  time?: number;
}

export interface CooldownKey {
  userId: string;
  commandName: string;
  guildId?: string;
}

export interface LevelRole {
  level: number;
  roleId: string;
}

export interface TicketData {
  ticketId: string;
  guildId: string;
  channelId: string;
  userId: string;
  category: string;
  status: 'open' | 'claimed' | 'closed';
  claimedBy: string | null;
  createdAt: Date;
  closedAt: Date | null;
  messages: TicketMessage[];
}

export interface TicketMessage {
  authorId: string;
  authorTag: string;
  content: string;
  timestamp: Date;
  attachments: string[];
}

export interface GiveawayData {
  messageId: string;
  channelId: string;
  guildId: string;
  prize: string;
  winnerCount: number;
  duration: number;
  endTime: Date;
  ended: boolean;
  requiredRole: string | null;
  requiredInvites: number;
  bonusEntries: number;
  entrants: string[];
  winners: string[];
}

export interface PollData {
  messageId: string;
  channelId: string;
  guildId: string;
  question: string;
  options: string[];
  votes: Map<string, string>;
  voteCounts: Map<string, number>;
  multiChoice: boolean;
  requiredRole: string | null;
  endTime: Date | null;
  ended: boolean;
}

export interface AnalyticsData {
  guildId: string;
  date: string;
  messages: number;
  joins: number;
  leaves: number;
  activeUsers: number;
  commandUsage: Record<string, number>;
}

export interface BirthdayData {
  userId: string;
  guildId: string;
  day: number;
  month: number;
  year: number | null;
}

export type WelcomeMessageType = 'welcome' | 'farewell' | 'levelup' | 'booster';

export interface StickyMessageData {
  channelId: string;
  guildId: string;
  content: string;
  isEmbed: boolean;
  embedTitle?: string;
  embedColor?: string;
  lastMessageId: string | null;
}

export interface QuoteData {
  quoteId: string;
  guildId: string;
  content: string;
  authorId: string;
  authorTag: string;
  createdAt: Date;
}

export interface AIConversationData {
  userId: string;
  guildId: string;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[];
  context: string | null;
}

export interface AIUsageData {
  userId: string;
  date: string;
  count: number;
}

export interface ModCase {
  caseId: number;
  guildId: string;
  userId: string;
  moderatorId: string;
  type: 'warn' | 'mute' | 'kick' | 'ban' | 'timeout';
  reason: string;
  duration: number | null;
  timestamp: Date;
  active: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
