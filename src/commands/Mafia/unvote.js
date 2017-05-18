exports.run = function (bot, msg) {
    if (bot.mafia.isMonitoredChannel(msg.channel.id)) {
        if (typeof bot.mafia.data.votes === 'undefined') {
            bot.mafia.data.votes = [];
        }

        bot.mafia.data.votes = bot.mafia.data.votes.filter(vote => vote.voter !== msg.author.id);

        bot.mafia.saveDB();

        let output = bot.mafia.voteCountOutput();
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
