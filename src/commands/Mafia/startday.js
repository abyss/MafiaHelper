exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    let hours;

    if (args.length) {
        hours = parseFloat(args[0], 10);
        if (isNaN(hours)) {
            hours = 24;
        }
    } else {
        hours = 24;
    }

    bot.mafia.startDay(hours);
};

exports.info = {
    name: 'startday',
    usage: 'startday (hours)',
    description: 'Starts the mafia day by unlocking the channel, starting the timer, and setting the majority.'
};
