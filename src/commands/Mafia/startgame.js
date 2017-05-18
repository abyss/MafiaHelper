// const RichEmbed = require('discord.js').RichEmbed;
const _ = require('lodash');

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    if (args.length < 1) {
        // Old Code. Needs updated.
        // let alive_role = bot.mafia.data.primary.role;
        // let role_output;

        // if (alive_role !== '0') {
        //     let role_name;
        //     role_name = bot.guilds.get(bot.config.primary_server).roles.get(alive_role).name;
        //     role_output = `@${role_name}`;
        // } else {
        //     role_output = 'No role currently assigned.';
        // }

        // let output = new RichEmbed()
        //     .setColor(bot.utils.randomColor())
        //     .setTitle('Mafia Players:')
        //     .setDescription(role_output);

        // msg.channel.send('', {embed: output});
        msg.channel.send('This isnt implemented yet, please tag a role.');
        return;
    }

    if (msg.mentions.roles.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a player role, you need to tag the role.');
        return;
    }

    let role = msg.mentions.roles.last();

    _.set(bot.mafia.data, 'primary.role', role.id);
    _.set(bot.mafia.data, 'primary.guild', msg.guild.id);
    _.set(bot.mafia.data, 'primary.channel', msg.channel.id);

    bot.mafia.saveDB();
    msg.channel.send(':white_check_mark:  |  Game has been started.');
};

exports.info = {
    name: 'startgame',
    usage: 'startgame <@role>',
    description: 'Sets the player role, channel, and server for the Mafia Game, and starts the game.'
};
