import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'nickname',
  description: 'Change a user\'s nickname',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ManageNicknames],
  botPermissions: [PermissionFlagsBits.ManageNicknames],
  type: 'both',
  options: [
    { name: 'user', description: 'The user', type: 'user', required: true },
    { name: 'nickname', description: 'New nickname', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let target, nickname: string;
    if (isSlash) {
      target = interaction.options.getMember('user');
      nickname = interaction.options.getString('nickname', true);
    } else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await guild.members.fetch(id).catch(() => null) : null;
      nickname = args?.slice(1).join(' ') ?? '';
    }
    if (!target) { await interaction.reply({ content: 'User not found.', ephemeral: true }); return; }

    await target.setNickname(nickname);
    if (isSlash) await interaction.reply({ content: `Changed ${target.user.tag}'s nickname to ${nickname}.` });
    else await (interaction as any).reply(`Changed ${target.user.tag}'s nickname to ${nickname}.`);
  },
});
