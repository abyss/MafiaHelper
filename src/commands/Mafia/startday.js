const moment = require('moment');

exports.run = function (bot, msg, args) {
    let primary_server = bot.guilds.get(bot.config.primary_server);
    let alive_role = primary_server.roles.get(bot.mafia.players.alive);

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

    let day_end = moment().add(hours, 'hours');
    bot.mafia.eod.time = day_end;
    bot.db.put('mafia.eod.time', bot.mafia.eod.time.toJSON());

    bot.mafia.eod.day = true;
    bot.db.put('mafia.eod.day', bot.mafia.eod.day);

    bot.mafia.eod.channel = msg.channel.id;
    bot.db.put('mafia.eod.channel', bot.mafia.eod.channel);

    bot.mafia.votes = [];
    bot.db.put('mafia.votes', bot.mafia.votes);

    let num_players = alive_role.members.size;
    bot.mafia.majority = Math.floor((num_players+2)/2);

    bot.db.put('mafia.majority', bot.mafia.majority);

    msg.channel.send(':sunny:  **|  The Day has begun!**');
};

exports.info = {
    name: 'startday',
    usage: 'startday (hours)',
    description: 'Starts the mafia day by unlocking the channel, starting the timer, and setting the majority.'
};
