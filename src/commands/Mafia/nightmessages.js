// to add options/change gui: simply add/change this
let gui = {
    reset      : {emoji: '♻',  text: 'Reset the content of this message\n'},
    peace      : {emoji: '☮',  text: 'You slept peacefully.\n'},
    custom     : {emoji: '📧', text: 'Click this to add a custom message.\n'},
    roleblocked: {emoji: '🚫', text: 'You got rolebocked last night.\n'},
    jailed     : {emoji: '🏰', text: 'You were jailed last night.\n'},
    controlled : {emoji: '💫', text: 'You got controlled by a Witch last night.\n'},
    mafia_kill : {emoji: '💀', text: 'You got killed by the Mafia last night.\n'},
    sk_kill    : {emoji: '🔫', text: 'You got killed by the Serial Killer last night\n'},
    immune     : {emoji: '👎', text: 'Your target was immune to your attack.\n'},
    bodyguarded: {emoji: '💪', text: 'Your target was protected by the Bodyguard and you were killed by them last night.\n'},
    send       : {emoji: '✅',  text: '\n**You have 30 minutes to use this menu then it will time out!\n' +
                                     'If you are satisfied with the messages click the  ✅ below this message to send all (not empty) messages out.\n' +
                                     'To cancel click the 🇽**'},
    abort      : {emoji: '🇽', text: ''},

    // get the correct text to an emoji
    text_for_emote: function (emoji_name) {
        return Array.from(gui).find(elem => {if (elem.emoji === emoji_name) return elem;}).text;
    },

    // construct text for displaying a legend of which emoji does what
    legend_text: function () {
        return '\n\n\n**Legend:**\n' + Array.from(gui).map(elem => {return elem.emoji + ' : ' + elem.text;}).join('') + this.send.text;
    },

    // Iterator (ignores the 'send' emote keep that in mind)
    [Symbol.iterator]: function*() {
        for (let key in this) {
            if (this.hasOwnProperty(key) && typeof(this[key]) !== 'function' && key !== 'send' && key !== 'abort') yield this[key];
        }
    }
};
let msgs, alive_players;

exports.run = function (bot, msg) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !bot.mafia.isMod(msg.author.id)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }

    // The node.js default is 10 open listeners... I need one for each person + one for sending/canceling will be reset to 10 again at the end
    process.setMaxListeners(100);

    msgs = [];
    alive_players = bot.mafia.getPlayers();

    // iterate over all alive players and send one message per player to the (hopefully secret) channel, with emoji-reactions as menu
    msg.channel.send('__**----------- Night Message Menu -----------**__');
    for (let [, user] of alive_players) {
        msg.channel.send('**Send ' + user + ' (alias ' + user.displayName + ') following night message:**\nYou slept peacefully.')
           .then(tmp_msg => {
               // create reaction collector to log the emoji reactions TODO: Make an utilityfunction to create menus with collectors
               let collector = tmp_msg.createReactionCollector((_, user) => [msg.author.id].concat(bot.mafia.getModsID()).indexOf(user.id) > -1, {time: 1800000});

               // save sent message id to edit this message later - to save the whole object wont work b/c conten updates won't affect it (necessarily)
               // save the collector to be able to stop it later - this way it can be easily determend to which message each collector belongs
               msgs.push([tmp_msg.id, collector]);
               // create events - 'collect' triggers every time an emoji get added 'end' when collector stops
               collector.on('collect', reaction => _reactionEventMessageGroup(reaction, msg, bot));
               // clear reactions when the collector stops
               collector.on('end', () => { tmp_msg.clearReactions(); });

               // get gui as array and then everytime one got succesfully posted, post the next one and stop this collector once all are done
               let gui_elems = Array.from(gui);
               let collector2 = tmp_msg.createReactionCollector((_, user) => user.id === bot.user.id, {time: 100000});
               collector2.on('collect', reaction => {
                   if (reaction.message.reactions.array().length < gui_elems.length) {
                       tmp_msg.react(gui_elems[reaction.message.reactions.array().length].emoji).catch(console.log);
                   }
                   else {
                       collector2.stop();
                   }
               });
               tmp_msg.react(gui_elems[0].emoji).catch(console.log); // initial reaction to start the chain reaction
           });
    }

    // send legend & send + cancel button & create reaction collector + store it for later use as above
    msg.channel.send(gui.legend_text())
       .then(tmp_msg => {
           // this somehow fails to make them appear in always the same order... not to important tho
           tmp_msg.react(gui.send.emoji).then(tmp_msg.react(gui.abort.emoji)).catch(console.log);
           let collector = tmp_msg.createReactionCollector((a, user) => [msg.author.id].concat(bot.mafia.getModsID()).indexOf(user.id) > -1, {time: 1800000});
           msgs.push(['send/cancel', collector]);
           collector.on('collect', reaction => _reactionEventMessageSendCancel(reaction, bot));
           collector.on('end', reaction => {
               tmp_msg.clearReactions();
               if (reaction.message !== undefined && reaction.message.reactions.array().length === 0) {
                   tmp_msg.edit('\n\n**Menu timed out... are 30 minutes really not enough? Or did you just forgot to send/cancel?**');
               }
               else {
                   tmp_msg.edit('\n\n**Finished!**');
               }
           });
       });
};

// fires every time a reaction (emoji) from the command-initiator is added to one of the messages
function _reactionEventMessageGroup(reaction, own_msg, bot) {
    let msg = reaction.message;
    if (reaction.emoji.name === gui.reset.emoji) {
        msg.edit(msg.content.split('\n')[0]);
        // This can be used to reset the gui after pressing the reset emoji but it is more irritating than usefull imo...
        // for (let tmp_user of reaction.users.array()) {
        //     if (tmp_user === msg.author) continue;
        //     for (let tmp_reaction of msg.reactions.array())
        //         tmp_reaction.remove(tmp_user);
        // }
        return;
    }
    // Handling of custom messages - only accepts messages from the one who initiated the command
    if (reaction.emoji.name === gui.custom.emoji) {
        msg.channel.send('\n\n**Enter your custom message.**') // + msg.mentions.users.array()[0])
           .then(() => {
               // waits for the next message (timeout 5 min) of the author and add the content of it to this persons 'to send messages' list
               msg.channel.awaitMessages(m => [own_msg.author.id].concat(bot.mafia.getModsID()).indexOf(m.author.id) > -1, {max: 1, time: 300000})
                  .then(collected => {
                      msg.edit(msg.content + '\n' + collected.array()[0]);
                  });
           });
        return;
    }
    let content_addition = gui.text_for_emote(reaction.emoji.name);
    if (!content_addition) return;
    msg.edit(msg.content + '\n' + content_addition);
}

// fires every time an reaction (emoji) form command-initiator is added to the last message (legende + send/cancel)
function _reactionEventMessageSendCancel(reaction, bot) {
    let emo_name = reaction.emoji.name;
    if ([gui.abort.emoji, gui.send.emoji].indexOf(emo_name) < 0) return;

    if (emo_name === gui.abort.emoji) {
        msgs.map(pair => pair[1].stop()); // stops all collectors and thus removes all emojis from all messages
        return;
    }

    if (emo_name === gui.send.emoji) {
        let remaining_msgs = [];
        for (let pair of msgs) {
            // do not handle the send/cancel message here
            if (pair[0] === 'send/cancel') {
                remaining_msgs.push(pair);
                continue;
            }
            // need to get the message again... content could have canged...
            reaction.message.channel.fetchMessage(pair[0]).then(tmp_msg => {
                let recipient_id          = tmp_msg.content.split('<@')[1];
                recipient_id = recipient_id.replace('!','');
                recipient_id = recipient_id.split('>')[0];
                let recipient             = alive_players.get(recipient_id);
                let tmp_msg_content_array = tmp_msg.content.split('\n').splice(1);
                let continue_function     = true;
                if (tmp_msg_content_array.length === 0) {
                    remaining_msgs.push(pair);
                    continue_function = false;
                }
                if (continue_function) { // kinda ugly but you can't use continue inside a function ofc...
                    recipient.send(tmp_msg_content_array.join('\n'))
                             .then(send_msg => {
                                 tmp_msg.edit('**Message successful sent to: ' + recipient + ' (alias ' + recipient.displayName + '):**\n' + send_msg.content + '\n')
                                        .then(() => {
                                            pair[1].stop(); // stop the collector that was related to the message
                                        }).catch(console.error);
                             });
                }
            }).catch(console.error);
        }
        msgs = remaining_msgs;
    }
    // let the bot time to update the msgs array - we dont need to rush the clearing of the emojis and listeners
    bot.setTimeout( () => {
        if (msgs.length === 0 || (msgs.length === 1 && msgs[0][0] === 'send/cancel')) {
            msgs.map(pair => pair[1].stop());
            process.setMaxListeners(10); // reset the maximum of event listeners back to node.js defaults 10
        }
    }, 5000);
}

exports.info = {
    name       : 'nm',
    usage      : 'nm',
    description: 'Shows a menue to send alive (or just killed) players messages what happend last/this night'
};
