const RichEmbed = require('discord.js').RichEmbed;

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.data.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }
    if (!bot.mafia.data.players) {
        bot.mafia.data.players = {};
    }

    if (typeof bot.mafia.data.players.alive === 'undefined') {
        bot.mafia.data.players.alive = '0';
    }

    if (args.length < 1) {
        let alive_role = bot.mafia.data.players.alive;
        let role_output;

        if (alive_role !== '0') {
            let role_name;
            role_name = bot.guilds.get(bot.config.primary_server).roles.get(alive_role).name;
            role_output = `@${role_name}`;
        } else {
            role_output = 'No role currently assigned.';
        }

        let output = new RichEmbed()
            .setColor(bot.utils.randomColor())
            .setTitle('Mafia Players:')
            .setDescription(role_output);

        msg.channel.send('', {embed: output});
        return;
    }

    if (msg.mentions.roles.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a player role, you need to tag the role.');
        return;
    }

    let role = msg.mentions.roles.last();

    bot.mafia.data.players.alive = role.id;

    bot.mafia.saveDB();
    msg.channel.send(`:white_check_mark:  |  **${role.name}** is now the players role.`);
};

exports.info = {
    name: 'setalive',
    usage: 'setalive <@role>',
    description: 'Sets the player role for the Mafia Game'
};
