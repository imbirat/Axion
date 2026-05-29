import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands: SlashCommandBuilder[] = [];

// Utility commands
commands.push(new SlashCommandBuilder().setName('help').setDescription('Shows the help menu'));
commands.push(new SlashCommandBuilder().setName('ping').setDescription('Shows bot latency'));
commands.push(new SlashCommandBuilder().setName('botinfo').setDescription('Shows bot information'));
commands.push(new SlashCommandBuilder().setName('serverinfo').setDescription('Shows server information'));
commands.push(new SlashCommandBuilder().setName('userinfo').setDescription('Shows user information').addUserOption((o) => o.setName('user').setDescription('Target user')));
commands.push(new SlashCommandBuilder().setName('avatar').setDescription('Shows user avatar').addUserOption((o) => o.setName('user').setDescription('Target user')));
commands.push(new SlashCommandBuilder().setName('banner').setDescription('Shows user banner').addUserOption((o) => o.setName('user').setDescription('Target user')));
commands.push(new SlashCommandBuilder().setName('membercount').setDescription('Shows member count'));
commands.push(new SlashCommandBuilder().setName('snipe').setDescription('Shows last deleted message'));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

async function main() {
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands.map((c) => c.toJSON()) });
    console.log('Commands registered successfully');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
}

main();
