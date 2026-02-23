const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (!message.guild) return;
        if (message.author?.bot) return;
        
        try {
            const channel = client.channels.cache.get(config.chatLogChannel);
            if (!channel) return;
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🗑️ Сообщение удалено')
                .addFields(
                    { name: 'Автор', value: message.author ? `<@${message.author.id}>` : 'Неизвестно', inline: true },
                    { name: 'Канал', value: `<#${message.channel.id}>`, inline: true }
                );
            
            if (message.content) {
                embed.addFields({ name: 'Содержимое', value: message.content.substring(0, 1024) });
            }
            
            embed.setTimestamp();
            
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in messageDelete:', error);
        }
    }
};
