exports.run = function (bot, msg) {
    let output = bot.mafia.voteCountOutput();
    if (output) {
        msg.channel.send(output);
    }
};

exports.info = {
    name: 'votecount',
    usage: 'votecount',
    description: 'Displays the current votecount.'
};
