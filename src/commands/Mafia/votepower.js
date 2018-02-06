const RichEmbed = require('discord.js').RichEmbed;

exports.run = function (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    let output = [];

    // TODO: Needs more abstraction.

    if (typeof bot.mafia.data.votepower === 'undefined') {
        bot.mafia.data.votepower = [];
    }

    if (args.length < 1) {
        let vp_output = bot.mafia.data.votepower.map(vp => `<@${vp.voter}>: ${vp.power}`);

        output = new RichEmbed()
            .setColor(bot.utils.randomColor())
            .setTitle('Vote Power:')
            .setDescription(vp_output.join('\n'));

        msg.channel.send('', {embed: output});
        return;
    }

    if (msg.mentions.users.size < 1 || args.length < 2) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to change vote power, you need to tag the user, and type the amount.');
        return;
    }

    const voter = msg.mentions.users.first();
    let power = parseInt(args[1], 10);

    if (isNaN(power)) {
        power = -1;
    }

    const votePower = bot.mafia.data.votepower.filter(vp => vp.voter !== voter.id);

    if (power >= 0 && power !== 1) {
        const vpEntry = {
            voter: voter.id,
            power: power
        };

        votePower.push(vpEntry);

        output.push(`:white_check_mark:  |  **${voter.username}** has ${power} vote power.`);
    } else {
        output.push(`:white_check_mark:  |  **${voter.username}** has 1 vote power.`);
    }

    bot.mafia.data.votepower = votePower;
    bot.mafia.saveDB();
    msg.channel.send(output.join('\n'));
};

exports.info = {
    name: 'votepower',
    usage: 'votepower [@Person] [Amount]',
    description: 'Changes a voters vote power (how many times their vote counts)'
};
