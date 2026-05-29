import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'unjail',
  description: 'Release a user from jail',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ModerateMembers],
  type: 'both',
  options: [
    { name: 'user', description: 'The user to unjail', type: 'user', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let target;
    if (isSlash) target = interaction.options.getMember('user');
    else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await guild.members.fetch(id).catch(() => null) : null;
    }
    if (!target) { await interaction.reply({ content: 'User not found.', ephemeral: true }); return; }

    const jailRole = target.roles.cache.find((r) => r.name === 'Jailed');
    if (jailRole) await target.roles.remove(jailRole);

    await interaction.reply({ content: `🔓 ${target.user.tag} has been released from jail.` });
  },
});
