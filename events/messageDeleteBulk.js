const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'messageDeleteBulk',
    async execute(messages, client) {
        const channel = client.channels.cache.get(config.chatLogChannel);
        if (!channel) {
            console.error('Chat log channel not found!');
            return;
        }

        try {
            const firstMessage = messages.first();
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🗑️ Массовое удаление сообщений')
                .addFields(
                    { name: 'Количество', value: `${messages.size} сообщений`, inline: true },
                    { name: 'Канал', value: `<#${firstMessage.channelId}>`, inline: true }
                )
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            console.log(`✅ Logged bulk message deletion: ${messages.size} messages`);
        } catch (error) {
            console.error('Error logging bulk message deletion:', error);
        }
    }
};
