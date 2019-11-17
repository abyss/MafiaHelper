const bot = require('../bot');

const checkDebug = (author, command) => {
    const debug = command.config.debug || command.mod.config.debug;
    if (debug && !bot.config.isOwner(author)) return false;
    return true;
};

const hasPermission = async (guild, member, command) => {
    let position = -1;
    let state = '';

    for (const [id, role] of member.roles) {
        // highest position gets priority, in all non-undefined cases
        if (role.calculatedPosition > position) {
            let newState = await bot.db.get(guild.id, `permissions['${command.id}'].groups.${id}`);
            if (newState) {
                position = role.calculatedPosition;
                state = newState;
            }
        }
    }

    if (state === 'allow') return true;
    if (state === 'deny') return false;

    // None of the above? Fall back to Default
    const commandDefaultPermissions = command.config.defaultPermissions;

    if (commandDefaultPermissions.includes('NOONE')) {
        return false;
    }

    return member.hasPermission(commandDefaultPermissions);
};

const setCommandPermission = (guildId, cmdId, roleId, state = 'default') => {
    // state can be 'allow' 'deny' or 'default'
    const dbKey = `permissions['${cmdId}'].groups.${roleId}`;

    if (state === 'allow' || state === 'deny') {
        return bot.db.set(guildId, dbKey, state);
    } else {
        return bot.db.delete(guildId, dbKey);
    }
};

module.exports = {
    checkDebug,
    hasPermission,
    setCommandPermission
};
