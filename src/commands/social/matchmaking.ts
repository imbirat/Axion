import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'matchmaking',
  description: 'Find your match percentage with another user',
  category: 'social',
  type: 'both',
  options: [
    { name: 'user', description: 'The user to match with', type: 'user', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    let target;
    if (isSlash) target = interaction.options.getUser('user', true);
    else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await client.users.fetch(id).catch(() => null) : null;
    }
    if (!target) { await interaction.reply({ content: 'Invalid user.', ephemeral: true }); return; }
    if (target.id === (interaction.user?.id ?? (interaction as any).author?.id)) {
      await interaction.reply({ content: 'You cannot match with yourself!', ephemeral: true }); return;
    }

    const match = Math.floor(Math.random() * 101);
    const hearts = match > 80 ? '💖' : match > 60 ? '💕' : match > 40 ? '💗' : '💔';
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle('💘 Matchmaking')
      .setDescription(`${interaction.user ?? (interaction as any).author} ❤️ ${target}\n\n**Match: ${match}%** ${hearts}`);

    if (isSlash) await interaction.reply({ embeds: [embed] });
    else await (interaction as any).reply({ embeds: [embed] });
  },
});
