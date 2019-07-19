const chalk = require('chalk');

const bot = require('./startup/discord');
module.exports = bot;

bot.handlers = {};
bot.config = require('./startup/config');
require('./startup/logger')(bot); // Injects bot.log, debug, error methods
bot.db = require('./startup/database');
require('./startup/commands')(bot); // Injects handlers into bot.handlers

bot.on('ready', () => {
    bot.log('Stats:');
    bot.log(`User: ${bot.user.tag} <ID: ${bot.user.id}>`);
    bot.log(`Users: ${bot.users.size}, Guilds: ${bot.guilds.size}`);

    bot.handlers.commands.init();
    bot.handlers.mods.init();

    bot.user.setPresence({ game: { name: `voidBot | @${bot.user.username} help` }, status: 'online' });
    bot.log('Bot loaded!');

    bot.generateInvite(bot.config.permissions).then((invite_link) => {
        bot.log(`Invite Link: ${chalk.blue.underline(invite_link)}`);
    });
});

bot.on('message', message => {
    if (message.author.bot) { return; }
    bot.handlers.commands.onMessage(message);
});

// TODO: Handle ErrorEvent ECONNRESET gracefully without log when not debug
bot.on('error', err => {
    const errorMsg = (err.stack || err.error || err || '').toString();
    bot.error(`discord.js Error: \n${errorMsg}`);
});
