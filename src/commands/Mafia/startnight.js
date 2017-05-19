exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    let hours;

    if (args.length) {
        hours = parseFloat(args[0], 10);
        if (isNaN(hours)) {
            hours = 12;
        }
    } else {
        hours = 12;
    }

    bot.mafia.startNight(hours);
};

exports.info = {
    name: 'startnight',
    usage: 'startnight (hours)',
    description: 'Starts the mafia night by unlocking the Mafia channel, starting the timer, and setting the majority.'
};
