import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

class hug extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'hug',
      description: 'Give someone a hug to show your affection!',
      category: 'Fun',
      aliases: [],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user you want to hug',
          required: true,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var user: GuildMember = <GuildMember>event.arguments.shift();

    var request = await fetch('https://some-random-api.ml/animu/hug');
    var data = await request.json();

    var embed: MessageEmbed = new MessageEmbed()
      .setTitle(' ')
      .setColor(event.embedColor)
      .setDescription('You hugged <@' + user.id + '>!')
      .setImage(data.link);

    var message: Message = await event.message.channel.send(embed);
  };
}

module.exports = (client: BotClient) => {
  return new hug(client);
};
