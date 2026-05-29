import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'poll',
  description: 'Create, end, or view results of a poll',
  category: 'polls',
  permissions: [PermissionFlagsBits.ManageMessages],
  type: 'both',
  options: [
    { name: 'action', description: 'create, end, or results', type: 'string', required: true, choices: [{ name: 'create', value: 'create' }, { name: 'end', value: 'end' }, { name: 'results', value: 'results' }] },
    { name: 'question', description: 'Poll question (for create)', type: 'string', required: false },
    { name: 'options', description: 'Comma-separated options (2-10) (for create)', type: 'string', required: false },
    { name: 'duration', description: 'Duration e.g. 1h, 1d (for create)', type: 'string', required: false },
    { name: 'message_id', description: 'Message ID (for end/results)', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let action: string;
    if (isSlash) action = interaction.options.getString('action', true);
    else {
      const args = (interaction as any).args as string[];
      action = args?.[0] ?? 'create';
    }

    if (action === 'create') {
      let question: string, optionsStr: string, durationStr = '1h';
      if (isSlash) {
        question = interaction.options.getString('question', true);
        optionsStr = interaction.options.getString('options', true);
        durationStr = interaction.options.getString('duration') ?? '1h';
      } else {
        const args = (interaction as any).args as string[];
        question = args?.[1] ?? 'Poll';
        optionsStr = args?.slice(2).join(' ') ?? 'Yes,No';
      }

      const opts = optionsStr.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      if (opts.length < 2 || opts.length > 10) {
        await interaction.reply({ content: 'Need 2-10 options, comma-separated.', ephemeral: true });
        return;
      }

      const { default: ms } = await import('ms');
      const duration = ms(durationStr) ?? null;

      await interaction.deferReply();
      const result = await client.poll.createPoll({
        channelId: interaction.channelId, guildId: guild.id, question, options: opts, multiChoice: false, requiredRole: null, duration,
      });
      await interaction.editReply({ content: `📊 Poll created! Message ID: ${result.messageId}` });
    } else if (action === 'end' || action === 'results') {
      let msgId: string;
      if (isSlash) msgId = interaction.options.getString('message_id', true);
      else {
        const args = (interaction as any).args as string[];
        msgId = args?.[1] ?? '';
      }
      if (!msgId) { await interaction.reply({ content: 'Message ID required.', ephemeral: true }); return; }

      if (action === 'end') {
        await client.poll.endPoll(msgId);
        await interaction.reply({ content: 'Poll ended.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Check the poll message for results.', ephemeral: true });
      }
    }
  },
});
