/** ++ Discord init ++ **/
const { Client, Collection, Intents, MessageEmbed } = require('discord.js')
const fs = require('fs')
var colors = require('colors/safe');

require('dotenv').config({ path: './config/.env' })

const client = new Client({
    fetchAllMembers: true,
    // restTimeOffset: 0,
    // restWsBridgetimeout: 100,
    shards: 'auto',
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        // Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        // Intents.FLAGS.GUILD_WEBHOOKS,
        // Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
    ],
})

/** ++ Music init ++ */
const { Player } = require('discord-player')

client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highest',
        filter: 'audioonly',
        highWaterMark: 1 << 25,
        dlChunkSize: 0,
    },
})
/** -- Music init -- */

/** ++ Command Handler ++ */

client.commands = new Collection()
client.categories = require('fs').readdirSync(`./commands`)
var commandFiles = ''

fs.readdirSync('./commands/').forEach((dir) => {
    commandFiles = fs
        .readdirSync(`./commands/${dir}/`)
        .filter((file) => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command = require(`./commands/${dir}/${file}`)

        if (!command.category) {
            console.log(colors.red.bold('❌ | No Category found in ' + command.data.name))
            process.exit()
        }

        client.commands.set(command.data.name, command)
    }
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return interaction.reply('please submit a Valid command!')

    try {
        await command.execute(interaction, client)
    } catch (error) {
        console.error(error)
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        })
    }
})

client.on('error', console.error)
client.on('warn', console.warn)

/** -- Command Handler -- */

/** ++ Event Handler ++ */

var eventFiles

eventFiles = fs.readdirSync(`./events/`).filter((file) => file.endsWith('.js'))
for (const file of eventFiles) {
    const event = require(`./events/${file}`)

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

/** -- Event Handler -- */
/** -- Discord init -- **/

/** ++ Start ++ **/

var colors = require('colors/safe')

const imgText = `
 ██████╗  ██████╗ ██╗     ██████╗ ███████╗███╗   ██╗ 
██╔════╝ ██╔═══██╗██║     ██╔══██╗██╔════╝████╗  ██║ 
██║  ███╗██║   ██║██║     ██║  ██║█████╗  ██╔██╗ ██║ 
██║   ██║██║   ██║██║     ██║  ██║██╔══╝  ██║╚██╗██║ 
╚██████╔╝╚██████╔╝███████╗██████╔╝███████╗██║ ╚████║ 
 ╚═════╝  ╚═════╝ ╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═══╝     v1.0
         ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗
         ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗
         ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝
         ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗
         ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║
         ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
         `

console.log(colors.red(imgText))

client.login(process.env.TOKEN)

/** -- Start -- **/

/** ++ Music events ++ */
const embed = new MessageEmbed().setTimestamp()

client.player.on('error', (queue, error) => {
    console.log(
        `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
    )
})
client.player.on('connectionError', (queue, error) => {
    console.log(
        `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
    )
})

client.player.on('trackStart', (queue, track) => {
    try {
        queue.metadata.send({
            embeds: [
                embed
                    .setAuthor(
                        `Now Playing: ${track.title} by ${track.author}`,
                        '',
                        track.url
                    )
                    .setDescription('')
                    .setImage(track.thumbnail)
                    .setThumbnail('')
                    .setFooter(
                        client.user.username,
                        client.user.displayAvatarURL()
                    )
                    .setColor('DARK_GREEN'),
            ],
        })
    } catch (e) {
        console.log(e)
    }
})

client.player.on('trackAdd', (queue, track) => {
    queue.metadata.send({
        embeds: [
            embed
                .setAuthor('')
                .setDescription(
                    `🎶 | Track **${track.title} by ${track.author}** queued!`
                )
                .setURL(track.url)
                .setImage('')
                .setThumbnail(track.thumbnail)
                .setFooter(client.user.username, client.user.displayAvatarURL())
                .setColor('DARK_ORANGE'),
        ],
    })
})

client.player.on('botDisconnect', (queue) => {
    queue.metadata.send({
        embeds: [
            embed
                .setAuthor('')
                .setDescription(
                    '❌ | I was manually disconnected from the voice channel, clearing queue!'
                )
                .setImage('')
                .setThumbnail('')
                .setFooter(client.user.username, client.user.displayAvatarURL())
                .setColor('DARK_RED'),
        ],
    })
})

client.player.on('channelEmpty', (queue) => {
    queue.metadata.send({
        embeds: [
            embed
                .setAuthor('')
                .setDescription(
                    '❌ | Nobody is in the voice channel, leaving...'
                )
                .setImage('')
                .setThumbnail('')
                .setFooter(client.user.username, client.user.displayAvatarURL())
                .setColor('DARK_RED'),
        ],
    })
})

client.player.on('queueEnd', (queue) => {
    queue.metadata.send({
        embeds: [
            embed
                .setAuthor('')
                .setDescription(`✅ | Queue finished!`)
                .setImage('')
                .setThumbnail('')
                .setFooter(client.user.username, client.user.displayAvatarURL())
                .setColor('DARK_GREEN'),
        ],
    })
})

/** -- Music events */
