// const RichEmbed = require('discord.js').RichEmbed;
const _ = require('lodash');

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    if (args.length < 1) {
        msg.channel.send('This isnt implemented yet, please tag the mafia role.');
        return;
    }

    if (msg.mentions.roles.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a mafia role, please mention it.');
        return;
    }

    let role = msg.mentions.roles.last();

    _.set(bot.mafia.data, 'mafia.role', role.id);
    _.set(bot.mafia.data, 'mafia.guild', msg.guild.id);
    _.set(bot.mafia.data, 'mafia.channel', msg.channel.id);

    bot.mafia.saveDB();
    msg.channel.send(':white_check_mark:  |  Mafia details have been set.');
};

exports.info = {
    name: 'setmafia',
    usage: 'setmafia <@role>',
    description: 'Sets the player role, channel, and server for the Mafia.'
};
