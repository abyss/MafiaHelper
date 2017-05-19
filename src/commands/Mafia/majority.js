
exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    if (args.length < 1) {
        let majority = bot.mafia.majority || 0;
        msg.channel.send(`:ballot_box:  |  Current vote needed to lynch: **${majority}**`);
        return;
    }

    let new_majority = parseInt(args[0], 10);
    if (!isNaN(new_majority)) {
        bot.mafia.data.majority = new_majority;

        bot.mafia.saveDB();

        msg.channel.send(`:white_check_mark:  |  New majority set at **${bot.mafia.data.majority}**`);
    } else {
        msg.channel.send(':negative_squared_cross_mark:  |  You must provide a number.');
    }
};

exports.info = {
    name: 'majority',
    usage: 'majority (number)',
    description: 'Sets or views the majority required to lynch.'
};
