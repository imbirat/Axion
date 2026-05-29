import { Command } from '../../structures/Command';
import ms from 'ms';

export default new Command({
  name: 'reminder',
  description: 'Set a reminder',
  category: 'utility',
  type: 'both',
  options: [
    { name: 'duration', description: 'Time until reminder (e.g. 10m, 1h)', type: 'string', required: true },
    { name: 'reminder', description: 'What to remind you about', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;

    let durationStr: string;
    let reminderText: string;

    if (isSlash) {
      durationStr = interaction.options.getString('duration', true);
      reminderText = interaction.options.getString('reminder', true);
    } else {
      const args = (interaction as any).args as string[];
      durationStr = args?.[0] ?? '10m';
      reminderText = args?.slice(1).join(' ') ?? 'Reminder';
    }

    const duration = ms(durationStr);
    if (!duration || duration < 1000 || duration > 2592000000) {
      const msg = 'Invalid duration. Use e.g. 10m, 1h, 7d (max 30 days).';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const userId = interaction.user?.id ?? (interaction as any).author?.id;
    const endTime = new Date(Date.now() + duration);

    const msg = `⏰ I will remind you in ${durationStr}.`;
    if (isSlash) {
      await interaction.reply({ content: msg });
    } else {
      await (interaction as any).reply(msg);
    }

    setTimeout(async () => {
      try {
        const user = await client.users.fetch(userId);
        await user.send({ content: `⏰ **Reminder:** ${reminderText}` }).catch(() => {});
      } catch {}
    }, duration);
  },
});
