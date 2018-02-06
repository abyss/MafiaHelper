// const RichEmbed = require('discord.js').RichEmbed;
const _ = require('lodash');

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    if (args.length < 1) {
        _.set(bot.mafia.data, 'mason.role', 0);
        _.set(bot.mafia.data, 'mason.guild', 0);
        _.set(bot.mafia.data, 'mason.channel', 0);
        msg.channel.send('BETA: You have zeroed out the mason role data. Let Abyss know if anything breaks.');
        return;
    }

    if (msg.mentions.roles.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a mason role, please mention it.');
        return;
    }

    let role = msg.mentions.roles.last();

    _.set(bot.mafia.data, 'mason.role', role.id);
    _.set(bot.mafia.data, 'mason.guild', msg.guild.id);
    _.set(bot.mafia.data, 'mason.channel', msg.channel.id);

    bot.mafia.saveDB();
    msg.channel.send(':white_check_mark:  |  Mason details have been set.');
};

exports.info = {
    name: 'setmason',
    usage: 'setmason <@role>',
    description: 'Sets the player role, channel, and server for the Masons.'
};
