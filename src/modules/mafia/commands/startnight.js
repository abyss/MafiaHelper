const moment = require('moment');
const bot = require('../../../bot');
const { send } = require('../../../utils/chat');


exports.run = async (msg, args) => {
    // check that the requisites are met
    const mafia = await bot.db.get('mafia', 'mafia');
    const mason = await bot.db.get('mafia', 'mason');
    if (!(mafia && mason)) {
        send(msg.channel, 'Did you forget something? (Hint: You did. It\'s `setmafia` or `setmason`!)');
        return;
    }

    const mafServerId = mafia.server;
    const mafChannelId = mafia.channel;
    const mafRoleId = mafia.role;

    const masonServerId = mason.server;
    const masonChannelId = mason.channel;
    const masonRoleId = mason.role;

    if (!(mafServerId && mafChannelId && mafRoleId)) {
        send(msg.channel, 'Did you forget something? (Hint: You did. It\'s `setmafia`!)');
        return;
    }

    if (!(masonServerId && masonChannelId && masonRoleId)) {
        send(msg.channel, 'Did you forget something? (Hint: You did. It\'s `setmason`!)');
        return;
    }

    const mafServer = bot.client.guilds.resolve(mafServerId);
    const mafChannel = mafServer.channels.resolve(mafChannelId);

    const masonServer = bot.client.guilds.resolve(masonServerId);
    const masonChannel = masonServer.channels.resolve(masonChannelId);

    let hours;

    if (args.length) {
        hours = parseFloat(args[0], 10);
        if (isNaN(hours)) {
            hours = 12;
        }
    } else {
        hours = 12;
    }

    let now = moment();
    let night_end = now.add(hours, 'hours');

    await bot.db.set('mafia', 'timer', night_end.toArray());
    await bot.db.set('mafia', 'phase', 'night');

    const opts = { 'SEND_MESSAGES': true };
    const reason = 'MafiaHelper: Night Begin';
    try {
        await mafChannel.updateOverwrite(mafRoleId, opts, reason);
        await masonChannel.updateOverwrite(masonRoleId, opts, reason);
    } catch (err) {
        console.log(err);
        send(msg.channel, 'Error: Does the bot have permissions over the channels?');
    }

    send(msg.channel, ':full_moon:  **|  The Night has begun!**');
    send(mafChannel, ':full_moon:  **|  The Night has begun!**');
    send(masonChannel, ':full_moon:  **|  The Night has begun!**');
};

// Usage is a Map where each key is the usage, and the value is the description
exports.usage = new Map([
    ['', 'Starts a night']
]);

exports.config = {
    name: 'startnight',
    cmd: 'startnight',
    alias: [],
    // Permissions use https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    // or NOONE - which rejects everyone.
    botPermissions: [], // Guild permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be used
    description: 'Starts a night.',
    debug: false // If true: unusable to anyone besides process.env.OWNER
};
