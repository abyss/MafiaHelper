exports.run = function (bot, msg) {
    let mods = bot.mafia.mods;
    let channels = bot.mafia.channels;

    if (channels.indexOf(msg.channel.id) > -1) {
        msg.channel.send(`:ballot_box:  |  **${msg.author.username}** has unvoted.`);
        mods.forEach(modid => {
            let mod = bot.users.get(modid);
            mod.send(`:ballot_box:  |  <@${msg.author.id}> has unvoted.`);
        });
    }
};

exports.info = {
    name: 'unvote',
    usage: 'unvote',
    description: 'Unvote.'
};
