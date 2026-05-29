import { Client, Collection, GatewayIntentBits, Partials, Options } from 'discord.js';
import { Kazagumo } from 'kazagumo';
import { Connectors } from 'shoukaku';
import { LavalinkService } from '../services/music/LavaLinkService';
import { DatabaseManager } from '../managers/DatabaseManager';
import { CacheManager } from '../managers/CacheManager';
import { MusicManager } from '../managers/MusicManager';
import { GiveawayManager } from '../managers/GiveawayManager';
import { TicketManager } from '../managers/TicketManager';
import { PollManager } from '../managers/PollManager';
import { BirthdayManager } from '../managers/BirthdayManager';
import { StickyManager } from '../managers/StickyManager';
import { AntiNukeManager } from '../managers/AntiNukeManager';
import { MetricsManager } from '../managers/MetricsManager';
import { GeminiClient } from '../services/ai/GeminiClient';
import { Command } from './Command';
import { Event } from './Event';
import { Component } from './Component';
import { CommandHandler } from '../handlers/CommandHandler';
import { EventHandler } from '../handlers/EventHandler';
import { ComponentHandler } from '../handlers/ComponentHandler';
import pino from 'pino';

export class AxionClient extends Client {
  public commands: Collection<string, Command>;
  public aliases: Collection<string, string>;
  public events: Collection<string, Event>;
  public components: Collection<string, Component>;
  public cooldowns: Collection<string, Collection<string, number>>;
  public commandHandler: CommandHandler;
  public eventHandler: EventHandler;
  public componentHandler: ComponentHandler;
  public database: DatabaseManager;
  public cache: CacheManager;
  public music: MusicManager;
  public kazagumo: Kazagumo | null;
  public lavalink: LavalinkService | null;
  public giveaway: GiveawayManager;
  public ticket: TicketManager;
  public poll: PollManager;
  public birthday: BirthdayManager;
  public sticky: StickyManager;
  public antinuke: AntiNukeManager;
  public metrics: MetricsManager;
  public gemini: GeminiClient;
  public logger: pino.Logger;
  public config: {
    token: string;
    clientId: string;
    ownerId: string;
    mongodbUri: string;
    redisUrl: string;
    lavalinkHost: string;
    lavalinkPort: number;
    lavalinkPassword: string;
    lavalinkSecure: boolean;
    spotifyClientId: string;
    spotifyClientSecret: string;
    geminiApiKey: string;
  };

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
      ],
      makeCache: Options.cacheWithLimits({
        ApplicationCommandManager: 0,
        BaseGuildEmojiManager: 200,
        DMMessageManager: 100,
        GuildBanManager: 0,
        GuildInviteManager: 0,
        GuildMemberManager: {
          maxSize: 5000,
          keepOverLimit: (member) => member.id === member.client.user?.id,
        },
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        GuildEmojiManager: 200,
        MessageManager: {
          maxSize: 500,
          keepOverLimit: (message) => message.id === message.guildId,
        },
        PresenceManager: {
          maxSize: 200,
          keepOverLimit: () => false,
        },
        ReactionManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 200,
        ThreadMemberManager: 0,
        UserManager: {
          maxSize: 5000,
          keepOverLimit: () => false,
        },
        VoiceStateManager: {
          maxSize: 5000,
          keepOverLimit: () => false,
        },
      }),
      sweepers: {
        ...Options.defaultSweeperSettings,
        messages: {
          interval: 300,
          lifetime: 900,
        },
        users: {
          interval: 300,
          lifetime: 1800,
        },
        guildMembers: {
          interval: 300,
          lifetime: 600,
        },
      },
    });

    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new Collection();
    this.components = new Collection();
    this.cooldowns = new Collection();
    this.kazagumo = null;
    this.lavalink = null;

    this.logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });

    this.config = {
      token: process.env.DISCORD_TOKEN ?? '',
      clientId: process.env.CLIENT_ID ?? '',
      ownerId: process.env.OWNER_ID ?? '1229349314736951321',
      mongodbUri: process.env.MONGODB_URI ?? '',
      redisUrl: process.env.REDIS_URL ?? '',
      lavalinkHost: process.env.LAVALINK_HOST ?? '',
      lavalinkPort: parseInt(process.env.LAVALINK_PORT ?? '2333', 10),
      lavalinkPassword: process.env.LAVALINK_PASSWORD ?? '',
      lavalinkSecure: process.env.LAVALINK_SECURE === 'true',
      spotifyClientId: process.env.SPOTIFY_CLIENT_ID ?? '',
      spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
      geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    };

    this.database = new DatabaseManager(this);
    this.cache = new CacheManager(this);
    this.commandHandler = new CommandHandler(this);
    this.eventHandler = new EventHandler(this);
    this.componentHandler = new ComponentHandler(this);
    this.music = new MusicManager(this);
    this.giveaway = new GiveawayManager(this);
    this.ticket = new TicketManager(this);
    this.poll = new PollManager(this);
    this.birthday = new BirthdayManager(this);
    this.sticky = new StickyManager(this);
    this.antinuke = new AntiNukeManager(this);
    this.metrics = new MetricsManager(this);
    this.gemini = new GeminiClient(this);
  }

  public async init(): Promise<void> {
    this.logger.info('Initializing Axion...');

    await this.database.connect();
    await this.cache.connect();

    await this.initMusic();
    await this.commandHandler.loadCommands();
    await this.eventHandler.loadEvents();
    await this.componentHandler.loadComponents();

    (global as any).__AXION_CLIENT__ = this;

    await this.giveaway.init();
    await this.birthday.init();
    await this.poll.init();
    await this.sticky.init();

    this.setupAntiCrash();

    await this.login(this.config.token);
  }

  private async initMusic(): Promise<void> {
    if (!this.config.lavalinkHost) {
      this.logger.warn('Lavalink not configured — music features disabled');
      return;
    }

    try {
      this.lavalink = new LavalinkService(this);
      await this.lavalink.connect();

      const connector = new Connectors.DiscordJS(this);

      const kazagumo = new Kazagumo(
        {
          plugins: [],
          defaultVolume: 80,
          sendOldArgs: true,
        },
        connector,
        this.lavalink.shoukakuNodes,
        this.lavalink.shoukakuOptions,
      );

      this.kazagumo = kazagumo;
      this.logger.info('Music system initialized');
    } catch (error) {
      this.logger.error('Failed to initialize music system:', error);
    }
  }

  private setupAntiCrash(): void {
    process.on('unhandledRejection', async (reason: Error | unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.logger.error('Unhandled Rejection:', error);

      try {
        this.metrics.recordError('unhandled_rejection');
      } catch {
        // Silently fail
      }
    });

    process.on('uncaughtException', async (error: Error) => {
      this.logger.error('Uncaught Exception:', error);

      try {
        this.metrics.recordError('uncaught_exception');
      } catch {
        // Silently fail
      }
    });

    process.on('warning', (warning) => {
      this.logger.warn('Node Warning:', warning);
    });
  }

  public getCommand(name: string): Command | undefined {
    return this.commands.get(name) ?? this.commands.get(this.aliases.get(name) ?? '');
  }

  public isOwner(userId: string): boolean {
    return userId === this.config.ownerId;
  }
}
