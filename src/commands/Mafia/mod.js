const RichEmbed = require('discord.js').RichEmbed;

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR')) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not an administrator.');
        return;
    }

    bot.db.get('mafia.mods').then(mods => {
        let output = [];
        if (typeof mods === 'undefined') {
            mods = [];
        }

        if (args.length < 1) {
            let mod_mentions = mods.map(uid => `<@${uid}>`);

            // Update cache
            bot.mafia.mods = mods;

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
            let modindex = mods.indexOf(user.id);
            if (modindex > -1) {
                mods.splice(modindex, 1);
                output.push(`:negative_squared_cross_mark:  |  **${user.username}** is no longer a Mafia Mod.`);
            } else {
                mods.push(user.id);
                output.push(`:white_check_mark:  |  **${user.username}** is now a Mafia Mod.`);
            }
        });

        msg.channel.send(':arrows_counterclockwise: | Adding...').then(m => {
            bot.db.put('mafia.mods', mods).then(() => {
                m.edit(output.join('\n'));
                // Update cache
                bot.mafia.mods = mods;
            });

        });
    });
};

exports.info = {
    name: 'mod',
    usage: 'mod [@Person] [@Person]',
    description: 'Lists Mafia Mods, or toggles Mafia Mod status for tagged users'
};
