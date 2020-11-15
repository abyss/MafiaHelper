const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const { findRole } = require('../../../utils/discord');

exports.run = async (msg, args) => {
    if (args.length === 0) {
        const playerRole = await bot.db.get('mafia', 'mafia.role');

        if (playerRole) {
            const role = findRole(msg.guild, playerRole);
            send(msg.channel, `The current player role is ${role.name}.`);
        } else {
            send(msg.channel, 'There is no player role currently set. Set one using `setmafia [role name]`.');
        }
    } else {
        const role = findRole(msg.guild, args.join(' '));
        const mafia = {
            server: msg.guild.id,
            channel: msg.channel.id,
            role: role.id
        };

        await bot.db.set('mafia', 'mafia', mafia);
        await send(msg.channel, `**${role.name}** has been set as the mafia role, and the mafia server and channel have been established.`);
    }
};

// Usage is a Map where each key is the usage, and the value is the description
exports.usage = new Map([
    ['', 'Show the current player role'],
    ['<role>', 'Change the player role to <role>'],
]);

exports.config = {
    name: 'setmafia',
    cmd: 'setmafia',
    alias: [],
    // Permissions use https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    // or NOONE - which rejects everyone.
    botPermissions: [], // Guild permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be used
    description: 'Sets the Player role for the game.',
    debug: false // If true: unusable to anyone besides process.env.OWNER
};
