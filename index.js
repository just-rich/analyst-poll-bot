const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const config = require('./config.json');
const { startPolls } = require('./pollHandler');
const cron = require('node-cron');

// Initialize the Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Set the client as a global variable to be accessible in other modules
global.client = client;

let lastPollDate = null; // Store the date of the last started poll
let simulatedDayCounter = 0; // Counter to simulate a new day each time !startpolls is used

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Schedule the poll to be posted daily at 1:15 PM PST
  cron.schedule('15 13 * * *', () => {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    if (lastPollDate !== date) {
      startPolls(date);
      lastPollDate = date;
      console.log('Polls have been started.');
    } else {
      console.log('Polls have already been started for today.');
    }
  }, {
    timezone: "America/Los_Angeles"
  });
});

// Listen for messages
client.on('messageCreate', async (message) => {
  if (message.content === '!startpolls') {
    // Check if the user has the "Administrator" permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('You do not have permission to use this command.');
    }

    const simulatedDate = new Date().toISOString().split('T')[0] + `-simulated-${simulatedDayCounter++}`;
    startPolls(simulatedDate);
    message.channel.send('Polls have been started for simulated date: ' + simulatedDate);
  }
});

client.login(config.token);
