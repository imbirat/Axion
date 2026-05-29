import { Command } from '../../structures/Command';
import { EmbedBuilder, ChannelType } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'serverinfo',
  description: 'Shows information about the server',
  category: 'utility',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) {
      const msg = 'This command can only be used in a server.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const members = await guild.members.fetch();
    const bots = members.filter((m) => m.user.bot).size;
    const humans = members.size - bots;
    const channels = guild.channels.cache;
    const textChannels = channels.filter((c) => c.type === ChannelType.GuildText).size;
    const voiceChannels = channels.filter((c) => c.type === ChannelType.GuildVoice).size;
    const categories = channels.filter((c) => c.type === ChannelType.GuildCategory).size;

    const roles = guild.roles.cache.size;
    const boosts = guild.premiumSubscriptionCount ?? 0;
    const boostLevel = guild.premiumTier;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 1024 }) ?? null)
      .addFields(
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Members', value: `👤 ${humans} | 🤖 ${bots}`, inline: true },
        { name: 'Channels', value: `💬 ${textChannels} | 🔊 ${voiceChannels} | 📁 ${categories}`, inline: true },
        { name: 'Roles', value: String(roles), inline: true },
        { name: 'Boosts', value: `✨ ${boosts} (Level ${boostLevel})`, inline: true },
      );

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await (interaction as any).reply({ embeds: [embed] });
    }
  },
});
