exports.run = function (bot, msg) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    bot.mafia.lockChannel();
};

exports.info = {
    name: 'lock',
    usage: 'lock',
    description: 'Locks the channel.'
};
