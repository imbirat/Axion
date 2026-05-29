import { Command } from '../../structures/Command';
import { GuildMember } from 'discord.js';

export default new Command({
  name: 'play',
  description: 'Play a song from YouTube, Spotify, or Apple Music',
  category: 'music',
  type: 'both',
  options: [
    { name: 'query', description: 'Song name or URL', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const member = isSlash
      ? interaction.member as GuildMember
      : (interaction as any).member as GuildMember;

    if (!member.voice.channel) {
      if (isSlash) await interaction.reply({ content: 'You must be in a voice channel.', ephemeral: true });
      else await (interaction as any).reply('You must be in a voice channel.');
      return;
    }

    let query: string;
    if (isSlash) {
      query = interaction.options.getString('query', true);
    } else {
      const args = (interaction as any).args as string[];
      query = args?.join(' ') ?? '';
    }

    if (!query) {
      if (isSlash) await interaction.reply({ content: 'Please provide a song name or URL.', ephemeral: true });
      else await (interaction as any).reply('Please provide a song name or URL.');
      return;
    }

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) return;

    if (isSlash) await interaction.deferReply();

    try {
      const result = await client.music.play(guild.id, query, member, channel as any);

      if (result.type === 'playlist') {
        const msg = `✅ Added playlist **${result.playlistName ?? 'Unknown'}** to the queue.`;
        if (isSlash) await interaction.editReply({ content: msg });
        else await (interaction as any).reply(msg);
      } else if (result.type === 'search') {
        const msg = `✅ Added ${result.track ? `**${result.track.title}**` : 'track'} to the queue.`;
        if (isSlash) await interaction.editReply({ content: msg });
        else await (interaction as any).reply(msg);
      } else {
        const msg = `✅ Added **${result.track?.title ?? 'Unknown'}** to the queue.`;
        if (isSlash) await interaction.editReply({ content: msg });
        else await (interaction as any).reply(msg);
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to play track.';
      if (isSlash) {
        if (interaction.deferred) await interaction.editReply({ content: msg });
        else await interaction.reply({ content: msg, ephemeral: true });
      } else {
        await (interaction as any).reply(msg);
      }
    }
  },
});
