const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
var fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Replies with a nice Menu!'),

	async execute(interaction, client) {
		let i = 0;
		const commands = [];

		const categories = fs.readdirSync('./src/commands/');
		categories.forEach((dir) => {
			const commandFiles = fs
				.readdirSync(`./src/commands/${dir}/`)
				.filter((file) => file.endsWith('.js'));

			for (const file of commandFiles) {
				const command = require(`../${dir}/${file}`);
				const commandData = {
					name: command.data.name,
					description: command.data.description,
					category: dir,
				};
				commands.push(commandData);
			}
		});

		const embed = this.HelpSetEmbed(commands, categories[i]);
		const buttons = this.HelpSetButton(categories, i);

		await interaction.reply({
			embeds: [embed],
			components: [buttons],
			ephemeral: true,
		});

		/** ++ Button Collector ++ */
		const filter = (button) =>
			(button.customId === 'helpPrevious' || button.customId === 'helpNext') &&
			button.user.id === interaction.user.id &&
			interaction.id === button.message.interaction.id;

		const collector = interaction.channel.createMessageComponentCollector({
			filter,
		});
		collector.on('collect', async (button) => {
			switch (button.customId) {
				case 'helpPrevious':
					await (i -= 1);
					try {
						await button.update({
							embeds: [this.HelpSetEmbed(commands, categories[i])],
							components: [this.HelpSetButton(categories, i)],
						});
					} catch (e) {
						console.error(e);
					}
					break;

				case 'helpNext':
					await (i += 1);
					try {
						await button.update({
							embeds: [this.HelpSetEmbed(commands, categories[i])],
							components: [this.HelpSetButton(categories, i)],
						});
					} catch (e) {
						console.error(e);
					}
					break;
			}
		});
		/** -- Button Collector */
	},

	HelpSetEmbed: function (commands, category) {
		const embed = new MessageEmbed()
			.setTimestamp()
			.setTitle('**Help Menu**')
			.setColor('DARK_GREEN');

		const commandsNames = commands.map((description) => {
			let temp = {
				Name: description.name,
				Description: description.description,
				Category: description.category,
			};
			return temp;
		});

		for (var i = 0; i < commandsNames.length; i++) {
			const name = commandsNames[i].Name;
			const description = commandsNames[i].Description;
			if (category == commandsNames[i].Category) {
				embed.addField(`${name}`, `Description: ${description}`, false);
			}
		}

		return embed;
	},

	HelpSetButton: function (categories, i) {
		let previous = false;
		if (i == 0) previous = true;
		else previous = false;

		let next = true;
		if (i == categories.length - 1) next = true;
		else next = false;

		const buttons = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('helpPrevious')
				.setLabel('Previous')
				.setStyle('PRIMARY')
				.setDisabled(previous),
			new MessageButton()
				.setCustomId('category')
				.setLabel(`Category: ${categories[i]}`)
				.setStyle('SECONDARY')
				.setDisabled(true),
			new MessageButton()
				.setCustomId('helpNext')
				.setLabel('Next')
				.setStyle('PRIMARY')
				.setDisabled(next)
		);

		return buttons;
	},
};
