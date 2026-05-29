import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'roleall',
  description: 'Assign a role to every server member',
  category: 'utility',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'role', description: 'The role to assign', type: 'role', required: true },
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

    let role;
    if (isSlash) {
      role = interaction.options.getRole('role');
    } else {
      const args = (interaction as any).args as string[];
      const roleId = args?.[0]?.replace(/[<@&>]/g, '');
      role = guild.roles.cache.get(roleId ?? '');
    }

    if (!role) {
      await interaction.reply({ content: 'Invalid role.', ephemeral: true });
      return;
    }

    const botMember = guild.members.me;
    if (botMember && role.position >= botMember.roles.highest.position) {
      await interaction.reply({ content: 'I cannot assign that role — it is higher than my highest role.', ephemeral: true });
      return;
    }

    if (isSlash) {
      await interaction.reply({ content: `Assigning ${role} to all members. This may take a while...` });
    } else {
      await (interaction as any).reply(`Assigning ${role} to all members. This may take a while...`);
    }

    const members = await guild.members.fetch();
    let assigned = 0;

    for (const [, member] of members) {
      if (member.user.bot) continue;
      if (member.roles.cache.has(role.id)) continue;
      try {
        await member.roles.add(role);
        assigned++;
      } catch {}
    }

    const msg = `Assigned ${role} to ${assigned} members.`;
    if (isSlash) await interaction.editReply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
