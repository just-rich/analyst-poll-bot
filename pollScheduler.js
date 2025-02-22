const schedule = require('node-schedule');
const { postPoll, disablePoll } = require('./pollHandler');
const config = require('./config.json');

// Schedule to post poll at 1:15pm PST Monday to Friday
const pollJob = schedule.scheduleJob('15 21 * * 1-5', () => {
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const date = currentTime.split(',')[0];
  config.pollChannels.forEach(channelId => {
    postPoll(channelId, date);
  });
});

// Schedule to disable poll at 12am PST (10 hours 45 minutes after poll)
const disableJob = schedule.scheduleJob('45 8 * * 1-6', () => {
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const date = currentTime.split(',')[0];
  config.pollChannels.forEach(channelId => {
    disablePoll(channelId, date);
  });
});

module.exports = { pollJob, disableJob };
