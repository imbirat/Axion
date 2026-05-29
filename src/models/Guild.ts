import mongoose, { Schema, Document } from 'mongoose';

export interface IGuild extends Document {
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
    action: string;
    maxMentions: number;
    maxCapsPercent: number;
    blockedWordsList: string[];
    allowedLinks: string[];
  };
  antinukeConfig: {
    enabled: boolean;
    threshold: number;
    action: string;
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
    mode: string;
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
  caseId: number;
  createdAt: Date;
  updatedAt: Date;
}

const GuildSchema = new Schema<IGuild>(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    prefix: { type: [String], default: ['.'] },
    premium: { type: Boolean, default: false },
    premiumUntil: { type: Date, default: null },
    locale: { type: String, default: 'en' },
    modules: {
      type: Schema.Types.Mixed,
      default: {
        automod: false,
        antinuke: false,
        logging: false,
        verification: false,
        welcome: false,
        farewell: false,
        booster: false,
        levelup: false,
        autorole: false,
        birthday: false,
        sticky: false,
      },
    },
    automodConfig: {
      type: Schema.Types.Mixed,
      default: {
        spam: false,
        mentionSpam: false,
        links: false,
        invites: false,
        caps: false,
        blockedWords: false,
        scamLinks: false,
        attachments: false,
        action: 'delete',
        maxMentions: 5,
        maxCapsPercent: 70,
        blockedWordsList: [],
        allowedLinks: [],
      },
    },
    antinukeConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        threshold: 5,
        action: 'ban',
        whitelist: [],
      },
    },
    loggingConfig: {
      type: Schema.Types.Mixed,
      default: {
        channelId: null,
        events: {
          messageDelete: false,
          messageEdit: false,
          memberJoin: false,
          memberLeave: false,
          voiceState: false,
          roleUpdate: false,
          channelUpdate: false,
          serverBoost: false,
          moderation: false,
        },
      },
    },
    verificationConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        mode: 'button',
        verifiedRole: null,
        minAccountAge: 0,
        channelId: null,
      },
    },
    welcomeConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        channelId: null,
        message: 'Hello {user} welcome to {server}!',
        embed: false,
      },
    },
    farewellConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        channelId: null,
        message: 'Goodbye {user}, we will miss you!',
        embed: false,
      },
    },
    boosterConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        channelId: null,
        message: 'Thank you {user} for boosting {server}!',
      },
    },
    levelupConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        channelId: null,
      },
    },
    autoroleConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        humanRoles: [],
        botRoles: [],
      },
    },
    birthdayConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        channelId: null,
        roleId: null,
      },
    },
    stickyConfig: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        channels: [],
      },
    },
    autoRoles: { type: [String], default: [] },
    botAutoRoles: { type: [String], default: [] },
    djRole: { type: String, default: null },
    modRole: { type: String, default: null },
    adminRole: { type: String, default: null },
    muteRole: { type: String, default: null },
    jailRole: { type: String, default: null },
    ticketCategory: { type: String, default: null },
    ticketStaffRole: { type: String, default: null },
    ticketLogChannel: { type: String, default: null },
    modLogChannel: { type: String, default: null },
    levelUpChannel: { type: String, default: null },
    levelUpMessage: { type: String, default: 'GG {user}, you leveled up to level {level}!' },
    levelRoles: {
      type: [{ level: Number, roleId: String }],
      default: [],
    },
    xpMultiplier: { type: Number, default: 1.0 },
    xpCooldown: { type: Number, default: 60 },
    weeklyXpReset: { type: Boolean, default: false },
    prestigeEnabled: { type: Boolean, default: false },
    economyEnabled: { type: Boolean, default: true },
    musicEnabled: { type: Boolean, default: true },
    giveawayEnabled: { type: Boolean, default: true },
    ticketsEnabled: { type: Boolean, default: true },
    reactionRolesEnabled: { type: Boolean, default: true },
    caseId: { type: Number, default: 0 },
  },
  { timestamps: true },
);

GuildSchema.index({ guildId: 1 });

export const GuildModel = mongoose.model<IGuild>('Guild', GuildSchema);
