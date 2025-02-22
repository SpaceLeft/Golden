const { SlashCommandBuilder } = require("@discordjs/builders");
const { replyInteractionEmbed } = require("../../modules/channelModule/channelModule");
const { createEmbed } = require("../../modules/embedModule/embedModule");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Jump to a specific duration")
    .addStringOption((option) =>
            option
                .setName('duration')
                .setDescription('Addd')
                .setRequired(true)
        ),

  async execute(interaction, client) {
    const player = interaction.client.manager.get(interaction.guild.id);
    if (!player) return replyInteractionEmbed(interaction, '', 'Play a track before using this command.', 'RED');

    const { channel } = interaction.member.voice;
    
    if (!channel) return replyInteractionEmbed(interaction, '', 'Join a voice channel first.', 'RED');
    if (channel.id !== player.voiceChannel) return replyInteractionEmbed(interaction, '', 'I\'ve to be in the same voice channel with you for requesting tracks.', 'RED');

    const position = player.position;
    const duration = player.queue.current.duration;
    const t = interaction.options.getString('duration'); // mm:ss
    const ms = Number(t.split(':')[0]) * 60 * 1000 + Number(t.split(':')[1]) * 1000;

    if(!ms)
      return replyInteractionEmbed(interaction, '', 'Please give me a timestamp with the following format: 4:20', 'RED');

    if (ms >= duration) 
      return replyInteractionEmbed(interaction, '', 'Can\'t skip so far', 'RED');

    player.seek(ms);

    if (ms > position) {
      return replyInteractionEmbed(interaction, '', `Skipped to ${t}`, 'RED');
    } else {
      return replyInteractionEmbed(interaction, '', `Rewind to ${t}`, 'RED');
    }
    
  },
};
