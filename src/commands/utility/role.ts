import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'role',
  description: 'Manage roles for users',
  category: 'utility',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'user', description: 'The user', type: 'user', required: true },
    { name: 'role', description: 'The role to add/remove', type: 'role', required: true },
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

    let member, role;
    if (isSlash) {
      member = interaction.options.getMember('user');
      role = interaction.options.getRole('role');
    } else {
      const args = (interaction as any).args as string[];
      const mention = args?.[0]?.replace(/[<@!>]/g, '');
      const roleId = args?.[1]?.replace(/[<@&>]/g, '');
      if (!mention || !roleId) {
        await interaction.reply({ content: 'Usage: /role <user> <role>' });
        return;
      }
      member = await guild.members.fetch(mention).catch(() => null);
      role = guild.roles.cache.get(roleId);
    }

    if (!member || !role) {
      await interaction.reply({ content: 'Invalid user or role.', ephemeral: true });
      return;
    }

    const botMember = guild.members.me;
    if (botMember && role.position >= botMember.roles.highest.position) {
      await interaction.reply({ content: 'I cannot manage that role — it is higher than my highest role.', ephemeral: true });
      return;
    }

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      if (isSlash) await interaction.reply({ content: `Removed ${role} from ${member}.` });
      else await (interaction as any).reply(`Removed ${role} from ${member}.`);
    } else {
      await member.roles.add(role);
      if (isSlash) await interaction.reply({ content: `Added ${role} to ${member}.` });
      else await (interaction as any).reply(`Added ${role} to ${member}.`);
    }
  },
});
