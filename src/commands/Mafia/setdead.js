const RichEmbed = require('discord.js').RichEmbed;

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    if (typeof bot.mafia.players.dead === 'undefined') {
        bot.mafia.players.dead = '0';
    }

    if (args.length < 1) {
        let dead_role = bot.mafia.players.dead;
        let role_output;

        if (dead_role !== '0') {
            let role_name;
            role_name = bot.guilds.get(bot.config.primary_server).roles.get(dead_role).name;
            role_output = `@${role_name}`;
        } else {
            role_output = 'No role currently assigned.';
        }

        let output = new RichEmbed()
            .setColor(bot.utils.randomColor())
            .setTitle('Dead Mafia Players:')
            .setDescription(role_output);

        msg.channel.sendEmbed(output);
        return;
    }

    if (msg.mentions.roles.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a dead player role, you need to tag the role.');
        return;
    }

    let role = msg.mentions.roles.last();

    msg.channel.send(':arrows_counterclockwise: | Adding...').then(m => {
        bot.db.put('mafia.players.dead', role.id).then(() => {
            m.edit(`:white_check_mark:  |  **${role.name}** is now the dead players role.`);
            //Update Cache
            bot.mafia.players.dead = role.id;
        });

    });
};

exports.info = {
    name: 'setdead',
    usage: 'seatdead <@role>',
    description: 'Sets the dead players role for the Mafia Game'
};
