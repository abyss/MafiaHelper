const RichEmbed = require('discord.js').RichEmbed;

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.data.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    let output = [];
    if (typeof bot.mafia.data.channels === 'undefined') {
        bot.mafia.data.channels = [];
    }

    if (args.length < 1) {
        let channel_mentions = bot.mafia.data.channels.map(cid => {
            let chan = bot.channels.get(cid);
            if (chan) {
                return `<#${cid}> - \`#${chan.name}\` on ${chan.guild.name}`;
            } else {
                return `\`${cid}\` - Can't find channel on any servers connected.`;
            }
        });

        output = new RichEmbed()
            .setColor(bot.utils.randomColor())
            .setTitle('Channels to Monitor:')
            .setDescription(channel_mentions.join('\n'));

        msg.channel.send('', {embed: output});
        return;
    }

    if (msg.mentions.channels.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to add a monitored channel, you need to tag the channel.');
        return;
    }

    msg.mentions.channels.forEach(chan => {
        let modindex = bot.mafia.data.channels.indexOf(chan.id);
        if (modindex > -1) {
            bot.mafia.data.channels.splice(modindex, 1);
            output.push(`:negative_squared_cross_mark:  |  **${chan.name}** is no longer a monitored channel.`);
        } else {
            bot.mafia.data.channels.push(chan.id);
            output.push(`:white_check_mark:  |  **${chan.name}** is now a monitored channel.`);
        }
    });

    msg.channel.send(output.join('\n'));
    bot.mafia.saveDB();
};

exports.info = {
    name: 'monitor',
    usage: 'monitor [#channel] [#channel]',
    description: 'Lists monitored channels, or toggles monitored status for channels'
};
