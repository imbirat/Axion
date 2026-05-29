import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'userinfo',
  description: 'Shows information about a user',
  category: 'utility',
  type: 'both',
  options: [
    { name: 'user', description: 'The user to get info about', type: 'user', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) {
      const msg = 'This command can only be used in a server.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    let target;
    if (isSlash) {
      target = interaction.options.getUser('user') ?? interaction.user;
    } else {
      const args = (interaction as any).args as string[] | undefined;
      const mention = args?.[0]?.replace(/[<@!>]/g, '');
      target = mention ? await client.users.fetch(mention).catch(() => interaction.author) : interaction.author;
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    const joinedAt = member?.joinedAt;
    const roles = member?.roles.cache.filter((r) => r.id !== guild.id).map((r) => r.toString()).join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(target.tag)
      .setThumbnail(target.displayAvatarURL({ size: 1024 }))
      .addFields(
        { name: 'ID', value: target.id, inline: true },
        { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
      );

    if (joinedAt) {
      embed.addFields({ name: 'Joined', value: `<t:${Math.floor(joinedAt.getTime() / 1000)}:R>`, inline: true });
    }

    if (roles !== 'None') {
      embed.addFields({ name: `Roles [${member?.roles.cache.filter((r) => r.id !== guild.id).size ?? 0}]`, value: roles });
    }

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await (interaction as any).reply({ embeds: [embed] });
    }
  },
});
