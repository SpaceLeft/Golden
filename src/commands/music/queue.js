const { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  replyInteractionEmbed,
} = require('../../modules/channelModule/channelModule');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('View queue'),

  async execute(interaction, client)
  {
    let page = 0;

    const player = interaction.client.manager.get(interaction.guild.id);
    if (!player)
      return replyInteractionEmbed(
        interaction,
        'ERROR',
        'Please request a Song before using this Command.',
        'RED'
      );

    const queue = player.queue;

    await interaction.reply({
      embeds: [this.QueSetEmbed(queue, interaction.guild.id, page)],
      components: [this.QueSetButtons(queue, interaction.guild.id, page)],
      ephemeral: true,
    });

    /** ++ Button Collector ++ */
    const filter = (button) =>
      (button.customId === 'quePrevious' || button.customId === 'queNext') &&
      button.user.id === interaction.user.id &&
      interaction.id === button.message.interaction.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
    });
    collector.on('collect', async (button) =>
    {
      switch (button.customId)
      {
        case 'quePrevious':
          await page--;
          await button.update({
            embeds: [this.QueSetEmbed(queue, interaction.guild.id, page)],
            components: [this.QueSetButtons(queue, interaction.guild.id, page)],
          });
          break;

        case 'queNext':
          await page++;
          await button.update({
            embeds: [this.QueSetEmbed(queue, interaction.guild.id, page)],
            components: [this.QueSetButtons(queue, interaction.guild.id, page)],
          });
          break;
      }
    });
    /** -- Button Collector -- */
  },

  QueSetEmbed: function (queue, guildId, page)
  {
    const embed = new MessageEmbed()
      .setTitle('**🎶 | Queue:**')
      .setTimestamp()
      .setColor('DARK_GREEN');

    if (page <= 0) page = 0;
    const pageStart = 10 * page;
    const pageEnd = pageStart + 10;

    let tracks = `\`Now Playing.\` ** | [${queue.current.title} by ${queue.current.author}](${queue.current.uri})**\n`;

    queue.slice(pageStart, pageEnd).map((track, i) =>
    {
      let pos = i + pageStart + 1;
      return (tracks += `\n\`${pos}.\` ** | [${track.title} by ${track.author}](${track.uri})**`);
    });

    embed
      .setDescription(
        `${tracks}${queue.size > pageEnd
          ? `\nand... \`${queue.totalSize - pageEnd}\` more track(s)`
          : ''
        }`
      )
      .setColor('DARK_GREEN');

    return embed;
  },

  QueSetButtons: function (queue, guildId, page)
  {
    let previous = false;
    if (page <= 0.1) previous = true;
    else previous = false;
    let next = true;

    // const currPage = (page/10)+1
    const currPage = page++;
    if (currPage >= Math.floor((queue.totalSize - 1) / 10)) next = true;
    else next = false;

    const pages = `Page: ${currPage + 1} / ${Math.floor((queue.totalSize - 1) / 10) + 1
      }`;

    const buttons = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('quePrevious')
        .setLabel('Previous')
        .setStyle('PRIMARY')
        .setDisabled(previous),
      new MessageButton()
        .setCustomId('quePages')
        .setLabel(pages)
        .setStyle('SUCCESS')
        .setDisabled(true),
      new MessageButton()
        .setCustomId('queNext')
        .setLabel('Next')
        .setStyle('PRIMARY')
        .setDisabled(next)
    );

    return buttons;
  },
};
