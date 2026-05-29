import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';
import { GuildModel } from '../../models';

export default new Command({
  name: 'autorole',
  description: 'Manage auto-role assignments',
  category: 'autoroles',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'action', description: 'add, remove, or list', type: 'string', required: true, choices: [{ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' }, { name: 'list', value: 'list' }] },
    { name: 'role', description: 'Role to add/remove', type: 'role', required: false },
    { name: 'type', description: 'human or bot', type: 'string', required: false, choices: [{ name: 'human', value: 'human' }, { name: 'bot', value: 'bot' }] },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let action: string, role: any = null, type = 'human';
    if (isSlash) {
      action = interaction.options.getString('action', true);
      role = interaction.options.getRole('role');
      type = interaction.options.getString('type') ?? 'human';
    } else {
      const args = (interaction as any).args as string[];
      action = args?.[0] ?? 'list';
      const roleId = args?.[1]?.replace(/[<@&>]/g, '');
      if (roleId) role = guild.roles.cache.get(roleId);
      type = args?.[2] ?? 'human';
    }

    const config = await GuildModel.findOne({ guildId: guild.id }) ?? { autoRoles: [], botAutoRoles: [] };
    const key = type === 'bot' ? 'botAutoRoles' : 'autoRoles';

    if (action === 'add') {
      if (!role) { await interaction.reply({ content: 'Invalid role.', ephemeral: true }); return; }
      await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $addToSet: { [key]: role.id } }, { upsert: true });
      await client.cache.invalidate('guild', guild.id);
      await interaction.reply({ content: `✅ ${role} will be auto-assigned to ${type} members.` });
    } else if (action === 'remove') {
      if (!role) { await interaction.reply({ content: 'Invalid role.', ephemeral: true }); return; }
      await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $pull: { [key]: role.id } });
      await client.cache.invalidate('guild', guild.id);
      await interaction.reply({ content: `✅ ${role} removed from auto-role list.` });
    } else {
      const roles = config[key as keyof typeof config] as string[] ?? [];
      if (roles.length === 0) {
        await interaction.reply({ content: `No ${type} auto-roles configured.`, ephemeral: true });
      } else {
        const roleMentions = roles.map((r) => `<@&${r}>`).join(', ');
        await interaction.reply({ content: `${type} auto-roles: ${roleMentions}` });
      }
    }
  },
});
