exports.run = function (bot, msg) {
    let output = bot.mafia.voteCountOutput();
    if (output) {
        msg.channel.send(output);
    }
};

exports.info = {
    name: 'vc',
    usage: 'vc',
    description: 'Displays the current votecount.'
};
