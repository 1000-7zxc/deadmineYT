const { ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

// Send ticket message
async function sendTicketMessage(client) {
    const ticketChannelId = process.env.TICKET_CHANNEL_ID;
    
    if (!ticketChannelId) {
        console.log('⚠️ TICKET_CHANNEL_ID not set, skipping ticket message');
        return;
    }
    
    for (const [, guild] of client.guilds.cache) {
        try {
            const ticketChannel = guild.channels.cache.get(ticketChannelId);
            
            if (!ticketChannel) {
                console.log(`⚠️ Ticket channel not found in guild ${guild.name}`);
                continue;
            }
            
            // Check if ticket message already exists
            const messages = await ticketChannel.messages.fetch({ limit: 10 });
            const existingMessage = messages.find(msg => 
                msg.author.id === client.user.id && 
                msg.embeds.length > 0 && 
                msg.embeds[0].title === '🎫 Система тикетов'
            );
            
            if (existingMessage) {
                console.log(`✅ Ticket message already exists in ${guild.name}`);
                continue;
            }
            
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎫 Система тикетов')
                .setDescription(
                    '**Добро пожаловать в систему тикетов!**\n\n' +
                    'Нажмите на кнопку ниже, чтобы создать тикет.'
                )
                .setFooter({ text: 'DeadMine YT Support System' })
                .setTimestamp();
            
            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket')
                        .setLabel('📩 Создать тикет')
                        .setStyle(ButtonStyle.Primary)
                );
            
            await ticketChannel.send({
                embeds: [embed],
                components: [button]
            });
            
            console.log(`✅ Ticket message sent to ${guild.name}`);
            
        } catch (error) {
            console.error('Error sending ticket message:', error);
        }
    }
}

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`✅ Bot logged in as ${client.user.tag}`);
        console.log(`📊 Servers: ${client.guilds.cache.size}`);
        console.log(`👥 Users: ${client.users.cache.size}`);
        console.log('═══════════════════════════════════════════════════════════════');
        
        // Log channel configuration
        console.log('📋 Channel Configuration:');
        console.log(`Voice Log: ${config.voiceLogChannel}`);
        console.log(`Chat Log: ${config.chatLogChannel}`);
        console.log(`Moderation Log: ${config.moderationLogChannel}`);
        console.log(`Role Log: ${config.roleLogChannel}`);
        
        // Verify channels exist
        const voiceChannel = client.channels.cache.get(config.voiceLogChannel);
        const chatChannel = client.channels.cache.get(config.chatLogChannel);
        const modChannel = client.channels.cache.get(config.moderationLogChannel);
        const roleChannel = client.channels.cache.get(config.roleLogChannel);
        
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📍 Channel Status:');
        console.log(`Voice Log: ${voiceChannel ? '✅ Found' : '❌ Not Found'}`);
        console.log(`Chat Log: ${chatChannel ? '✅ Found' : '❌ Not Found'}`);
        console.log(`Moderation Log: ${modChannel ? '✅ Found' : '❌ Not Found'}`);
        console.log(`Role Log: ${roleChannel ? '✅ Found' : '❌ Not Found'}`);
        console.log('═══════════════════════════════════════════════════════════════');
        
        client.user.setPresence({
            activities: [{ 
                name: 'DeadMine YT', 
                type: ActivityType.Watching 
            }],
            status: 'online'
        });
        
        // Cache invites for all guilds
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const invites = await guild.invites.fetch();
                client.invites.set(guildId, new Map(invites.map(inv => [inv.code, inv])));
                console.log(`✅ Cached ${invites.size} invites for ${guild.name}`);
            } catch (error) {
                console.error(`Error caching invites for ${guild.name}:`, error);
            }
        }
        
        // Send ticket message
        await sendTicketMessage(client);
        
        console.log('✅ Bot is ready!');
        
        // Auto-assign role to all members
        const autoRoleId = process.env.AUTO_ROLE_ID;
        if (autoRoleId) {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('🎭 Starting auto-role assignment...');
            
            for (const [, guild] of client.guilds.cache) {
                try {
                    const role = guild.roles.cache.get(autoRoleId);
                    if (!role) {
                        console.log(`❌ Role ${autoRoleId} not found in guild ${guild.name}`);
                        continue;
                    }
                    
                    const members = await guild.members.fetch();
                    let assigned = 0;
                    let skipped = 0;
                    
                    for (const [, member] of members) {
                        if (member.user.bot) {
                            skipped++;
                            continue;
                        }
                        
                        if (member.roles.cache.has(autoRoleId)) {
                            skipped++;
                            continue;
                        }
                        
                        try {
                            await member.roles.add(role);
                            assigned++;
                            console.log(`✅ Assigned role to ${member.user.tag}`);
                            
                            // Small delay to avoid rate limits
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } catch (error) {
                            console.error(`❌ Error assigning role to ${member.user.tag}:`, error.message);
                        }
                    }
                    
                    console.log(`✅ Auto-role complete: ${assigned} assigned, ${skipped} skipped`);
                } catch (error) {
                    console.error('❌ Error in auto-role assignment:', error);
                }
            }
            
            console.log('═══════════════════════════════════════════════════════════════');
        }
    }
};
