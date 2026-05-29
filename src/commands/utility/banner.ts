import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'banner',
  description: 'Shows a user\'s banner',
  category: 'utility',
  type: 'both',
  options: [
    { name: 'user', description: 'The user to get the banner of', type: 'user', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    let target = interaction.user;
    if (isSlash) {
      target = interaction.options.getUser('user') ?? interaction.user;
    } else {
      const args = (interaction as any).args as string[] | undefined;
      const mention = args?.[0]?.replace(/[<@!>]/g, '');
      if (mention) target = await client.users.fetch(mention).catch(() => interaction.user);
    }

    const user = await client.users.fetch(target.id, { force: true });
    const bannerURL = user.bannerURL({ size: 1024 });

    if (!bannerURL) {
      const msg = `${target.tag} does not have a banner.`;
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(`${target.tag}'s Banner`)
      .setImage(bannerURL);

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await (interaction as any).reply({ embeds: [embed] });
    }
  },
});
