exports.run = function (bot, msg) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    bot.mafia.votes = [];

    bot.db.put('mafia.votes', bot.mafia.votes).then(() => {
        msg.channel.send('Votes cleared.');
    });
};

exports.info = {
    name: 'clearvotes',
    usage: 'clearvotes',
    description: 'Clears all votes.'
};
