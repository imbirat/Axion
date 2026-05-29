import { Event } from '../../structures/Event';
import { Message, ChannelType, PermissionFlagsBits } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';
import { GuildModel, AFKModel, XPModel } from '../../models';
import { XP_CONFIG, LEVEL_FORMULA } from '../../constants';

export default new Event({
  name: 'messageCreate',
  async execute(message: Message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const client = message.client as AxionClient;

    const guildConfig = await GuildModel.findOne({ guildId: message.guild.id });
    const prefixes = guildConfig?.prefix ?? ['.'];

    const hasPrefix = prefixes.some((p) => message.content.startsWith(p));

    if (hasPrefix) {
      const prefix = prefixes.find((p) => message.content.startsWith(p))!;
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();

      if (commandName) {
        const command = client.getCommand(commandName);
        if (command && (command.type === 'prefix' || command.type === 'both')) {
          await client.commandHandler.executePrefixCommand(command, message, args);
        }
      }
      return;
    }

    if (message.channel.type === ChannelType.GuildText && message.mentions.users.size > 0) {
      for (const mentionedUser of message.mentions.users.values()) {
        if (mentionedUser.bot) continue;

        const afk = await AFKModel.findOne({
          userId: mentionedUser.id,
          guildId: message.guild.id,
        });

        if (afk) {
          try {
            const dmChannel = await mentionedUser.createDM();
            await dmChannel.send({
              content: `You got mentioned in **${message.guild.name}**\nChannel: ${message.channel}\nMessage: ${message.content}`,
            }).catch(() => {});
          } catch {}
        }
      }
    }

    if (message.channel.type === ChannelType.GuildText) {
      try {
        const { StickyMessageModel } = await import('../../models');
        const sticky = await StickyMessageModel.findOne({
          channelId: message.channel.id,
          guildId: message.guild.id,
        });

        if (sticky) {
          if (sticky.lastMessageId) {
            const lastMsg = await message.channel.messages.fetch(sticky.lastMessageId).catch(() => null);
            if (lastMsg) {
              await lastMsg.delete().catch(() => {});
            }
          }

          const { EmbedBuilder } = await import('discord.js');
          let sent: Message;
          if (sticky.isEmbed) {
            const embed = new EmbedBuilder()
              .setTitle(sticky.embedTitle || 'Sticky Message')
              .setDescription(sticky.content)
              .setColor(parseInt(sticky.embedColor.replace('#', ''), 16) || 0x5865f2);
            sent = await message.channel.send({ embeds: [embed] });
          } else {
            sent = await message.channel.send(sticky.content);
          }

          sticky.lastMessageId = sent.id;
          await sticky.save();
        }
      } catch {}
    }

    if (message.channel.type === ChannelType.GuildText && message.guild) {
      const xpData = await XPModel.findOne({
        userId: message.author.id,
        guildId: message.guild.id,
      });

      const cooldown = guildConfig?.xpCooldown ?? XP_CONFIG.messageCooldown;
      const now = Date.now();

      if (xpData?.lastMessage) {
        const timeSince = now - xpData.lastMessage.getTime();
        if (timeSince < cooldown) return;
      }

      const multiplier = guildConfig?.xpMultiplier ?? 1;
      const xpGain = Math.floor((Math.random() * (XP_CONFIG.maxMessageXp - XP_CONFIG.minMessageXp) + XP_CONFIG.minMessageXp) * multiplier);

      const levelFormula = (level: number) => LEVEL_FORMULA(level);

      const currentLevel = xpData?.level ?? 0;
      const currentXp = (xpData?.xp ?? 0) + xpGain;
      const neededXp = levelFormula(currentLevel);

      let newLevel = currentLevel;
      let remainingXp = currentXp;

      if (currentXp >= neededXp) {
        newLevel = currentLevel + 1;
        remainingXp = currentXp - neededXp;

        if (guildConfig?.levelupConfig?.enabled && guildConfig?.levelupConfig?.channelId) {
          const { TextChannel } = await import('discord.js');
          const channel = message.guild.channels.cache.get(guildConfig.levelupConfig.channelId) as TextChannel;
          if (channel) {
            const levelMsg = (guildConfig?.levelUpMessage ?? 'GG {user}, you leveled up to level {level}!')
              .replace(/{user}/g, `<@${message.author.id}>`)
              .replace(/{level}/g, String(newLevel));
            await channel.send({ content: levelMsg }).catch(() => {});
          }
        }

        const levelRoles = guildConfig?.levelRoles ?? [];
        for (const lr of levelRoles) {
          if (lr.level === newLevel) {
            const role = message.guild.roles.cache.get(lr.roleId);
            if (role) {
              await message.member?.roles.add(role).catch(() => {});
            }
          }
        }
      } else {
        remainingXp = currentXp;
      }

      await XPModel.findOneAndUpdate(
        { userId: message.author.id, guildId: message.guild.id },
        {
          $set: {
            xp: remainingXp,
            level: newLevel,
            lastMessage: new Date(),
          },
          $inc: { totalXp: xpGain, weeklyXp: xpGain },
        },
        { upsert: true },
      );
    }
  },
});
