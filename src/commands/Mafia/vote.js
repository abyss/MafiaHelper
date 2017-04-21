exports.run = function (bot, msg, args) {
    let mods = bot.mafia.mods;
    let channels = bot.mafia.channels;

    if (args.length < 1) {
        msg.channel.send(`:negative_squared_cross_mark:  |  If you want to unvote, type ${bot.config.prefix}unvote.`);
        return; 
    }

    if (channels.indexOf(msg.channel.id) > -1) {
        msg.channel.send(`:ballot_box:  |  **${msg.author.username}** has voted for ${args.join (' ')}`);

        mods.forEach(modid => {
            let mod = bot.users.get(modid);
            mod.send(`:ballot_box:  |  <@${msg.author.id}> has voted for ${args.join(' ')}`);
        });
    }
};

exports.info = {
    name: 'vote',
    usage: 'vote <@Player>',
    description: 'Votes for a specified player during a mafia game.'
};