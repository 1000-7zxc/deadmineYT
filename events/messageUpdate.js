const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        // Skip bot messages
        if (newMessage.author?.bot) return;
        
        // Skip if content is the same (embed updates, etc)
        if (oldMessage.content === newMessage.content) return;
        
        const channel = client.channels.cache.get(config.chatLogChannel);
        if (!channel) {
            console.error('Chat log channel not found!');
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('✏️ Сообщение изменено')
                .setTimestamp();

            // Add author info
            if (newMessage.author) {
                embed.addFields(
                    { name: 'Автор', value: `<@${newMessage.author.id}>`, inline: true }
                );
                embed.setThumbnail(newMessage.author.displayAvatarURL());
            }

            // Add channel info
            embed.addFields(
                { name: 'Канал', value: `<#${newMessage.channelId}>`, inline: true }
            );

            // Add old content
            const oldContent = oldMessage.content 
                ? (oldMessage.content.length > 1024 ? oldMessage.content.substring(0, 1021) + '...' : oldMessage.content)
                : '*Нет текста или сообщение не в кеше*';
            embed.addFields({ name: 'До', value: oldContent });

            // Add new content
            const newContent = newMessage.content 
                ? (newMessage.content.length > 1024 ? newMessage.content.substring(0, 1021) + '...' : newMessage.content)
                : '*Нет текста*';
            embed.addFields({ name: 'После', value: newContent });

            // Add link to message
            embed.addFields({ name: 'Ссылка', value: `[Перейти к сообщению](${newMessage.url})` });

            await channel.send({ embeds: [embed] });
            console.log(`✅ Logged message edit in channel ${newMessage.channelId}`);
        } catch (error) {
            console.error('Error logging message update:', error);
        }
    }
};
