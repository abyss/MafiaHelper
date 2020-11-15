const bot = require('../../../bot');
const { send } = require('../../../utils/chat');

exports.run = async (msg) => {
    await bot.db.set('mafia', 'timer', null);
    await bot.db.set('mafia', 'phase', 'none');

    await send(msg.channel, ':ballot_box_with_check:  **|  The Mafia game has been ended.**');
};

// Usage is a Map where each key is the usage, and the value is the description
exports.usage = new Map([
    ['', 'Ends the Mafia game']
]);

exports.config = {
    name: 'endgame',
    cmd: 'endgame',
    alias: [],
    // Permissions use https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    // or NOONE - which rejects everyone.
    botPermissions: [], // Guild permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be used
    description: 'Ends the Mafia game.',
    debug: false // If true: unusable to anyone besides process.env.OWNER
};
