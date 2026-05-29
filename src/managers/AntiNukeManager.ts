import { Guild, GuildMember, EmbedBuilder, TextChannel, PermissionFlagsBits } from 'discord.js';
import { AxionClient } from '../structures/AxionClient';
import { GuildModel } from '../models';
import { EMBED_COLORS, OWNER_ID } from '../constants';

interface NukeEvent {
  guildId: string;
  userId: string;
  type: string;
  timestamp: number;
}

export class AntiNukeManager {
  private client: AxionClient;
  private events: Map<string, NukeEvent[]>;

  constructor(client: AxionClient) {
    this.client = client;
    this.events = new Map();
  }

  public async recordEvent(guildId: string, userId: string, type: string): Promise<void> {
    const key = `${guildId}:${userId}`;
    const events = this.events.get(key) ?? [];
    events.push({ guildId, userId, type, timestamp: Date.now() });

    const recent = events.filter((e) => Date.now() - e.timestamp < 10000);
    this.events.set(key, recent);

    const guildConfig = await GuildModel.findOne({ guildId });
    if (!guildConfig?.antinukeConfig?.enabled) return;

    const config = guildConfig.antinukeConfig;
    if (config.whitelist.includes(userId)) return;

    if (recent.length >= config.threshold) {
      await this.triggerProtection(guildId, userId, config.action);
    }
  }

  private async triggerProtection(
    guildId: string,
    userId: string,
    action: string,
  ): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) return;

    try {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) return;

      const owner = await this.client.users.fetch(OWNER_ID);

      switch (action) {
        case 'lockdown': {
          for (const channel of guild.channels.cache.values()) {
            try {
              if (channel.isTextBased() || channel.isVoiceBased()) {
                await channel.permissionOverwrites.edit(guild.id, {
                  SendMessages: false,
                }).catch(() => {});
              }
            } catch {}
          }
          break;
        }
        case 'strip': {
          const botRole = guild.members.me?.roles.highest;
          if (botRole) {
            const roles = member.roles.cache
              .filter((r) => r.id !== guild.id && r.position < botRole.position)
              .map((r) => r.id);
            for (const roleId of roles) {
              await member.roles.remove(roleId).catch(() => {});
            }
          }
          break;
        }
        case 'ban': {
          await guild.bans.create(userId, { reason: 'Anti-nuke: Suspicious activity detected' }).catch(() => {});
          break;
        }
      }

      const logEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.error)
        .setTitle('🛡️ Anti-Nuke Triggered')
        .setDescription(`**User:** ${member.user.tag} (<@${userId}>)\n**Action:** ${action}\n**Threshold:** ${this.events.get(`${guildId}:${userId}`)?.length ?? 0} events in 10s`)
        .setTimestamp();

      await owner.send({ embeds: [logEmbed] }).catch(() => {});

      const guildConfig = await GuildModel.findOne({ guildId });
      if (guildConfig?.modLogChannel) {
        const logChannel = this.client.channels.cache.get(guildConfig.modLogChannel) as TextChannel;
        if (logChannel) {
          await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }
    } catch {
      // Anti-nuke action failed
    }
  }

  public checkEvent(guildId: string, userId: string, type: string): boolean {
    const key = `${guildId}:${userId}`;
    const events = this.events.get(key) ?? [];
    const recent = events.filter((e) => Date.now() - e.timestamp < 10000);
    return recent.filter((e) => e.type === type).length >= 3;
  }
}
