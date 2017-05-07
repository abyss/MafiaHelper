exports.run = function (bot, msg) {
    let primary_server = bot.guilds.get(bot.config.primary_server);
    let alive_role = primary_server.roles.get(bot.mafia.players.alive);

    msg.channel.overwritePermissions(alive_role, {'SEND_MESSAGES': true});

    // Start 24h time

    bot.mafia.votes = [];
    bot.db.put('mafia.votes', bot.mafia.votes);

    let num_players = alive_role.members.size;
    bot.mafia.majority = Math.floor((num_players+2)/2);

    bot.db.put('mafia.majority', bot.mafia.majority);
};

exports.info = {
    name: 'startday',
    usage: 'startday',
    description: 'Starts the mafia day by unlocking the channel, starting the timer, and setting the majority.'
};
