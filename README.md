# Axion

All-in-one Discord bot providing premium features for free.

## Overview

Axion is a complete, production-ready Discord bot built with TypeScript, discord.js v14, and enterprise-grade architecture. It features music playback, moderation, leveling, economy, giveaways, tickets, AI (Gemini), and much more — all in a single, scalable bot.

## Features

- **Moderation** — Ban, kick, warn, mute, lock, jail, slowmode, clear with case tracking
- **Leveling** — XP system with rank cards, role rewards, prestige, weekly resets
- **Economy** — Wallet/bank system, daily, work, fish, rob, coinflip, give
- **Music** — YouTube, Spotify, Apple Music via Lavalink + Kazagumo
- **Giveaways** — Persistent giveaways with scheduler
- **Tickets** — Full ticket system with transcripts
- **AI** — Gemini 2.5 Flash powered chat, summarization, embed gen, insights
- **Logging** — Configurable per-event logging channels
- **Auto-mod** — Spam, links, invites, caps, word filters
- **Anti-Nuke** — Server protection against mass actions
- **Welcome/Farewell** — Customizable join/leave messages
- **Birthdays** — Automated birthday announcements
- **Polls** — Advanced multi-option polls with live results
- **Quotes** — Guild-scoped quote management
- **Reaction/Button Roles** — Self-assignable role panels
- **Verification** — Button, math captcha, or image captcha verification
- **Analytics** — Invite tracking, activity stats, command metrics

## Prerequisites

- Node.js 22+
- MongoDB 7+
- Redis 7+
- Lavalink 4.0.7 (self-hosted)
- Discord Application with Bot token

## Installation

```bash
git clone <repository-url>
cd axion
npm install
cp .env.example .env
```

Edit `.env` with your configuration, then:

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for all required variables.

## Lavalink Connection (Self-hosted)

Axion uses Lavalink for music playback. You must host your own Lavalink server:

1. Download Lavalink from [GitHub](https://github.com/lavalink-devs/Lavalink/releases)
2. Create `application.yml` with your configuration
3. Run `java -jar Lavalink.jar`
4. Set `LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD` in `.env`

Example `application.yml`:
```yaml
server:
  port: 2333
lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
```

## Music Setup

In addition to Lavalink, configure Spotify credentials for LavaSrc:
- Go to https://developer.spotify.com/dashboard
- Create an application
- Copy Client ID and Client Secret to `.env`

## Gemini AI Setup

1. Go to https://aistudio.google.com/app/apikey
2. Create an API key
3. Set `GEMINI_API_KEY` in `.env`

## Railway Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/...)

1. Connect your GitHub repository
2. Set all environment variables in Railway dashboard
3. Deploy

## PM2 Deployment

```bash
npm run build
npm run pm2
```

## Docker Deployment

```bash
docker-compose up -d
```

This starts the bot, MongoDB, and Redis. Lavalink must be hosted separately.

## Command Reference

### Utility
- `/help` — Show help menu
- `/ping` — Bot latency
- `/botinfo` — Bot information
- `/serverinfo` — Server information
- `/userinfo` — User information
- `/avatar` — User avatar
- `/banner` — User banner
- `/membercount` — Member count
- `/snipe` — Last deleted message
- `/afk` — Set AFK status
- `/afkend` — Remove AFK

### Moderation
- `/ban` — Ban a user
- `/kick` — Kick a user
- `/warn` — Warn a user
- `/mute` — Timeout a user
- `/unmute` — Remove timeout
- `/lock` — Lock channel
- `/unlock` — Unlock channel
- `/slowmode` — Set slowmode
- `/clear` — Clear messages
- `/nickname` — Change nickname

### Leveling
- `/profile xp` — XP profile
- `/leaderboard xp` — XP leaderboard
- `/addxp` — Add XP (admin)
- `/removexp` — Remove XP (admin)

### Economy
- `/profile economy` — Economy profile
- `/leaderboard economy` — Economy leaderboard
- `/daily` — Daily reward
- `/work` — Work for coins
- `/fish` — Go fishing
- `/rob` — Rob a user
- `/coinflip` — Bet on coinflip
- `/deposit` — Deposit to bank
- `/bank` — Withdraw from bank
- `/give` — Give coins

### Music
- `/play` — Play a song
- `/skip` — Skip track
- `/queue` — View queue
- `/nowplaying` — Current track
- `/lyrics` — Get lyrics

### Other
- `/setprefix` — Set custom prefix
- `/config` — Configure modules
- `/giveaway` — Create/end/reroll giveaways
- `/birthday` — Manage birthdays
- `/poll` — Create/end polls
- `/quote` — Manage quotes
- `/sticky` — Manage sticky messages
- `/autorole` — Auto-role management
- `/setcustommessage` — Welcome/farewell messages
- `/ask` — Ask AI a question
- `/summarize` — AI text summarization
- `/meme` — Random meme
- `/8ball` — Magic 8-ball
- `/anime` — Anime search
- `/confess` — Anonymous confession
- `/truth` / `/dare` — Truth or dare
- `/matchmaking` — Match percentage
- `/dailyquestion` — Daily discussion question

## Troubleshooting

**Music not working:** Ensure Lavalink is running and accessible. Check `LAVALINK_HOST` and `LAVALINK_PORT`.

**AI not working:** Verify `GEMINI_API_KEY` is correct and has access to `gemini-2.5-flash` model.

**Commands not showing:** Run `npm run deploy:commands` or restart the bot.

**Database errors:** Ensure MongoDB is running and `MONGODB_URI` is correct.

## FAQ

**Q: Can I self-host this bot?**
A: Yes. Follow the installation guide above.

**Q: Is Lavalink required?**
A: Only for music features. The bot works without music if Lavalink is not configured.

**Q: What model does the AI use?**
A: Gemini 2.5 Flash (`gemini-2.5-flash`).

**Q: How do I reset my prefix?**
A: Use `/setprefix` to add a new prefix, or reset the database document.

## License

MIT
