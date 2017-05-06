exports.run = function (bot, msg, args) {
    let channels = bot.mafia.channels;

    // TODO: Add player
    // TODO: Check if user is player.

    if (channels.indexOf(msg.channel.id) > -1) {
        const error_response = `:negative_squared_cross_mark:  |  Please vote for a player by mentioning them, or use \`${bot.config.prefix}vote nolynch\` or \`${bot.config.prefix}unvote\``;

        if (args.length < 1) {
            msg.channel.send(error_response);
            return;
        }

        let vote = {};
        vote.voter = msg.author.id;

        if (msg.mentions.users.size > 0) {
            vote.target = msg.mentions.users.last().id;
        } else if (args[0] === 'nolynch' || args[0] === 'nl' || args[0] === 'no') {
            vote.target = '0';
        } else {
            msg.channel.send(error_response);
            return;
        }

        if (typeof bot.mafia.votes === 'undefined') {
            bot.mafia.votes = [];
        }

        bot.mafia.votes = bot.mafia.votes.filter(vote => vote.voter !== msg.author.id);
        bot.mafia.votes.push(vote);

        bot.db.put('mafia.votes', bot.mafia.votes).then(() => {
            let output = bot.mafia.buildVoteOutput();
            // msg.react('🆗');
            if (output) {
                msg.channel.send(output);
            }
        });
    }
};

exports.info = {
    name: 'vote',
    usage: 'vote <@Player>',
    description: 'Votes for a specified player during a mafia game.'
};
