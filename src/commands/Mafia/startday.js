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

    let day_end = moment().add(hours, 'hours');
    bot.mafia.data.eod.time = day_end;
    bot.mafia.data.eod.day = true;
    bot.mafia.data.eod.channel = msg.channel.id;
    bot.mafia.data.votes = [];

    let num_players = alive_role.members.size;
    bot.mafia.data.majority = Math.floor((num_players+2)/2);

    bot.mafia.saveDB();

    let postfix = '';

    if (hours !== 24) {
        let plurality = '';
        if (hours !== 1) {
            plurality = 's';
        }
        postfix = `**It will be ${hours} hour${plurality} long.**`;
    }

    msg.channel.send(`:sunny:  **|  The Day has begun!** ${postfix}`);
};

exports.info = {
    name: 'startday',
    usage: 'startday (hours)',
    description: 'Starts the mafia day by unlocking the channel, starting the timer, and setting the majority.'
};
