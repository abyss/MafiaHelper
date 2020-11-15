const moment = require('moment');
const bot = require('../../../bot');
const { send } = require('../../../utils/chat');


exports.run = async (msg, args) => {
    // check that the requisites are met
    const main = await bot.db.get('mafia', 'main');
    if (!main) {
        send(msg.channel, 'Did you forget something? (Hint: You did. It\'s `setmain`!)');
        return;
    }

    const serverId = main.server;
    const channelId = main.channel;
    const roleId = main.role;

    if (!(serverId && channelId && roleId)) {
        send(msg.channel, 'Did you forget something? (Hint: You did. It\'s `setmain`!)');
        return;
    }

    let hours;

    if (args.length) {
        hours = parseFloat(args[0], 10);
        if (isNaN(hours)) {
            hours = 18;
        }
    } else {
        hours = 18;
    }

    let now = moment();
    let day_end = now.add(hours, 'hours');

    await bot.db.set('mafia', 'timer', day_end.toArray());
    await bot.db.set('mafia', 'phase', 'day');

    const opts = { 'SEND_MESSAGES': true };
    const reason = 'MafiaHelper: Day Begin';
    try {
        await msg.channel.updateOverwrite(roleId, opts, reason);
    } catch (err) {
        console.log(err);
        send(msg.channel, 'Error: Does the bot have permissions over this channel?');
    }

    send(msg.channel, ':sunny:  **|  The Day has begun!**');
};

// Usage is a Map where each key is the usage, and the value is the description
exports.usage = new Map([
    ['', 'Starts a day']
]);

exports.config = {
    name: 'startday',
    cmd: 'startday',
    alias: [],
    // Permissions use https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    // or NOONE - which rejects everyone.
    botPermissions: [], // Guild permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be used
    description: 'Starts a day.',
    debug: false // If true: unusable to anyone besides process.env.OWNER
};
