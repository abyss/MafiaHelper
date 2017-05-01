exports.run = function (bot, msg, args) {
    let mods = bot.mafia.mods;
    let channels = bot.mafia.channels;
    

    // TODO: Add player
    // TODO: Check if user is player.
    // TODO: Vote Clear
    // TODO: Unvote

    if (args.length < 1) {
        msg.channel.send(`:negative_squared_cross_mark:  |  If you want to unvote, type ${bot.config.prefix}unvote.`);
        return;
    }

    if (msg.mentions.users.size < 1) {
        msg.channel.send(':negative_squared_cross_mark:  |  If you want to vote, you need to tag the person.');
        return;
    }

    if (channels.indexOf(msg.channel.id) > -1) {
        let voted_user = msg.mentions.users.last();
        let vote = {
            'voter': msg.author.id,
            'target': voted_user.id
        };
        
        bot.mafia.votes = bot.mafia.votes.filter(vote => vote.voter !== msg.author.id);
        bot.mafia.votes.push(vote);

        bot.db.put('mafia.votes', bot.mafia.votes).then(() => {
            msg.channel.send(`:ballot_box:  |  **${msg.author.username}** has voted for ${voted_user.username}`);
            // TODO: Ballot count
        });
    }
};

exports.info = {
    name: 'vote',
    usage: 'vote <@Player>',
    description: 'Votes for a specified player during a mafia game.'
};
