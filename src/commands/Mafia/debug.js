exports.run = function (bot, msg) {
    if ((msg.author.id !== bot.config.owner) && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    msg.channel.send(`\`\`\`json\n${JSON.stringify(bot.mafia.data, null, 2)}\`\`\``);
};

exports.info = {
    name: 'debug',
    usage: 'debug',
    description: 'Dumps Mafia Data'
};
