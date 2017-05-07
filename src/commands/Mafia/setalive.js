const RichEmbed = require('discord.js').RichEmbed;

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    if (typeof bot.mafia.players.alive === 'undefined') {
        bot.mafia.players.alive = '0';
    }

    if (args.length < 1) {
        let alive_role = bot.mafia.players.alive;
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

        msg.channel.sendEmbed(output);
        return;
    }

    if (msg.mentions.roles.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a player role, you need to tag the role.');
        return;
    }

    let role = msg.mentions.roles.last();

    msg.channel.send(':arrows_counterclockwise: | Adding...').then(m => {
        bot.db.put('mafia.players.alive', role.id).then(() => {
            m.edit(`:white_check_mark:  |  **${role.name}** is now the players role.`);
            //Update Cache
            bot.mafia.players.alive = role.id;
        });

    });
};

exports.info = {
    name: 'setalive',
    usage: 'setalive <@role>',
    description: 'Sets the player role for the Mafia Game'
};
