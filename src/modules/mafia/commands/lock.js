const bot = require('../../../bot');
const { send } = require('../../../utils/chat');

exports.run = async (msg) => {

    const playerRole = await bot.db.get('mafia', 'main.role');
    const opts = { 'SEND_MESSAGES': false };
    const reason = 'MafiaHelper: Lock command usage';

    try {
        await msg.channel.updateOverwrite(playerRole, opts, reason);
        await send(msg.channel, ':lock:');
    } catch (err) {
        console.log(err);
        send(msg.channel, 'Error: Does the bot have permissions over this channel?');
    }
};

// Usage is a Map where each key is the usage, and the value is the description
exports.usage = new Map([
    ['', 'Locks the channel for players']
]);

exports.config = {
    name: 'Lock',
    cmd: 'lock',
    alias: [],
    // Permissions use https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    // or NOONE - which rejects everyone.
    botPermissions: [], // Guild permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be used
    description: 'Locks the channel for players.',
    debug: false // If true: unusable to anyone besides process.env.OWNER
};
