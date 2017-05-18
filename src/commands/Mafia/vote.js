exports.run = function (bot, msg, args) {
    if (bot.mafia.isMonitoredChannel(msg.channel.id)) {
        const error_response = `:negative_squared_cross_mark:  |  Please vote for a player by mentioning them, or use \`${bot.config.prefix}vote nolynch\` or \`${bot.config.prefix}unvote\``;

        if (bot.mafia.data.phase !== 2) { // PHASE_DAY
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
            let lynched_user = bot.mafia.getGuild().members.get(lynched);
            let role = bot.mafia.getRole();

            if (lynched_user) {
                msg.channel.send(`\u200b\n:exclamation:  **|  Majority has been reached and <@${lynched_user.id}> has been lynched.**\n\n:cityscape:  **|  It is currently Dusk. The Night Phase will begin when a Mod starts it.**`);
                msg.channel.overwritePermissions(role, {'SEND_MESSAGES': false});
                bot.mafia.sendMods(`:exclamation:  **|  Majority has been reached and <@${lynched_user.id}> has been lynched.**`);
                bot.mafia.setPhase(3); // PHASE_DUSK
                // setPhase saves the bot.
            } else {
                bot.mafia.sendMods(`ERROR, TELL ABYSS: Majority reached, player ID: ${lynched} not found`);
                bot.logger.severe(`Majority reached, player ID: ${lynched} not found`);
            }
        }
    }
};

exports.info = {
    name: 'vote',
    usage: 'vote <@Player>',
    description: 'Votes for a specified player during a mafia game.'
};
