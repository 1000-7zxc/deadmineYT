module.exports = {
    name: 'inviteCreate',
    async execute(invite, client) {
        try {
            const guildInvites = client.invites.get(invite.guild.id) || new Map();
            guildInvites.set(invite.code, invite);
            client.invites.set(invite.guild.id, guildInvites);
        } catch (error) {
            console.error('Error in inviteCreate:', error);
        }
    }
};
