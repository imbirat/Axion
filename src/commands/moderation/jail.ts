import { Command } from '../../structures/Command';
import { PermissionFlagsBits, ChannelType, OverwriteType } from 'discord.js';
import { GuildModel } from '../../models';

export default new Command({
  name: 'jail',
  description: 'Jail a user (restrict to jail channel)',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
  type: 'both',
  options: [
    { name: 'user', description: 'The user to jail', type: 'user', required: true },
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

    const guildConfig = await GuildModel.findOne({ guildId: guild.id });
    let jailRole = guildConfig?.jailRole ? guild.roles.cache.get(guildConfig.jailRole) : null;

    if (!jailRole) {
      jailRole = await guild.roles.create({ name: 'Jailed', permissions: [], color: '#808080' });
      await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $set: { jailRole: jailRole.id } }, { upsert: true });
    }

    await target.roles.set([jailRole.id]);
    await interaction.reply({ content: `🔒 ${target.user.tag} has been jailed.` });

    await client.cache.invalidate('guild', guild.id);
  },
});
