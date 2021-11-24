const { MessageEmbed } = require('discord.js')
const {
    setGoldenChannelPlayerThumbnail,
    setGoldenChannerlPlayerTitle,
    setGoldenChannerlPlayerQueue,
    setGoldenChannelPlayerFooter,
    resetGoldenChannelPlayer,
} = require('../../functions/channel')

module.exports =
    ('playlistAdd',
    (client, queue, tracks) => {
        const Embed = new MessageEmbed()
            .setTitle('Music Player')
            .setDescription(
                `Bot has Added a Playlist with \`${tracks.length}\` Songs`
            )
            .setColor('DARK_GREEN')

        const guild = tracks[0].requestedBy.guild
        //const guild = client.guilds.get(queue.message.guildId)

        const queueLenght = queue.tracks.length

        setGoldenChannelPlayerFooter(guild, queueLenght, queue.volume)

        let tracksMap = ''
        let i = 0

        queue.tracks.forEach((track) => {
            if (track.Id != 1) {
                tracksMap =
                    `\`${i + 1}.\` ${track.title} by ${track.channelId}\n` +
                    tracksMap
                i++
            }
        })

        tracks.forEach((track) => {
            if (queue.tracks != '') {
                tracksMap =
                    `\`${i + 1}.\` ${track.title} by ${track.channelId}\n` +
                    tracksMap
                i++
            }
        })

        if (tracksMap == '') {
            setGoldenChannerlPlayerQueue(guild, '')
        } else {
            setGoldenChannerlPlayerQueue(guild, tracksMap)
        }

        return queue.message.channel.send({ embeds: [Embed] })
    })