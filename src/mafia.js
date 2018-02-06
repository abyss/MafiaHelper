const moment = require('moment');
const _ = require('lodash');

const PHASE_DAWN = 1;
const PHASE_DAY = 2;
const PHASE_DUSK = 3;
const PHASE_NIGHT = 4;

class MafiaGame {

    constructor(bot) {
        this.bot = bot;
        this.loaded = false;
        this.loadDB();
    }

/* New Data Structure:
{
    "mods": [],

    "primary": {
        "role": "0",
        "channel": "0",
        "guild": "0"
    },

    "mafia": {
        "role": "0",
        "channel": "0",
        "guild": "0"
    },

    "mason": {
        "role": "0",
        "channel": "0",
        "guild": "0"
    },

    "phase": 0, // 1: Dawn, 2: Day, 3: Dusk, 4: Night
    "timer": "moment()",

    "votes": [],
    "votepower": [{
        "user": "0",
        "power": 0
    }],
    "majority": 0
}
*/

    loadDB() {
        this.bot.db.get('mafia').then(mafia_data => {
            this.data = mafia_data || {};

            let time = _.get(this.data, 'timer', null);

            if (time) {
                _.set(this.data, 'timer', moment(this.data.timer));
            } else {
                _.set(this.data, 'timer', null);
            }

            this.loaded = true;
        });
    }

    saveDB() {
        this.bot.db.put('mafia', this.data).catch(err => {
            this.bot.logger.severe('Cannot saveDB:');
            this.bot.logger.severe(err);
        });
    }

    getGuild() {
        let guildID = _.get(this.data, 'primary.guild', null);
        if (!guildID) { return null; }
        return this.bot.guilds.get(guildID);
    }

    getMafiaGuild() {
        let guildID = _.get(this.data, 'mafia.guild', null);
        if (!guildID) { return null; }
        return this.bot.guilds.get(guildID);
    }

    getMasonGuild() {
        let guildID = _.get(this.data, 'mason.guild', null);
        if (!guildID) { return null; }
        return this.bot.guilds.get(guildID);
    }

    getChannel() {
        let channelID = _.get(this.data, 'primary.channel', null);
        if (!channelID) { return null; }
        return this.bot.channels.get(channelID);
    }

    getMafiaChannel() {
        let channelID = _.get(this.data, 'mafia.channel', null);
        if (!channelID) {return null; }
        return this.bot.channels.get(channelID);
    }

    getMasonChannel() {
        let channelID = _.get(this.data, 'mason.channel', null);
        if (!channelID) {return null; }
        return this.bot.channels.get(channelID);
    }

    getRole() {
        let roleID = _.get(this.data, 'primary.role', null);
        let guild = this.getGuild();
        if (!(roleID && _.get(guild, 'available', false))) { return null; }
        let role = guild.roles.get(roleID);
        if (role) {
            return role;
        } else {
            return null;
        }
    }

    getRoleID() {
        return _.get(this.data, 'primary.role', null);
    }

    getPlayers() {
        // Returns a Discord.js Collection of GuildMembers
        let role = this.getRole();
        if (!role) { return; }
        return role.members;
    }

    getMafiaRole() {
        let roleID = _.get(this.data, 'mafia.role', null);
        let guild = this.getMafiaGuild();
        if (!(roleID && _.get(guild, 'available', false))) { return null; }
        let role = guild.roles.get(roleID);
        if (role) {
            return role;
        } else {
            return null;
        }
    }

    getMafiaPlayers() {
        // Returns a Discord.js Collection of GuildMembers
        let role = this.getMafiaRole();
        if (!role) { return; }
        return role.members;
    }

    getMasonRole() {
        let roleID = _.get(this.data, 'mason.role', null);
        let guild = this.getMasonGuild();
        if (!(roleID && _.get(guild, 'available', false))) { return null; }
        let role = guild.roles.get(roleID);
        if (role) {
            return role;
        } else {
            return null;
        }
    }

    getMasonPlayers() {
        // Returns a Discord.js Collection of GuildMembers
        let role = this.getMasonRole();
        if (!role) { return; }
        return role.members;
    }

    setPhase(phase) {
        _.set(this.data, 'phase', phase);
        this.saveDB();
    }

    getMonitoredChannelIDs() {
        let channels = [];
        let chan = _.get(this.data, 'primary.channel', null);
        if (chan) {
            channels.push(chan);
        }

        chan = _.get(this.data, 'mafia.channel', null);
        if (chan) {
            channels.push(chan);
        }

        chan = _.get(this.data, 'mason.channel', null);
        if (chan) {
            channels.push(chan);
        }

        return channels;
    }

    isMonitoredChannel(id) {
        let allMonitored = this.getMonitoredChannelIDs();
        return (allMonitored.indexOf(id) >= 0);
    }

    getMods() {
        let mods = _.get(this.data, 'mods', []);
        let output = [];
        mods.forEach(modid => {
            let mod = this.bot.users.get(modid);
            if (mod) {
                output.push(mod);
            }
        });

        return output;
    }

    getModsID() {
        return _.get(this.data, 'mods', []);
    }

    isMod(id) {
        let allMods = this.getModsID();

        return (allMods.indexOf(id) >= 0);
    }

    sendMods(msgs) {
        if (typeof msgs === 'string') {
            msgs = [msgs];
        }

        if (!msgs) { return; }

        let mods = this.getMods();

        mods.forEach(moduser => {
            msgs.forEach(msg => {
                moduser.send(msg);
            });
        });
    }

    submitVote(vote) {
        // vote = {
        //     voter: "0",
        //     target: "0"
        // }

        if (typeof this.data.votes === 'undefined') {
            this.data.votes = [];
        }

        this.data.votes = this.data.votes.filter(x => x.voter !== vote.voter);

        const votePowerArray = _.get(this.data, 'votepower', []);

        const limitedVotePowerArray = votePowerArray.filter(x => x.voter === vote.voter);
        let votePower;

        if (limitedVotePowerArray.length > 0) {
            votePower = limitedVotePowerArray[0].power;
        } else {
            votePower = 1;
        }

        for(let i = 0; i < votePower; i += 1) {
            this.data.votes.push(vote);
        }
    }

    buildVoteTable() {
        let vote_table = new Map();

        if (!this.data.votes) {
            return vote_table;
        }

        this.data.votes.forEach(vote => {
            if (!vote_table.has(vote.target)) {
                vote_table.set(vote.target, []);
            }

            vote_table.get(vote.target).push(vote.voter);
        });

        return vote_table;
    }

    checkLynch() {
        if (this.data.majority == 0) {
            return null; // No lynches on 0 majority.
        }

        let vote_table = this.buildVoteTable();

        for (let [key, value] of vote_table) {
            if (value.length >= this.data.majority) {
                return key;
            }
        }

        return null;
    }

    voteCountOutput() {
        let vote_table = this.buildVoteTable();
        let output = [];
        let guild = this.getGuild();

        if (!(_.get(guild, 'available', false))) {
            return ':negative_squared_cross_mark:  |  ERROR: Primary Server not available.';
        }

        output.push(':ballot_box: **Current Vote Count** :ballot_box:\n');

        if (vote_table.size === 0) {
            output.push('There are currently no votes.\n');
        }

        for (let [key, value] of vote_table) {
            let target;

            if (key === '0') {
                target = 'No Lynch';
            } else {
                let target_member = guild.members.get(key);

                if (target_member) {
                    target = target_member.displayName;
                } else {
                    target = `Unknown User: ${key}`;
                }
            }

            output.push(`__**${target}**__ \`(${value.length})\``);

            value.forEach(voter => {
                output.push(guild.members.get(voter).displayName);
            });

            output.push('');
        }

        let majority = _.get(this.data, 'majority', 0);

        if (majority > 0) {
            output.push(`*Majority is ${majority} votes.*`);
        }

        return output.join('\n');
    }

    startDay(hours) {
        let now = moment();
        let day_end = now.add(hours, 'hours');
        let role = this.getRole();
        let channel = this.getChannel();

        if (!(role && channel)) {
            throw 'Please make sure you \`setgame\` first.';
        }

        let num_players = role.members.size;
        let majority = Math.floor((num_players+2)/2);

        this.data.timer = day_end;
        this.data.phase = PHASE_DAY;
        this.data.votes = [];
        this.data.majority = majority;

        channel.overwritePermissions(role, {'SEND_MESSAGES': true});

        channel.send(':sunny:  **|  The Day has begun!**');
        this.saveDB();

        return true;
    }

    startNight(hours) {
        let now = moment();
        let night_end = now.add(hours, 'hours');
        let role = this.getMafiaRole();
        let channel = this.getMafiaChannel();
        let masonRole = this.getMasonRole();
        let masonChannel = this.getMasonChannel();

        if (!(role && channel)) {
            throw 'Please make sure you \`setmafia\` first.';
        }

        this.data.timer = night_end;
        this.data.phase = PHASE_NIGHT;

        channel.overwritePermissions(role, {'SEND_MESSAGES': true});
        channel.send(':full_moon:  **|  The Night has begun!**');

        if (masonChannel && masonRole) {
            masonChannel.overwritePermissions(masonRole, {'SEND_MESSAGES': true});
            masonChannel.send(':full_moon:  **|  The Night has begun!**');
        }

        this.saveDB();
    }

    endDay(message) {
        const APPEND = '\n\n:cityscape:  **|  It is currently Dusk. The Night Phase will begin when a Mod starts it.**';
        let channel = this.getChannel();
        let role = this.getRole();
        if (!(channel && role)) { return; }

        this.sendMods(message);
        channel.send(message + APPEND);

        channel.overwritePermissions(role, {'SEND_MESSAGES': false});
        this.setPhase(PHASE_DUSK);
    }

    endNight(message) {
        const APPEND = '\n\n:city_dusk:  **|  It is currently Dawn. The Day Phase will begin when a Mod starts it.**';
        let channel = this.getChannel();
        let mafiaChannel = this.getMafiaChannel();
        let mafiaRole = this.getMafiaRole();
        let masonChannel = this.getMasonChannel();
        let masonRole = this.getMasonRole();

        if (!channel) { return; }

        this.sendMods(message);
        channel.send(message + APPEND);

        if (mafiaChannel && mafiaRole) {
            mafiaChannel.send(message + APPEND);
            mafiaChannel.overwritePermissions(mafiaRole, {'SEND_MESSAGES': false});
        }

        if (masonChannel && masonRole) {
            masonChannel.send(message + APPEND);
            masonChannel.overwritePermissions(masonRole, {'SEND_MESSAGES': false});
        }

        this.setPhase(PHASE_DAWN);
    }

    clearVotes() {
        this.data.votes = [];

        this.saveDB();
    }

    phaseTimer() {
        if (!this.loaded) { return; }

        let phase = _.get(this.data, 'phase', 0);
        let timer = _.get(this.data, 'timer', null);
        if (!(timer && phase)) { return; }

        if (phase === PHASE_DAWN || phase === PHASE_DUSK) { return; }

        if (timer.isBefore()) {

            if (phase === PHASE_DAY) {
                this.endDay(':exclamation:  **|  Majority was not reached before the end of the Day, so no one has been lynched.**');
            } else if (phase === PHASE_NIGHT) {
                this.endNight(':exclamation:  **|  The Night Phase has ended.**');
            }
        }
    }

    messageUpdate(oldMsg, newMsg) {
        if (oldMsg.author.bot) return; // #nope.
        if (oldMsg.content === newMsg.content) return; // lol embeds do this. srsly.

        let output = [];

        if (this.isMonitoredChannel(oldMsg.channel.id) && !this.isMod(oldMsg.author.id)) {
            output.push(`This message from <@${oldMsg.author.id}> was edited in <#${oldMsg.channel.id}> on ${oldMsg.guild.name}: \n**Old**:`);
            output.push(`\`\`\`${oldMsg.content}\`\`\``);
            output.push('**New:**');
            output.push(`\`\`\`${newMsg.content}\`\`\``);

            this.sendMods(output);
        }
    }

    messageDelete(msg) {
        if (msg.author.bot) return;

        let output = [];
        if (this.isMonitoredChannel(msg.channel.id) && !this.isMod(msg.author.id)) {
            output.push(`This message from <@${msg.author.id}> was deleted in <#${msg.channel.id}> on ${msg.guild.name}:`);
            output.push(`\`\`\`${msg.content}\`\`\``);

            this.sendMods(output);
        }
    }

    beautifyToMoment(time) {
        let categories = ['day', 'hour', 'minute', 'second'];
        let ret = [];

        let now = moment();

        if (!moment.isMoment(time)) {
            throw 'Must pass a moment';
        }

        let diff = moment.duration(time.diff(now));

        for (let i = 0; i < categories.length; i += 1) {
            let catName = categories[i];
            let catTime = diff.get(catName);

            if (catTime === 0) {
                continue;
            }

            if (catTime !== 1) {
                catName += 's';
            }

            ret.push(`${catTime} ${catName}`);
        }

        if (ret.length === 1) {
            return ret[0];
        } else if (ret.length === 2) {
            return `${ret[0]} and ${ret[1]}`;
        }

        let last = ret[ret.length - 1];
        ret[ret.length - 1] = `and ${last}`;

        return ret.join(', ');
    }

    timeToTimer() {
        let timer = _.get(this.data, 'timer', null);
        if (!moment.isMoment(timer)) {
            return null;
        }

        return this.beautifyToMoment(timer);
    }
}

module.exports = function(bot) { return new MafiaGame(bot); };
