// to add options/change emojis: simply add/change this
let emojis = {
    peace:          {name: '☮',    text: 'You slept peacefully.\n'},
    mafia_kill:     {name: '💀',   text: 'You got killed by the Mafia!\n'},
    sk_kill:        {name: '🔫',   text: 'You got killed by the Serial Killer!\n'},
    roleblocked:    {name: '🚫',   text: 'You got rolebocked!\n'},
    controlled:     {name: '💫',   text: 'You got controlled by the Witch!\n'},
    custom:         {name: '📧',   text: 'Click this to add a custom message.\n'},
    reset:          {name: '♻',    text: 'Reset the content of this message\n\n'},
    send:           {name: '✅',    text: '**You have 30 minutes to use this menu then it will time out!\n' +
                                         'If you are satisfied with the messages click the  ✅ ' +
                                         'below this message to send all (not empty) messages out.\n' +
                                         'To cancel click the 🇽**'},
    abort:          {name: '🇽',    text: ''},

    // get the correct text to an emoji
    text_for_emote: function(emoji_name) {
        return Array.from(emojis).find(emo => {if (emo.name === emoji_name) return emo;}).text;
    },

    // construct text for displaying a legend of which emoji does what
    legend_text : function () {
        let text_result = '\n\n\n**Legend:**\n';
        return text_result + Array.from(emojis).map(emo => {return emo.name + ' : ' + emo.text;}).join('') + this.send.text;
    },
    // Iterator ignores the 'send' emote keep that in mind
    [Symbol.iterator]: function* () {
        for (let key in this)
            if (this.hasOwnProperty(key) && typeof(this[key]) !== 'function' && key !== 'send' && key !== 'abort')
                yield this[key];
    }
};
let msgs = [], collectors = [];

exports.run = function (bot, msg) {
    // The default is 10 open listeners... I need one for each person + one for sending/canceling | maybe reset later?
    process.setMaxListeners(0);
    // admin permission check
    if (!msg.member.hasPermission('ADMINISTRATOR') && (bot.mafia.mods.indexOf(msg.author.id) < 0)) {
        msg.channel.send(':negative_squared_cross_mark:  |  You are not a game moderator.');
        return;
    }
    let membersWithRole = msg.guild.roles.get(bot.mafia.data.players.alive).members.array();
    // iterate over all alive players and send one message per player to the(secret) channel with emoji-reactions as menu
    msg.channel.send('__**----------- Night Message Menu -----------**__');
    for (let member of membersWithRole) {
        msg.channel.send('**Send ' + member + ' following night message:**\n')
           .then(tmp_msg => {
               msgs.push(tmp_msg);
               // reaction collector to log the emoji reactions
               let collector = tmp_msg.createReactionCollector((_, user) => user.id === msg.author.id, { time: 1800000 });
               // save collector object to close it later
               collectors.push(collector);
               // create event - triggers every time an emoji get added
               collector.on('collect', reaction => _reactionEventMessageGroup(reaction, msg));
               collector.on('end', () => { tmp_msg.clearReactions(); });
               // get emojis as array and then everytime one got succesfully posted post the next one and stop
               // this collector once finished
               let tmp_emojis = Array.from(emojis);
               let collector2 = tmp_msg.createReactionCollector((_, user) => user.id === bot.user.id, { time: 100000 });
               collector2.on('collect', reaction => {
                   if (reaction.message.reactions.array().length < tmp_emojis.length)
                       tmp_msg.react(tmp_emojis[reaction.message.reactions.array().length].name);
                   else collector2.stop();
               });
               tmp_msg.react(tmp_emojis[0].name); // initial reaction to start it off
           });
    }
    msg.channel.send(emojis.legend_text())  // send legend & send button + create reaction collector as above
       .then( tmp_msg => {
           tmp_msg.react(emojis.send.name).then(tmp_msg.react(emojis.abort.name));
           let collector = tmp_msg.createReactionCollector((_, user) => user.id === msg.author.id, { time: 1800000 });
           collectors.push(collector);
           collector.on('collect', reaction => _reactionEventMessageSendCancel(reaction));
           collector.on('end', reaction => {
               tmp_msg.clearReactions();
               if (reaction.message !== undefined && reaction.message.reactions.array().length === 0)
                   tmp_msg.edit('\n\n**Menu timed out... are 30 minutes really not enough? Or did you just forgot to send/cancel?**')
                          ;
               else tmp_msg.edit('\n\n**Finished!**');
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
        //     if (tmp_user === msg.author)
        //         continue;
        //     for (let tmp_reaction of msg.reactions.array())
        //         tmp_reaction.remove(tmp_user);
        // }
        return;
    } // Handling of custom messages - only accepts messages from the one who initiated the command
    if (reaction.emoji.name === emojis.custom.name) {
        msg.channel.send('\n\n**Enter your custom message for **' + msg.mentions.users.array()[0])
           .then( send_msg => {
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
function _reactionEventMessageSendCancel(reaction) {
    let emo_name = reaction.emoji.name;
    if (emo_name === emojis.send.name) {
        let remaining_msgs = [];
        for (let index in msgs) {
            let tmp_msg = msgs[index];
            let tmp_msg_content_array = tmp_msg.content.split('\n').splice(1);
            if (tmp_msg_content_array.length === 0) {
                remaining_msgs.push(tmp_msg); // it is not possible to just .slice() the msgs because async sending...
                continue;
            }
            let recipient = tmp_msg.mentions.users.array()[0];
            recipient.send(tmp_msg_content_array.join('\n'))
                 .then( send_msg => {
                     tmp_msg.edit('**Message successful sent to: ' + recipient + ':**\n' + send_msg.content + '\n')
                        .then(() => {
                            collectors[index].stop();
                            collectors.splice(index, 1);
                        });
                 });
        }
        msgs = remaining_msgs;
    }
    if (msgs.length === 0 || emo_name === emojis.abort.name)
        collectors.map(col => col.stop());
}

exports.info = {
    name: 'nm',
    usage: 'nm',
    description: 'Shows a menue to send alive (or just killed) players messages what happend last/this night'
};
