exports.run = function (bot, msg) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    bot.mafia.clearVotes();
};

exports.info = {
    name: 'clearvotes',
    usage: 'clearvotes',
    description: 'Clears all votes.'
};
