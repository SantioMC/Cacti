import { Message, MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';

class poll extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'poll',
      description: 'Create a poll for others to vote on',
      category: 'Utility',
      permissions: ['MANAGE_MESSAGES'],
      permissionLevel: PermissionLevel.Default,
      arguments: []
    });
  }

  execute = async (event: ExecuteEvent) => {
    if (event.unparsedArguments.length == 1) event.unparsedArguments.push('Yes', 'No');
    if (event.unparsedArguments.length < 3)
      return event.message.channel.send(
        new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('You need to supply a question and at least 2 answers!')
      );

    if (event.unparsedArguments.length > 5)
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('This command has a limit of 4 answers!'));

    var message: Message = await event.message?.channel?.send(event.loadingEmote + ' Creating poll...');
    var title: string | undefined = event.unparsedArguments.shift();

    if (title == null) return;
    var useNumbers: boolean = false;
    var used: Array<string> = [];
    var questions: string = '';

    event.unparsedArguments.forEach((answer: string) => {
      var letter: string = answer.trim().charAt(0);
      if (used.includes(letter)) useNumbers = true;
      used.push(letter);
    });

    var index: number = 0;
    event.unparsedArguments.forEach((answer: string) => {
      var letter: string = answer.trim().charAt(0);
      if (useNumbers) questions += `${event.client.reactions.get('' + (index + 1))} **${answer}**: 0\n`;
      else questions += `${event.client.reactions.get(letter)} **${answer}**: 0\n`;
      index++;
    });

    var embed: MessageEmbed = new MessageEmbed()
      .setTitle(' ')
      .setColor(event.embedColor)
      .setDescription(`**POLL**\n\n${title}\n\n${questions}\nPoll by <@${event.message.author.id}>`);

    await message.edit(' ', embed);
    if (useNumbers) {
      for (index = 0; index < event.unparsedArguments.length; index++) {
        var reaction: string | undefined = event.client.reactions.get('' + (index + 1));
        if (reaction != null) await message.react(reaction);
      }
    } else {
      for (var letter in used) {
        var reaction: string | undefined = event.client.reactions.get(used[letter]);
        if (reaction != null) await message.react(reaction);
      }
    }
    message.react('<:delete:861289897841917982>');
  };
}

module.exports = (client: BotClient) => {
  return new poll(client);
};
