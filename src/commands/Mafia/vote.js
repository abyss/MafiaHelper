exports.run = function (bot, msg, args) {
    let primary_server = bot.guilds.get(bot.config.primary_server);
    let channels = bot.mafia.channels;

    if (channels.indexOf(msg.channel.id) > -1) {
        const error_response = `:negative_squared_cross_mark:  |  Please vote for a player by mentioning them, or use \`${bot.config.prefix}vote nolynch\` or \`${bot.config.prefix}unvote\``;

        if (args.length < 1) {
            msg.channel.send(error_response);
            return;
        }

        if (!msg.member.roles.has(bot.mafia.players.alive)) {
            msg.channel.send(':negative_squared_cross_mark:  |  You must be a player to vote.');
            return;
        }

        let vote = {};
        let param = args.join(' ').toLowerCase();
        vote.voter = msg.author.id;

        if (msg.mentions.members.size > 0) {
            let target = msg.mentions.members.last();
            vote.target = target.id;

            if (!target.roles.has(bot.mafia.players.alive)) {
                msg.channel.send(error_response);
                return;
            }

        } else if (param === 'nolynch' || param === 'nl' || param === 'no lynch') {
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

            let lynched = bot.mafia.checkMajority();
            if (lynched && lynched !== '0') {
                let lynched_user = primary_server.members.get(lynched);
                let alive_role = primary_server.roles.get(bot.mafia.players.alive);

                if (lynched_user) {
                    msg.channel.send(`\u200b\n:exclamation:  **|  Majority has been reached and <@${lynched_user.id}> has been lynched.**\n\n:full_moon:  **|**  *The Night Phase will begin once a Mod posts the Night Start post.*`);
                    msg.channel.overwritePermissions(alive_role, {'SEND_MESSAGES': false});
                    bot.mafia.eod.day = false;
                    bot.db.put('mafia.eod.day', bot.mafia.eod.day);
                } else {
                    bot.logger.severe(`Majority reached, player ID: ${lynched} not found`);
                }
            }
        });


    }
};

exports.info = {
    name: 'vote',
    usage: 'vote <@Player>',
    description: 'Votes for a specified player during a mafia game.'
};
