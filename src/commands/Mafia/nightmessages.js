// to add options/change emojis just add/change this
let emojis = {
    peace:          {name: '☮',    text: 'You slept peacefully.\n'},
    mafia_kill:     {name: '💀',   text: 'You got killed by the mafia!\n'},
    sk_kill:        {name: '🔫',   text: 'You got killed by the serial killer!\n'},
    roleblocked:    {name: '🚫',   text: 'You got rolebocked!\n'},
    controlled:     {name: '💫',   text: 'You got controlled by the witch!\n'},
    custom:         {name: '📧',   text: 'Click this to add a custom message.\n'},
    reset:          {name: '♻',    text: 'Reset the content of this message\n\n'},
    send:           {name: '✅',    text: '**You have 30 minutes to use this menu then it will time out!\n' +
                                         'If you are satisfied with the messages click the  ✅ ' +
                                         'below this message to send all (not empty) messages out.\n' +
                                         'To cancel click the 🇽**'},
    abort:          {name: '🇽',    text: ''},

    // get the correct text to an emoji
    text_for_emote: function(emoji_name) {
        for (let emoji of emojis) {
            if (emoji.name === emoji_name) {
                return emoji.text;
            }
        }
        return 'Emoji \'' + emoji_name + '\' not found';
    },

    // construct text for displaying a legend of which emoji does what
    legend_text : function () {
        let text_result = '\n\n\n**Legend:**\n';
        for (let emoji of emojis) {
            text_result += emoji.name + ' : ' + emoji.text;
        }
        return text_result + this.send.text;
    },
    // Iterator ignores the 'send' emote keep that in mind
    [Symbol.iterator]: function* () {
        for (let key in this) {
            if (typeof(this[key]) !== 'function' && key !== 'send' && key !== 'abort') {
                yield this[key];
            }
        }
    }
};

exports.run = function (bot, msg) {
    // The default is 10 open listeners... I need one for each person + one for sending/canceling
    process.setMaxListeners(0);
    msg.delete().catch(console.error);
    // admin permission check
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }
    let membersWithRole = msg.guild.roles.get(bot.mafia.players.alive).members.array();
    // iterate over all alive players and send one message per player to the(secret) channel
    // the command is messaged in with them mentioned and emoji-reactions as menu
    let msgs = [];
    let collectors = [];
    msg.channel.send('__**----------- Night Message Menu -----------**__');
    for (let member of membersWithRole) {
        msg.channel.send('**Send ' + member + ' following night message:**\n')
           .then(
               tmp_msg => {
                   // TODO: somehow make, that the reactions always have the same order...
                   // nesting them into .then(msg.react(...).then(msg.ract(...)) did not do the trick...
                   for (let emoji of emojis) {
                       tmp_msg.react(emoji.name).catch(console.error);
                   }
                   // reaction collector to log the emoji reactions
                   let collector = tmp_msg.createReactionCollector((_, user) => user.id !== bot.user.id, { time: 1800000 });
                   // save collector object to close it later
                   collectors.push(collector);
                   msgs.push(tmp_msg);
                   // create event - triggers every time an emoji get added
                   collector.on('collect', reaction => _reactionEventEditMessage(tmp_msg, reaction));
               }
           ).catch(console.error);
    }
    msg.channel.send(emojis.legend_text())  // send legend & send button + create reaction collector as above
       .then( tmp_msg => {
           tmp_msg.react(emojis.send.name).catch(console.error);
           tmp_msg.react(emojis.abort.name).catch(console.error);
           let collector = tmp_msg.createReactionCollector((_, user) => user.id !== bot.user.id, { time: 1800000 });
           collectors.push(collector);
           collector.on('collect', reaction => _reactionEventSendCancelMessage(msgs, reaction, collectors));
           collector.on('end', reaction => {
               if (reaction.size === 0) {
                   tmp_msg.edit('\n\n**Sending messages timed out... are 30 minutes really not' +
                                ' enough? Or did you just missed to send/cancel?**').catch(console.error);
               }
               else {
                   tmp_msg.edit('\n\n**Finished!**').catch(console.error());
               }
               tmp_msg.clearReactions();
           });
       }).catch(console.error);
};

// fires every time a reaction (emoji) is added to one of the messages
function _reactionEventEditMessage(msg, reaction) {
    if (reaction.emoji.name === emojis.reset.name) {
        msg.edit(msg.content.split('\n')[0]).catch(console.error);
        // This can be used to reset the emojis after pressing the reset emoji but it is
        // more irritating than usefull imo...
        // for (let tmp_user of reaction.users.array()) {
        //     if (tmp_user === msg.author) {
        //         continue;
        //     }
        //     for (let tmp_reaction of msg.reactions.array()) {
        //         tmp_reaction.remove(tmp_user);
        //     }
        // }
        return;
    }
    // Handling of custom messages
    // TODO: Currently listens to all messages (exept bots own) not only the ones from whom added the emoji!
    if (reaction.emoji.name === emojis.custom.name) {
        msg.channel.send('\n\n**Enter your custom message for **' + msg.mentions.users.array()[0])
           .then( send_msg => {
               msg.channel.awaitMessages(tmp_msg => tmp_msg.author !== msg.author, {max: 1})
                  .then(collected => {
                      msg.edit(msg.content + '\n' + collected.array()[0]).catch(console.error).catch(console.error);
                      send_msg.delete();
                      collected.array()[0].delete();
                  });
           }).catch(console.error);
        return;
    }
    // catching other emojis here could be good thing to do...
    msg.edit(msg.content + '\n' + emojis.text_for_emote(reaction.emoji.name)).catch(console.error);
}

// fires every time an reaction (emoji) is added to the last message (legende + send/cancel)
function _reactionEventSendCancelMessage(msgs, reaction, collectors) {
    let emo_name = reaction.emoji.name;
    if (emo_name === emojis.send.name) {
        let remaining_msgs = [];
        for (let index in msgs) {
            let tmp_msg = msgs[index];
            let tmp_msg_content_array = tmp_msg.content.split('\n').splice(1);
            if (tmp_msg_content_array.length === 0) {
                remaining_msgs.push(tmp_msg);
                continue;
            }
            let recipient = tmp_msg.mentions.users.array()[0];
            recipient.send(tmp_msg_content_array.join('\n'))
                     .then( send_msg => {
                         tmp_msg.edit(
                             '**Message successful sent to: ' + recipient + ':**\n' + send_msg.content + '\n'
                         ).then( () => {
                             tmp_msg.clearReactions().catch(console.error);
                             collectors[index].stop();
                             collectors.splice(index, 1);
                         }).catch(console.log);
                     }).catch(console.error);
        }
        msgs = remaining_msgs; // it is not possible to just .slice() the msgs because async...
    }
    if (msgs.length === 0 || emo_name === emojis.abort.name) {
        for (let tmp_collector of collectors) {
            tmp_collector.stop();
        }
        for (let tmp_msg of msgs) {
            tmp_msg.clearReactions();
        }
    }
}

exports.info = {
    name: 'nm',
    usage: 'nm',
    description: 'Shows a menue to send alive (or just killed) players messages what happend last/this night'
};
