import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';
import { BirthdayModel, GuildModel } from '../../models';

export default new Command({
  name: 'birthday',
  description: 'Manage birthdays',
  category: 'birthday',
  type: 'both',
  options: [
    { name: 'action', description: 'set, remove, list, or channel', type: 'string', required: true, choices: [{ name: 'set', value: 'set' }, { name: 'remove', value: 'remove' }, { name: 'list', value: 'list' }, { name: 'channel', value: 'channel' }] },
    { name: 'day', description: 'Day of month (1-31)', type: 'integer', required: false },
    { name: 'month', description: 'Month (1-12)', type: 'integer', required: false },
    { name: 'channel', description: 'Birthday channel', type: 'channel', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let action: string;
    if (isSlash) action = interaction.options.getString('action', true);
    else {
      const args = (interaction as any).args as string[];
      action = args?.[0] ?? 'list';
    }

    if (action === 'set') {
      let day: number, month: number;
      if (isSlash) {
        day = interaction.options.getInteger('day', true);
        month = interaction.options.getInteger('month', true);
      } else {
        const args = (interaction as any).args as string[];
        day = parseInt(args?.[1] ?? '1', 10);
        month = parseInt(args?.[2] ?? '1', 10);
      }
      await client.birthday.setBirthday(interaction.user?.id ?? (interaction as any).author?.id, guild.id, day, month, null);
      await interaction.reply({ content: `✅ Birthday set to ${day}/${month}!` });
    } else if (action === 'remove') {
      await client.birthday.removeBirthday(interaction.user?.id ?? (interaction as any).author?.id, guild.id);
      await interaction.reply({ content: '✅ Birthday removed.' });
    } else if (action === 'list') {
      const birthdays = await client.birthday.getBirthdays(guild.id);
      if (birthdays.length === 0) { await interaction.reply({ content: 'No birthdays registered.', ephemeral: true }); return; }
      const list = birthdays.map((b) => `<@${b.userId}> — ${b.day}/${b.month}`).join('\n');
      await interaction.reply({ content: `🎂 **Birthdays:**\n${list}` });
    } else if (action === 'channel') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({ content: 'Admin only.', ephemeral: true }); return;
      }
      let channelId: string;
      if (isSlash) channelId = interaction.options.getChannel('channel')?.id ?? guild.id;
      else {
        const args = (interaction as any).args as string[];
        channelId = args?.[1]?.replace(/[<#>]/g, '') || guild.id;
      }
      await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $set: { 'birthdayConfig.channelId': channelId } }, { upsert: true });
      await client.cache.invalidate('guild', guild.id);
      await interaction.reply({ content: `✅ Birthday channel set!` });
    }
  },
});
