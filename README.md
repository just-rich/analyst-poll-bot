# Analyst Poll Bot

Clone of my public [analyst-poll-bot](https://github.com/just-rich/analyst-poll-bot) make any updates to it if any are done here.

## Overview

Analyst Poll Bot is a Discord bot designed to facilitate daily polls in specific channels of a Discord server. It automates the process of collecting user feedback on whether they were "green" or "red" for the day following a specific analyst. The bot also logs these results, providing both daily and all-time statistics for each poll. It stores all the poll results in a database using SQLite.

It updates the poll message in real-time to show the current results. It sends a message to a specified log channel that updates in real-time to show daily & all time results for each channel a poll is in.

## Features

- **Automated Polls**: Polls are automatically posted Monday-Friday at 1:05 PM PST in specified channels.
- **Manual Poll Trigger**: Polls can be manually triggered using the `!startpolls` command. *This simulates as if a daily poll has been sent, for testing.*
- **User Interaction**: Users can interact with the poll by selecting one of the options: "Green", "Red", or "Did not follow/trade".
- **Result Logging**: Daily and all-time results are logged in a specified channel, including the number of votes and their percentages.
- **Poll Disabling**: Polls are automatically disabled after 10 hours to prevent further interactions.

## How It Works

### Dependencies

- **discord.js**: A powerful JavaScript library for interacting with the Discord API.
- **node-cron**: A cron-like and not-cron-like job scheduler for Node.js.
- **Database**: A custom database module for storing and retrieving poll results.

### Setup

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/just-rich/analyst-poll-bot.git
   cd poll-bot
   ```

2. **Install Dependencies**:
   ```sh
   npm install
   ```

3. **Configuration**:
   Create a `config.json` file in the root directory with the following structure:
   ```json
   {
     "token": "YOUR_DISCORD_BOT_TOKEN",
     "pollChannels": ["CHANNEL_ID_1", "CHANNEL_ID_2"],
     "logChannelId": "LOG_CHANNEL_ID"
   }
   ```
   - `token`: Your Discord bot token.
   - `pollChannels`: An array of channel IDs where polls will be posted.
   - `logChannelId`: The channel ID where poll results will be logged.

4. **Run the Bot**:
   ```sh
   node index.js
   ```

### File Structure

- **index.js**: The main entry point of the bot. It initializes the Discord client, schedules the daily polls, and listens for manual poll triggers.
- **pollHandler.js**: Contains functions for posting polls, collecting results, updating messages, and logging results.
- **database.js**: Handles the storage and retrieval of poll results from the database.

## Conclusion

Analyst Poll Bot is a powerful tool for automating daily polls in Discord servers, collecting user feedback, and providing detailed logs of poll results.

---
slapped together by [rich](https://richw.xyz)
