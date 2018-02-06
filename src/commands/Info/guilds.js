const oneLine = require('common-tags').oneLine;

exports.run = (bot, msg) => {
    if (msg.author.id !== bot.config.owner) {
        msg.channel.send(`:negative_squared_cross_mark:  |  You are not <@${bot.config.owner}>.`);
        return;
    }

    let servers = bot.guilds.array().sort((a, b) => b.memberCount - a.memberCount).map(guild => {
        return {
            name: guild.name,
            value: oneLine`
                ${guild.memberCount} users,
                ${guild.channels.size} channels
            `
        };
    });

    msg.channel.send('', {embed: bot.utils.embed(`${bot.user.username}'s Servers`, '\u200b', servers, { inline: true })});
};

exports.info = {
    name: 'guilds',
    usage: 'guilds',
    description: 'Lists all guilds the bot is a member of'
};
