exports.run = function (bot, msg) {
    let channels = bot.mafia.data.channels;

    if (!channels) return;

    if (channels.indexOf(msg.channel.id) > -1) {
        if (typeof bot.mafia.data.votes === 'undefined') {
            bot.mafia.data.votes = [];
        }

        bot.mafia.data.votes = bot.mafia.data.votes.filter(vote => vote.voter !== msg.author.id);

        bot.mafia.saveDB();

        let output = bot.mafia.buildVoteOutput();
        if (output) {
            msg.channel.send(output);
        }
    }
};

exports.info = {
    name: 'unvote',
    usage: 'unvote',
    description: 'Unvote.'
};
