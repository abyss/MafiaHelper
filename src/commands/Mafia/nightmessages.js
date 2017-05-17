const _    = require('lodash');
// to add options/change emojis: simply add/change this
let emojis = {
    peace      : {name: '☮',  text: 'You slept peacefully.\n'},
    roleblocked: {name: '🚫', text: 'You got rolebocked last night.\n'},
    jailed     : {name: '🏰', text: 'You were jailed last night.\n'},
    controlled : {name: '💫', text: 'You got controlled by a Witch last night.\n'},
    mafia_kill : {name: '💀', text: 'You got killed by the Mafia last night.\n'},
    sk_kill    : {name: '🔫', text: 'You got killed by the Serial Killer last night\n'},
    immune     : {name: '👎', text: 'Your target was immune to your attack.\n'},
    bodyguarded: {name: '💪', text: 'Your target was protected by the Bodyguard and you were killed by them last night.\n'},
    custom     : {name: '📧', text: 'Click this to add a custom message.\n'},
    reset      : {name: '♻',  text: 'Reset the content of this message\n\n'},
    send       : {name: '✅',  text: '**You have 30 minutes to use this menu then it will time out!\n' +
                                    'If you are satisfied with the messages click the  ✅ below this message to send all (not empty) messages out.\n' +
                         'To cancel click the 🇽**'},
    abort      : {name: '🇽', text: ''},

    // get the correct text to an emoji
    text_for_emote: function (emoji_name) {
        return Array.from(emojis).find(emo => {if (emo.name === emoji_name) return emo;}).text;
    },

    // construct text for displaying a legend of which emoji does what
    legend_text: function () {
        return '\n\n\n**Legend:**\n' + Array.from(emojis).map(emo => {return emo.name + ' : ' + emo.text;}).join('') + this.send.text;
    }, // Iterator ignores the 'send' emote keep that in mind

    [Symbol.iterator]: function*() {
        for (let key in this) {
            if (this.hasOwnProperty(key) && typeof(this[key]) !== 'function' && key !== 'send' && key !== 'abort') yield this[key];
        }
    }
};
let msgs   = [], collectors = [], killed_people = [], members_with_role = [], current_state;

exports.run = function (bot, msg) {
    // The default is 10 open listeners... I need one for each person + one for sending/canceling | maybe reset later?
    process.setMaxListeners(0);
    msgs = [], collectors = [], killed_people = [], current_state = 'editing_messages';
    // admin permission check
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }
    members_with_role = msg.guild.roles.get(bot.mafia.data.players.alive).members.array();
    // iterate over all alive players and send one message per player to the(secret) channel with emoji-reactions as menu
    msg.channel.send('__**----------- Night Message Menu -----------**__');
    for (let member of members_with_role) {
        msg.channel.send('**Send ' + member + ' following night message:**\n')
           .then(tmp_msg => {
               msgs.push(tmp_msg.id);
               // reaction collector to log the emoji reactions
               let collector = tmp_msg.createReactionCollector((_, user) => user.id === msg.author.id, {time: 1800000});
               // save collector object to close it later
               collectors.push(collector);
               // create event - triggers every time an emoji get added
               collector.on('collect', reaction => _reactionEventMessageGroup(reaction, msg));
               collector.on('end', () => { tmp_msg.clearReactions(); });
               // get emojis as array and then everytime one got succesfully posted post the next one and stop
               // this collector once finished
               let tmp_emojis = Array.from(emojis);
               let collector2 = tmp_msg.createReactionCollector((_, user) => user.id === bot.user.id, {time: 100000});
               collector2.on('collect', reaction => {
                   if (reaction.message.reactions.array().length < tmp_emojis.length) {
                       tmp_msg.react(tmp_emojis[reaction.message.reactions.array().length].name);
                   }
                   else {
                       collector2.stop();
                   }
               });
               tmp_msg.react(tmp_emojis[0].name); // initial reaction to start it off
           });
    }
    msg.channel.send(emojis.legend_text())  // send legend & send button + create reaction collector as above
       .then(tmp_msg => {
           tmp_msg.react(emojis.send.name).then(tmp_msg.react(emojis.abort.name));
           let collector = tmp_msg.createReactionCollector((_, user) => user.id === msg.author.id, {time: 1800000});
           collectors.push(collector);
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

// fires every time a reaction (emoji) from the command initiator is added to one of the messages
function _reactionEventMessageGroup(reaction, own_msg) {
    let msg = reaction.message;
    if (reaction.emoji.name === emojis.reset.name) {
        msg.edit(msg.content.split('\n')[0]);
        // This can be used to reset the emojis after pressing the reset emoji but it is more irritating than usefull imo...
        // for (let tmp_user of reaction.users.array()) {
        //     if (tmp_user === msg.author) continue;
        //     for (let tmp_reaction of msg.reactions.array())
        //         tmp_reaction.remove(tmp_user);
        // }
        return;
    } // Handling of custom messages - only accepts messages from the one who initiated the command
    if (reaction.emoji.name === emojis.custom.name) {
        msg.channel.send('\n\n**Enter your custom message for **' + msg.mentions.users.array()[0])
           .then(send_msg => {
               msg.channel.awaitMessages(m => m.author.id === own_msg.author.id, {max: 1})
                  .then(collected => {
                      msg.edit(msg.content + '\n' + collected.array()[0]);
                      send_msg.delete();
                      collected.array()[0].delete();
                  });
           });
        return;
    } // catching other emojis here could be good thing to do...
    msg.edit(msg.content + '\n' + emojis.text_for_emote(reaction.emoji.name));
}

// fires every time an reaction (emoji) form command initiator is added to the last message (legende + send/cancel)
function _reactionEventMessageSendCancel(reaction, bot) {
    let emo_name = reaction.emoji.name;
    if ([emojis.abort.name, emojis.send.name].indexOf(emo_name) < 0) return;

    // swich-casing over all the different states that can occur when hitting 'send' or 'cancel'
    if (current_state === 'editing_messages') {
        if (emo_name === emojis.abort.name) {
            collectors.map(col => col.stop());
            return;
        }
        if (emo_name === emojis.send.name) {
            let remaining_msgs = [];
            for (let index in msgs) {
                reaction.message.channel.fetchMessage(msgs[index]).then(tmp_msg => {
                    let tmp_msg_content_array = tmp_msg.content.split('\n').splice(1), continue_function = true;
                    if (tmp_msg_content_array.length === 0) {
                        remaining_msgs.push(tmp_msg.id); // it is not possible to just .slice() the msgs because async sending...
                        continue_function = false;
                    }
                    if (continue_function) {
                        let recipient = tmp_msg.mentions.users.array()[0];
                        if (_.filter(['you got killed', 'killed you', 'you were killed', 'you died'], e => {
                            return tmp_msg_content_array.join(' ').toLowerCase().includes(e);
                        }).length > 0) {
                            killed_people.push(recipient);
                        }
                        recipient.send(tmp_msg_content_array.join('\n'))
                                 .then(send_msg => {
                                     tmp_msg.edit('**Message successful sent to: ' + recipient + ':**\n' + send_msg.content + '\n')
                                            .then(() => {
                                                collectors[index].stop();
                                            });
                                 });
                    }
                });
            }
            msgs = remaining_msgs;
        }
        if (msgs.length === 0) {
            current_state = 'asked_roles';
            reaction.message.edit('**Should the roles of the people that died be updated now?** *(-alive, +dead)\n(Shows a list first)*');
        }
    }
    else if (current_state === 'asked_roles' && emo_name === emojis.send.name) {
        current_state = 'confirm_role_changes';
        reaction.message.edit('**Today died: ' + killed_people.join(' and ') + '\nCorrect? (If not no roles will be' + ' changed)**');
    }
    else if ((current_state === 'asked_roles' && emo_name === emojis.abort.name) || current_state === 'confirm_role_changes') {
        current_state = 'asked_end_night';
        reaction.message.edit('**End the night now?**\n*24h by default or 2h per additional emoji you react with to' + ' this message');
        if (emo_name === emojis.send.name) {
            for (let user of killed_people) {
                for (let member of members_with_role) {
                    if (member.user === user) {
                        member.removeRole(bot.mafia.data.players.alive).catch(console.error);
                        member.addRole(bot.mafia.data.players.dead).catch(console.error);
                    }
                }
            }
        }
    }
    else if (current_state === 'asked_end_night') {
        if (emo_name === emojis.send.name) {
            reaction.message.channel.fetchMessage(reaction.message.id)
                    .then(tmp_msg => {
                        let time = (tmp_msg.reactions.array().length - 2) * 2;
                        if (time <= 0) time = 24;
                        reaction.message.edit('**A ' + time + ' hour day will be started!**');
                        bot.commands.execute(reaction.message, bot.commands.get('startday'), time);
                    }).catch(console.error);
        }
        collectors.map(col => col.stop());
        collectors = [];
    }
}

exports.info = {
    name       : 'nm',
    usage      : 'nm',
    description: '\n1. Shows a menue to send alive (or just killed) players messages what happend last/this night\n' +
                 '2. Tries to identify the player that died this night and can change their roles accordingly\n' +
                 '3. Can be used to initiate the next day immediatly after'
};
