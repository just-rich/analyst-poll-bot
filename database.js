const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./polls.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS poll_results (
      channelId TEXT,
      date TEXT,
      answer TEXT,
      count INTEGER,
      PRIMARY KEY (channelId, date, answer)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS all_time_results (
      channelId TEXT,
      answer TEXT,
      count INTEGER,
      PRIMARY KEY (channelId, answer)
    )
  `);
});

function insertPollResult(channelId, date, answer) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO poll_results (channelId, date, answer, count) VALUES (?, ?, ?, 1) ON CONFLICT(channelId, date, answer) DO UPDATE SET count = count + 1",
      [channelId, date, answer],
      function (err) {
        if (err) {
          return reject(err);
        }
        db.run(
          "INSERT INTO all_time_results (channelId, answer, count) VALUES (?, ?, 1) ON CONFLICT(channelId, answer) DO UPDATE SET count = count + 1",
          [channelId, answer],
          function (err) {
            if (err) {
              return reject(err);
            }
            resolve();
          }
        );
      }
    );
  });
}

function getPollResults(channelId, date) {
  return new Promise((resolve, reject) => {
    db.all("SELECT answer, count FROM poll_results WHERE channelId = ? AND date = ?", [channelId, date], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function getAllTimeResults(channelId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT answer, count FROM all_time_results WHERE channelId = ?", [channelId], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function clearDailyResults(date) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM poll_results WHERE date = ?", [date], (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

module.exports = { insertPollResult, getPollResults, getAllTimeResults, clearDailyResults };
