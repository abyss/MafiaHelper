exports.run = function (bot, msg) {
    let channels = bot.mafia.channels;

    if (channels.indexOf(msg.channel.id) > -1) {
        if (typeof bot.mafia.votes === 'undefined') {
            bot.mafia.votes = [];
        }

        bot.mafia.votes = bot.mafia.votes.filter(vote => vote.voter !== msg.author.id);

        bot.db.put('mafia.votes', bot.mafia.votes).then(() => {
            let output = bot.mafia.buildVoteOutput();
            if (output) {
                msg.channel.send(output);
            }
        });
    }
};

exports.info = {
    name: 'unvote',
    usage: 'unvote',
    description: 'Unvote.'
};
