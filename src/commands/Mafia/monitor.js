const RichEmbed = require('discord.js').RichEmbed;

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    bot.db.get('mafia.channels').then(channel_list => {
        let output = [];
        if (typeof channel_list === 'undefined') {
            channel_list = [];
        }

        if (args.length < 1) {
            let channel_mentions = channel_list.map(cid => {
                let chan = bot.channels.get(cid);
                if (chan) {
                    return `<#${cid}> - \`#${chan.name}\` on ${chan.guild.name}`;
                } else {
                    return `\`${cid}\` - Can't find channel on any servers connected.`;
                }
            });

            // Update cache
            bot.mafia.channels = channel_list;

            output = new RichEmbed()
                .setColor(bot.utils.randomColor())
                .setTitle('Channels to Monitor:')
                .setDescription(channel_mentions.join('\n'));

            msg.channel.sendEmbed(output);
            return;
        }

        if (msg.mentions.channels.size < 1) {
            msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a monitored channel, you need to tag the channel.');
            return;
        }

        msg.mentions.channels.forEach(chan => {
            let modindex = channel_list.indexOf(chan.id);
            if (modindex > -1) {
                channel_list.splice(modindex, 1);
                output.push(`:negative_squared_cross_mark:  |  **${chan.name}** is no longer a monitored channel.`);
            } else {
                channel_list.push(chan.id);
                output.push(`:white_check_mark:  |  **${chan.name}** is now a monitored channel.`);
            }
        });

        msg.channel.send(':arrows_counterclockwise: | Adding...').then(m => {
            bot.db.put('mafia.channels', channel_list).then(() => {
                m.edit(output.join('\n'));
                // Update cache
                bot.mafia.channels = channel_list;
            });

        });
    });
};

exports.info = {
    name: 'monitor',
    usage: 'monitor [#channel] [#channel]',
    description: 'Lists monitored channels, or toggles monitored status for channels'
};
