exports.run = function (bot, msg, args) {
    if (bot.mafia.isMonitoredChannel(msg.channel.id)) {
        const error_response = `:negative_squared_cross_mark:  |  Please vote for a player by mentioning them, or use \`${bot.config.prefix}vote nolynch\` or \`${bot.config.prefix}unvote\``;

        if (bot.mafia.data.phase !== 2) { // PHASE_DAY
            msg.channel.send(':negative_squared_cross_mark:  **|  It\'s not currently day...**');
            return;
        }

        if (args.length < 1) {
            msg.channel.send(error_response);
            return;
        }

        if (!msg.member.roles.has(bot.mafia.getRoleID())) {
            msg.channel.send(':negative_squared_cross_mark:  |  You must be a player to vote.');
            return;
        }

        let vote = {};
        let param = args.join(' ').toLowerCase();
        vote.voter = msg.author.id;

        if (msg.mentions.members.size > 0) {
            let target = msg.mentions.members.last();
            vote.target = target.id;

            if (!target.roles.has(bot.mafia.getRoleID())) {
                msg.channel.send(error_response);
                return;
            }

        } else if (param === 'nolynch' || param === 'nl' || param === 'no lynch') {
            vote.target = '0';
        } else {
            msg.channel.send(error_response);
            return;
        }

        if (typeof bot.mafia.data.votes === 'undefined') {
            bot.mafia.data.votes = [];
        }

        bot.mafia.data.votes = bot.mafia.data.votes.filter(vote => vote.voter !== msg.author.id);
        bot.mafia.data.votes.push(vote);


        let output = bot.mafia.voteCountOutput();
        if (output) {
            msg.channel.send(output);
        }

        let lynched = bot.mafia.checkLynch();
        if (lynched) {
            if (lynched === '0') {
                bot.mafia.endDay('\u200b\n:exclamation:  **|  Majority has been reached and no one has been lynched.**');
            } else {
                let lynched_user = bot.mafia.getGuild().members.get(lynched);

                if (lynched_user) {
                    bot.mafia.endDay(`\u200b\n:exclamation:  **|  Majority has been reached and <@${lynched_user.id}> has been lynched.**`);
                } else {
                    bot.logger.severe(`Majority reached, player ID: ${lynched} not found`);
                    bot.mafia.endDay(`\u200b\n:exclamation:  **|  ERROR, TELL ABYSS: Majority has been reached but I can\'t tell who (${lynched}) is lynched.**`);
                }
            }
        } else {
            bot.mafia.saveDB();
        }
    }
};

exports.info = {
    name: 'vote',
    usage: 'vote <@Player>',
    description: 'Votes for a specified player during a mafia game.'
};
