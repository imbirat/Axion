import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';
import { GuildModel } from '../../models';

export default new Command({
  name: 'setcustommessage',
  description: 'Set custom welcome/farewell/levelup/booster messages',
  category: 'welcome',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'type', description: 'Message type', type: 'string', required: true, choices: [{ name: 'welcome', value: 'welcome' }, { name: 'farewell', value: 'farewell' }, { name: 'levelup', value: 'levelup' }, { name: 'booster', value: 'booster' }] },
    { name: 'embed', description: 'Render as embed?', type: 'boolean', required: true },
    { name: 'message', description: 'Message content. Use {user}, {server}, {membercount}', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let type: string, embedFlag: boolean, message: string;
    if (isSlash) {
      type = interaction.options.getString('type', true);
      embedFlag = interaction.options.getBoolean('embed', true);
      message = interaction.options.getString('message', true);
    } else {
      const args = (interaction as any).args as string[];
      type = args?.[0] ?? 'welcome';
      embedFlag = args?.[1] === 'true';
      message = args?.slice(2).join(' ') ?? 'Hello {user}!';
    }

    const updatePath = type === 'levelup' ? 'levelUpMessage' : `${type}Config`;

    if (type === 'levelup') {
      await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $set: { levelUpMessage: message } }, { upsert: true });
    } else {
      await GuildModel.findOneAndUpdate(
        { guildId: guild.id },
        { $set: { [`${updatePath}.message`]: message, [`${updatePath}.embed`]: embedFlag } },
        { upsert: true },
      );
    }

    await client.cache.invalidate('guild', guild.id);
    const msg = `✅ ${type} message updated!`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
