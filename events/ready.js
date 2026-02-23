const { ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

async function sendTicketMessage(client) {
    const ticketChannelId = process.env.TICKET_CHANNEL_ID;
    if (!ticketChannelId) {
        console.log(' TICKET_CHANNEL_ID not set, skipping ticket message');
        return;
    }
    for (const [, guild] of client.guilds.cache) {
        try {
            const ticketChannel = guild.channels.cache.get(ticketChannelId);
            if (!ticketChannel) {
                console.log(` Ticket channel not found in guild ${guild.name}`);
                continue;
            }
            const messages = await ticketChannel.messages.fetch({ limit: 10 });
            const existingMessage = messages.find(msg => msg.author.id === client.user.id && msg.embeds.length > 0 && msg.embeds[0].title === ' Система тикетов');
            if (existingMessage) {
                console.log(` Ticket message already exists in ${guild.name}`);
                continue;
            }
            const embed = new EmbedBuilder().setColor('#0099ff').setTitle(' Система тикетов').setDescription('**Добро пожаловать в систему тикетов!**\n\nНажмите на кнопку ниже, чтобы создать тикет.').setFooter({ text: 'DeadMine YT Support System' }).setTimestamp();
            const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_ticket').setLabel(' Создать тикет').setStyle(ButtonStyle.Primary));
            await ticketChannel.send({ embeds: [embed], components: [button] });
            console.log(` Ticket message sent to ${guild.name}`);
        } catch (error) {
            console.error('Error sending ticket message:', error);
        }
    }
}

async function sendPaymentTicketMessage(client) {
    console.log(' Checking payment ticket configuration...');
    const paymentTicketChannelId = process.env.PAYMENT_TICKET_CHANNEL_ID;
    const paymentTicketCategoryId = process.env.PAYMENT_TICKET_CATEGORY_ID;
    console.log(`PAYMENT_TICKET_CHANNEL_ID: ${paymentTicketChannelId || 'NOT SET'}`);
    console.log(`PAYMENT_TICKET_CATEGORY_ID: ${paymentTicketCategoryId || 'NOT SET'}`);
    if (!paymentTicketChannelId) {
        console.log(' PAYMENT_TICKET_CHANNEL_ID not set, skipping payment ticket message');
        return;
    }
    if (!paymentTicketCategoryId) {
        console.log(' PAYMENT_TICKET_CATEGORY_ID not set, skipping payment ticket message');
        return;
    }
    for (const [, guild] of client.guilds.cache) {
        try {
            const paymentTicketChannel = guild.channels.cache.get(paymentTicketChannelId);
            if (!paymentTicketChannel) {
                console.log(` Payment ticket channel not found in guild ${guild.name}`);
                continue;
            }
            const messages = await paymentTicketChannel.messages.fetch({ limit: 10 });
            const existingMessage = messages.find(msg => msg.author.id === client.user.id && msg.embeds.length > 0 && msg.embeds[0].title === ' Тикет на выплаты');
            if (existingMessage) {
                console.log(` Payment ticket message already exists in ${guild.name}`);
                continue;
            }
            const embed = new EmbedBuilder().setColor('#FFD700').setTitle(' Тикет на выплаты').setDescription('**Система получения выплат**\n\nНажмите на кнопку ниже, чтобы создать тикет для получения выплаты.\n\n**Требования:**\n Укажите ваш никнейм\n Укажите сумму выплаты\n Приложите подтверждение (скриншоты/ссылки)').setFooter({ text: 'DeadMine YT Payment System' }).setTimestamp();
            const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_payment_ticket').setLabel(' Запросить выплату').setStyle(ButtonStyle.Success));
            await paymentTicketChannel.send({ embeds: [embed], components: [button] });
            console.log(` Payment ticket message sent to ${guild.name}`);
        } catch (error) {
            console.error('Error sending payment ticket message:', error);
        }
    }
}

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('');
        console.log(` Bot logged in as ${client.user.tag}`);
        console.log(` Servers: ${client.guilds.cache.size}`);
        console.log(` Users: ${client.users.cache.size}`);
        console.log('');
        console.log(' Channel Configuration:');
        console.log(`Voice Log: ${config.voiceLogChannel}`);
        console.log(`Chat Log: ${config.chatLogChannel}`);
        console.log(`Moderation Log: ${config.moderationLogChannel}`);
        console.log(`Role Log: ${config.roleLogChannel}`);
        const voiceChannel = client.channels.cache.get(config.voiceLogChannel);
        const chatChannel = client.channels.cache.get(config.chatLogChannel);
        const modChannel = client.channels.cache.get(config.moderationLogChannel);
        const roleChannel = client.channels.cache.get(config.roleLogChannel);
        console.log('');
        console.log(' Channel Status:');
        console.log(`Voice Log: ${voiceChannel ? ' Found' : ' Not Found'}`);
        console.log(`Chat Log: ${chatChannel ? ' Found' : ' Not Found'}`);
        console.log(`Moderation Log: ${modChannel ? ' Found' : ' Not Found'}`);
        console.log(`Role Log: ${roleChannel ? ' Found' : ' Not Found'}`);
        console.log('');
        client.user.setPresence({ activities: [{ name: 'DeadMine YT', type: ActivityType.Watching }], status: 'online' });
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const invites = await guild.invites.fetch();
                client.invites.set(guildId, new Map(invites.map(inv => [inv.code, inv])));
                console.log(` Cached ${invites.size} invites for ${guild.name}`);
            } catch (error) {
                console.error(`Error caching invites for ${guild.name}:`, error);
            }
        }
        await sendTicketMessage(client);
        await sendPaymentTicketMessage(client);
        console.log(' Bot is ready!');
        const autoRoleId = process.env.AUTO_ROLE_ID;
        if (autoRoleId) {
            console.log('');
            console.log(' Starting auto-role assignment...');
            for (const [, guild] of client.guilds.cache) {
                try {
                    const role = guild.roles.cache.get(autoRoleId);
                    if (!role) {
                        console.log(` Role ${autoRoleId} not found in guild ${guild.name}`);
                        continue;
                    }
                    const members = await guild.members.fetch();
                    let assigned = 0;
                    let skipped = 0;
                    for (const [, member] of members) {
                        if (member.user.bot) { skipped++; continue; }
                        if (member.roles.cache.has(autoRoleId)) { skipped++; continue; }
                        try {
                            await member.roles.add(role);
                            assigned++;
                            console.log(` Assigned role to ${member.user.tag}`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } catch (error) {
                            console.error(` Error assigning role to ${member.user.tag}:`, error.message);
                        }
                    }
                    console.log(` Auto-role complete: ${assigned} assigned, ${skipped} skipped`);
                } catch (error) {
                    console.error(' Error in auto-role assignment:', error);
                }
            }
            console.log('');
        }
    }
};
