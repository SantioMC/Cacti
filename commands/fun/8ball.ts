import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

class eightball extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: '8ball',
      description: 'Let the bot decide the answer for you in a yes/no manner',
      category: 'Fun',
      aliases: [],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'query',
          type: 'string',
          description: 'The question you want to ask',
          required: true
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var responses: string[] = [
      'Yes.',
      'No.',
      'Certainly.',
      'Never.',
      'Of course!',
      'Not in a million years!',
      'Without a doubt.',
      'My sources say no.',
      'Can you repeat the question?',
      'How would I know?',
      'Try again tomorrow.'
    ];

    var embed: MessageEmbed = new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription(':8ball: *Thinking...*');
    // @ts-ignore
    var message: Message = await event.message.lineReplyNoMention(embed);

    embed.setDescription(':8ball: ' + responses[Math.floor(Math.random() * responses.length)]);
    setTimeout(() => message.edit(' ', embed), 1500);
  };
}

module.exports = (client: BotClient) => {
  return new eightball(client);
};
