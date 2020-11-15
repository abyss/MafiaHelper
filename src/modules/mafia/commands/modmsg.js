const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const MessageEmbed = require('discord.js').MessageEmbed;

exports.run = async (msg, args) => {
    const phase = await bot.db.get('mafia', 'phase');
    const main = await bot.db.get('mafia', 'main');

    if (phase === 'none' || !main || !main.role || !main.server) {
        await send(msg.channel, ':x:  **|  There\'s not a game currently running!**');
        return;
    }

    if (args.join(' ') > 1950) {
        await msg.react('❌');
        await send(msg.channel, ':x:  |  Your message was over 1950 characters! Please send shorter messages!');
        return;
    }

    const guildId = main.server;
    const guild = bot.client.guilds.resolve(guildId);

    const mainRoleId = main.role;
    const role = guild.roles.resolve(mainRoleId);
    const members = role.members;

    const output = new MessageEmbed()
        .setColor('RANDOM')
        .setDescription(args.join(' '))
        .setTitle('**Message from the Hosts:**');

    for (const player of members.array()) {
        await send(player, { embed: output });
    }

    await send(msg.channel, ':ok_hand:  **|  Host Message has been sent!**');
};

// Usage is a Map where each key is the usage, and the value is the description
exports.usage = new Map([
    ['', 'Send a message from the hosts to all players.']
]);

exports.config = {
    name: 'hostmsg',
    cmd: 'hostmsg',
    alias: ['modmessage', 'modmsg'],
    // Permissions use https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    // or NOONE - which rejects everyone.
    botPermissions: [], // Guild permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be used
    description: 'Send a message from the hosts to all players.',
    debug: false // If true: unusable to anyone besides process.env.OWNER
};
