const { SlashCommandBuilder } = require("@discordjs/builders");
const { setEmbed } = require("../../modules/channelModule/channelModule");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume paused music"),

  async execute(interaction, client) {
    const player = interaction.client.manager.get(interaction.guild.id);
    if (!player) return replyInteractionEmbed(interaction, '', 'Play a track before using this command.', 'RED');

    const { channel } = interaction.member.voice;
    
    if (!channel) return replyInteractionEmbed(interaction, '', 'Join a voice channel first.', 'RED');
    if (channel.id !== player.voiceChannel) return replyInteractionEmbed(interaction, '', 'I\'ve to be in the same voice channel with you for requesting tracks.', 'RED');
    if (!player.paused) return replyInteractionEmbed(interaction, '', 'The player is already resumed.', 'RED');

    await player.pause(false);
    setEmbed(interaction.guild, player);
    return replyInteractionEmbed(interaction, '', 'Resumed the player.', 'GREEN');
  },
};
