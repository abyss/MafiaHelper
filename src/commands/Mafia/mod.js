const RichEmbed = require('discord.js').RichEmbed;

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.data.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    let output = [];

    // TODO: Abstract this to mafia
    if (typeof bot.mafia.data.mods === 'undefined') {
        bot.mafia.data.mods = [];
    }

    if (args.length < 1) {
        let mod_mentions = bot.mafia.data.mods.map(uid => `<@${uid}>`);

        output = new RichEmbed()
            .setColor(bot.utils.randomColor())
            .setTitle('Mafia Mods:')
            .setDescription(mod_mentions.join('\n'));

        msg.channel.sendEmbed(output);
        return;
    }

    if (msg.mentions.users.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a Mafia Mod, you need to tag the users.');
        return;
    }

    msg.mentions.users.forEach(user => {
        let modindex = bot.mafia.data.mods.indexOf(user.id);
        if (modindex > -1) {
            bot.mafia.data.mods.splice(modindex, 1);
            output.push(`:negative_squared_cross_mark:  |  **${user.username}** is no longer a Mafia Mod.`);
        } else {
            bot.mafia.data.mods.push(user.id);
            output.push(`:white_check_mark:  |  **${user.username}** is now a Mafia Mod.`);
        }
    });

    bot.mafia.saveDB();
    msg.channel.send(output.join('\n'));
};

exports.info = {
    name: 'mod',
    usage: 'mod [@Person] [@Person]',
    description: 'Lists Mafia Mods, or toggles Mafia Mod status for tagged users'
};
