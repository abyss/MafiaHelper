const moment = require('moment');

exports.run = function (bot, msg, args) {
    if (!bot.mafia.data.players) throw 'Please set the alive players role.';

    let primary_server = bot.guilds.get(bot.config.primary_server);
    let alive_role = primary_server.roles.get(bot.mafia.data.players.alive);

    if (!alive_role) {
        throw 'Please set the alive players role.';
    }

    msg.channel.overwritePermissions(alive_role, {'SEND_MESSAGES': true});

    let hours;

    if (args.length) {
        hours = parseFloat(args[0], 10);
        if (isNaN(hours)) {
            hours = 24;
        }
    } else {
        hours = 24;
    }

    bot.mafia.data.eod.channel = msg.channel.id;
    bot.mafia.startDay(hours);

    msg.channel.send(':sunny:  **|  The Day has begun!**');
};

exports.info = {
    name: 'startday',
    usage: 'startday (hours)',
    description: 'Starts the mafia day by unlocking the channel, starting the timer, and setting the majority.'
};
