import {MessageEmbed} from 'discord.js';
import {BotClient} from '../../utils/BotClient';
import {Command, ExecuteEvent, ICommandData, PermissionLevel} from '../../utils/Command';

class help extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'help',
      description: 'View all commands on the bot',
      category: 'Essential',
      permissionLevel: PermissionLevel.Default,
      arguments: []
    });
  }

  execute = async (event: ExecuteEvent) => {
    var commands: ICommandData[] = event.client.commands;
    var guildSpecificCommands: ICommandData[] = commands.filter((command: ICommandData) => command.guild == event.message.guild?.id);
    commands = commands.filter((command: ICommandData) => command.guild == null);

    var embed: MessageEmbed = new MessageEmbed()
      .setTitle('Help Menu')
      .setColor(event.embedColor)
      .setTimestamp()
      .setFooter('Requested by ' + event.message.author.tag);

    var categories: string[] = [];
    commands.forEach((command: ICommandData) => {
      if (!categories.includes(command.category)) categories.push(command.category);
    });
    categories.sort();

    categories.forEach((category) => {
      let commandData = event.client.commands.filter((command: ICommandData) => command.category.toLowerCase() == category.toLowerCase());
      let commands = Array.from(commandData.values());
      let text = '```\n';
      for (let i = 0; i < commands.length && i < 5; i++) text += commands[i].name + '\n';
      if (commands.length > 5) text += '...and ' + (commands.length - 5) + ' more..';
      text += '```';
      embed.addField(category, text, true);
    });

    if (guildSpecificCommands.length > 0) {
      var category: string | undefined = event.message.guild?.name;
      if (category == undefined) category = 'Guild Specific';
      let text = '```\n';
      for (let i = 0; i < guildSpecificCommands.length && i < 5; i++) text += guildSpecificCommands[i].name + '\n';
      if (guildSpecificCommands.length > 5) text += '...and ' + (guildSpecificCommands.length - 5) + ' more..';
      text += '```';
      embed.addField(category, text, true);
    }

    event.message.channel.send(embed);
  };
}

module.exports = (client: BotClient) => {
  return new help(client);
};
