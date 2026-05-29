import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';
import { GuildModel } from '../../models';

export default new Command({
  name: 'setprefix',
  description: 'Set custom prefixes for the server (admin only)',
  category: 'prefix',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'prefix', description: 'New prefix', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let prefix: string;
    if (isSlash) {
      prefix = interaction.options.getString('prefix', true);
    } else {
      const args = (interaction as any).args as string[];
      prefix = args?.[0] ?? '.';
    }

    if (prefix.length > 5) {
      const msg = 'Prefix must be 5 characters or fewer.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const guildConfig = await GuildModel.findOne({ guildId: guild.id });
    const prefixes = guildConfig?.prefix ?? ['.'];

    if (prefixes.includes(prefix)) {
      const msg = `"${prefix}" is already a prefix.`;
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    await GuildModel.findOneAndUpdate(
      { guildId: guild.id },
      { $push: { prefix } },
      { upsert: true },
    );

    await client.cache.invalidate('guild', guild.id);

    const msg = `Prefix "${prefix}" added. Active prefixes: ${[...prefixes, prefix].join(', ')}`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
