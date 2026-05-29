import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'giveaway',
  description: 'Start a giveaway',
  category: 'giveaway',
  permissions: [PermissionFlagsBits.ManageGuild],
  type: 'both',
  options: [
    { name: 'subcommand', description: 'Subcommand', type: 'string', required: true, choices: [{ name: 'start', value: 'start' }, { name: 'end', value: 'end' }, { name: 'reroll', value: 'reroll' }] },
    { name: 'prize', description: 'Prize for the giveaway', type: 'string', required: false },
    { name: 'duration', description: 'Duration (e.g. 1h, 1d)', type: 'string', required: false },
    { name: 'winners', description: 'Number of winners', type: 'integer', required: false },
    { name: 'message_id', description: 'Message ID (for end/reroll)', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    if (isSlash) {
      const sub = interaction.options.getString('subcommand', true);

      if (sub === 'start') {
        const prize = interaction.options.getString('prize') ?? 'A prize!';
        const durationStr = interaction.options.getString('duration') ?? '1h';
        const winners = interaction.options.getInteger('winners') ?? 1;
        const { default: ms } = await import('ms');
        const duration = ms(durationStr);
        if (!duration || duration < 10000) {
          await interaction.reply({ content: 'Invalid duration. Minimum 10s.', ephemeral: true });
          return;
        }

        await interaction.deferReply();
        const result = await client.giveaway.createGiveaway({
          channelId: interaction.channelId,
          guildId: guild.id,
          prize,
          winnerCount: winners,
          duration,
          requiredRole: null,
          requiredInvites: 0,
          bonusEntries: 0,
        });
        await interaction.editReply({ content: `🎉 Giveaway started! Message ID: ${result.messageId}` });
      } else if (sub === 'end') {
        const msgId = interaction.options.getString('message_id', true);
        await client.giveaway.endGiveaway(msgId);
        await interaction.reply({ content: 'Giveaway ended.', ephemeral: true });
      } else if (sub === 'reroll') {
        const msgId = interaction.options.getString('message_id', true);
        const winners = await client.giveaway.rerollGiveaway(msgId);
        if (winners.length > 0) {
          await interaction.reply({ content: `🎉 New winner: <@${winners[0]}>`, ephemeral: true });
        } else {
          await interaction.reply({ content: 'No eligible entrants.', ephemeral: true });
        }
      }
    } else {
      const args = (interaction as any).args as string[];
      const sub = args?.[0];
      if (sub === 'start') {
        const prize = args?.[1] ?? 'A prize!';
        const durationStr = args?.[2] ?? '1h';
        const winners = parseInt(args?.[3] ?? '1', 10);
        const { default: ms } = await import('ms');
        const duration = ms(durationStr);
        if (!duration) { await (interaction as any).reply('Invalid duration.'); return; }
        const result = await client.giveaway.createGiveaway({ channelId: interaction.channelId, guildId: guild.id, prize, winnerCount: winners, duration, requiredRole: null, requiredInvites: 0, bonusEntries: 0 });
        await (interaction as any).reply(`🎉 Giveaway started! Message ID: ${result.messageId}`);
      }
    }
  },
});
