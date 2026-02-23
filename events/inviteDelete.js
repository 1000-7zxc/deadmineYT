module.exports = {
    name: 'inviteDelete',
    async execute(invite, client) {
        try {
            const guildInvites = client.invites.get(invite.guild.id);
            if (guildInvites) {
                guildInvites.delete(invite.code);
            }
        } catch (error) {
            console.error('Error in inviteDelete:', error);
        }
    }
};
