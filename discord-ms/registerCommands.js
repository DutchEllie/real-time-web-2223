import { REST, Routes } from "discord.js";
import * as fs from "fs";
import path from "path";
import {readFile} from "fs/promises";

const json = await readFile("config.json", "utf-8");
const config = JSON.parse(json);
const { clientId, token } = config;

const commands = [];
// Grab all the command files from the commands directory you created earlier

const commandFiles = [
	"src/commands/poll.js",
]

for (const file of commandFiles) {
	const filePath = path.join("src/commands", file);
	const command = await import(filePath);
	if ("data" in command && "execute" in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
		);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // // The put method is used to fully refresh all commands in the guild with the current set
    // const data = await rest.put(
    // 	Routes.applicationGuildCommands(clientId, guildId),
    // 	{ body: commands },
    // );
    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
