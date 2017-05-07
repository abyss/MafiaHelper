exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    if (args.length < 1) {
        msg.channel.send(`:ballot_box:  |  Current vote needed to lynch: **${bot.mafia.majority}**`);
        return;
    }

    let new_majority = parseInt(args[0], 10);
    if (!isNaN(new_majority)) {
        bot.mafia.majority = new_majority;
        bot.db.put('mafia.majority', bot.mafia.majority).then(() => {
            msg.channel.send(`:white_check_mark:  |  New majority set at **${bot.mafia.majority}**`);
        });
    } else {
        msg.channel.send(':negative_squared_cross_mark:  |  You must provide a number.');
    }
};

exports.info = {
    name: 'majority',
    usage: 'majority (number)',
    description: 'Sets or views the majority required to lynch.'
};
