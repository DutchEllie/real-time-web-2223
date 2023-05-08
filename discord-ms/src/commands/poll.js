import { PollService } from "../pollService";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Create a poll')
		.addStringOption(option =>
			option.setName('title')
		)
		.addStringOption(option =>
			option.setName('options')
		),
	async execute(interaction) {
		const title = interaction.options.getString('title');
		const optionsString = interaction.options.getString('options');
		const options = optionsString.split(",").map((option) => ({
			title: option,
		}));

		const pollService = new PollService();
		pollService.createPoll(title, options);

		const buttons = options.map((option) => {
			return new ButtonBuilder()
				.setCustomId(`poll:${pollService.polls.length - 1}:${option.title}`)
				.setLabel(option.title)
				.setStyle(ButtonStyle.Primary);
		});

		const actionRow = new ActionRowBuilder().addComponents(buttons);


		await interaction.reply({
			content: title,
			components: [actionRow],
		});
	}

}