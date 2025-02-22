const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { insertPollResult, getPollResults, getAllTimeResults } = require('./database');
const config = require('./config.json');

let logMessages = {}; // Store the log message IDs for each poll date

async function postPoll(channelId, date) {
  const channel = await client.channels.fetch(channelId);
  const embed = new EmbedBuilder()
    .setTitle('Were you green or red for the day following this analyst?')
    .addFields(
      { name: 'Total', value: '0', inline: false },
      { name: 'Green', value: '0 (0%)', inline: true },
      { name: 'Red', value: '0 (0%)', inline: true },
      { name: 'Did not follow/trade', value: '0 (0%)', inline: true }
    );

  const pollMessage = await channel.send({
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('green').setLabel('Green').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('red').setLabel('Red').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('no_trade').setLabel('Did not follow/trade').setStyle(ButtonStyle.Secondary)
      )
    ]
  });

  const filter = (interaction) => ['green', 'red', 'no_trade'].includes(interaction.customId);
  const collector = pollMessage.createMessageComponentCollector({ filter, time: 10 * 60 * 60 * 1000 });

  const userVotes = new Set(); // Track users who have voted

  collector.on('collect', async (interaction) => {
    if (userVotes.has(interaction.user.id)) {
      await interaction.reply({ content: 'You have already voted in this poll.', ephemeral: true });
      return;
    }

    await interaction.deferUpdate();
    await insertPollResult(channelId, date, interaction.customId);
    userVotes.add(interaction.user.id);
    await updatePollMessage(pollMessage, channelId, date);
    await updateLogChannel(date);
  });

  collector.on('end', async () => {
    await disablePoll(pollMessage);
  });
}

async function startPolls(date) {
  // Send initial log message template only once
  if (!logMessages[date]) {
    await sendInitialLogMessage(date);
  }

  for (const channelId of config.pollChannels) {
    await postPoll(channelId, date);
  }
}

async function sendInitialLogMessage(date) {
  const logChannel = await client.channels.fetch(config.logChannelId);
  let initialContent = `${date} Poll Results\n\n`;
  for (const channelId of config.pollChannels) {
    initialContent += `
Results for <#${channelId}>:
Green: \`0\` **0%** for the day. (All time: \`0\` **0%**)
Red: \`0\` **0%** for the day. (All time: \`0\` **0%**)
Did not follow/trade: \`0\` **0%** for the day. (All time: \`0\` **0%**)\n\n`;
  }
  const logMessage = await logChannel.send(initialContent.trim());
  logMessages[date] = logMessage;
}

async function updatePollMessage(pollMessage, channelId, date) {
  const results = await getPollResults(channelId, date);
  const totalVotes = results.reduce((acc, result) => acc + result.count, 0);
  const greenVotes = results.find(result => result.answer === 'green')?.count || 0;
  const redVotes = results.find(result => result.answer === 'red')?.count || 0;
  const noTradeVotes = results.find(result => result.answer === 'no_trade')?.count || 0;

  const greenPercentage = totalVotes > 0 ? ((greenVotes / totalVotes) * 100).toFixed(2) : 0;
  const redPercentage = totalVotes > 0 ? ((redVotes / totalVotes) * 100).toFixed(2) : 0;
  const noTradePercentage = totalVotes > 0 ? ((noTradeVotes / totalVotes) * 100).toFixed(2) : 0;

  const embed = new EmbedBuilder()
    .setTitle('Were you green or red for the day following this analyst?')
    .addFields(
      { name: 'Total', value: `${totalVotes}`, inline: false },
      { name: 'Green', value: `${greenVotes} (${greenPercentage}%)`, inline: true },
      { name: 'Red', value: `${redVotes} (${redPercentage}%)`, inline: true },
      { name: 'Did not follow/trade', value: `${noTradeVotes} (${noTradePercentage}%)`, inline: true }
    );

  await pollMessage.edit({ embeds: [embed] });
}

async function updateLogChannel(date) {
  const logMessage = logMessages[date];
  let logContent = `${date} Poll Results\n\n`;

  for (const channelId of config.pollChannels) {
    const results = await getPollResults(channelId, date);
    const totalVotes = results.reduce((acc, result) => acc + result.count, 0);
    const greenVotes = results.find(result => result.answer === 'green')?.count || 0;
    const redVotes = results.find(result => result.answer === 'red')?.count || 0;
    const noTradeVotes = results.find(result => result.answer === 'no_trade')?.count || 0;

    const greenPercentage = totalVotes > 0 ? ((greenVotes / totalVotes) * 100).toFixed(2) : 0;
    const redPercentage = totalVotes > 0 ? ((redVotes / totalVotes) * 100).toFixed(2) : 0;
    const noTradePercentage = totalVotes > 0 ? ((noTradeVotes / totalVotes) * 100).toFixed(2) : 0;

    const allTimeResults = await getAllTimeResults(channelId);
    const allTimeVotes = allTimeResults.reduce((acc, result) => acc + result.count, 0);
    const allTimeGreen = allTimeResults.find(result => result.answer === 'green')?.count || 0;
    const allTimeRed = allTimeResults.find(result => result.answer === 'red')?.count || 0;
    const allTimeNoTrade = allTimeResults.find(result => result.answer === 'no_trade')?.count || 0;

    const allTimeGreenPercentage = allTimeVotes > 0 ? ((allTimeGreen / allTimeVotes) * 100).toFixed(2) : 0;
    const allTimeRedPercentage = allTimeVotes > 0 ? ((allTimeRed / allTimeVotes) * 100).toFixed(2) : 0;
    const allTimeNoTradePercentage = allTimeVotes > 0 ? ((allTimeNoTrade / allTimeVotes) * 100).toFixed(2) : 0;

    logContent += `
Results for <#${channelId}>:
Green: \`${greenVotes}\` **${greenPercentage}%** for the day. (All time: \`${allTimeGreen}\` **${allTimeGreenPercentage}%**)
Red: \`${redVotes}\` **${redPercentage}%** for the day. (All time: \`${allTimeRed}\` **${allTimeRedPercentage}%**)
Did not follow/trade: \`${noTradeVotes}\` **${noTradePercentage}%** for the day. (All time: \`${allTimeNoTrade}\` **${allTimeNoTradePercentage}%**)\n\n`;
  }

  await logMessage.edit(logContent.trim());
}

async function disablePoll(pollMessage) {
  await pollMessage.edit({ components: [] });
}

module.exports = { startPolls, disablePoll };
