// const RichEmbed = require('discord.js').RichEmbed;
const _ = require('lodash');

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    if (args.length < 1) {
        _.set(bot.mafia.data, 'monk.role', 0);
        _.set(bot.mafia.data, 'monk.guild', 0);
        _.set(bot.mafia.data, 'monk.channel', 0);
        msg.channel.send('BETA: You have zeroed out the monk role data. Let Abyss know if anything breaks.');
        return;
    }

    if (msg.mentions.roles.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a monk role, please mention it.');
        return;
    }

    let role = msg.mentions.roles.last();

    _.set(bot.mafia.data, 'monk.role', role.id);
    _.set(bot.mafia.data, 'monk.guild', msg.guild.id);
    _.set(bot.mafia.data, 'monk.channel', msg.channel.id);

    bot.mafia.saveDB();
    msg.channel.send(':white_check_mark:  |  Monk details have been set.');
};

exports.info = {
    name: 'setmonk',
    usage: 'setmonk <@role>',
    description: 'Sets the player role, channel, and server for the Monks.'
};
