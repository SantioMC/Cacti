import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

class pet extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'pet',
      description: 'Sends an image of a pet!',
      category: 'Fun',
      aliases: [],
      permissionLevel: PermissionLevel.Default,
      arguments: []
    });
  }

  execute = async (event: ExecuteEvent) => {
    var messages = [
      "Here's a cute animal!",
      'A wholesome creature!',
      'Look at this dumb animal!',
      'Animal!',
      'Animal!',
      'Look at how cute this animal is!',
      'What a cutie!',
      "Aren't they cute?",
      "Who's awesome?"
    ];
    var message = messages[Math.floor(Math.random() * messages.length)];

    var animals = ['fox', 'dog', 'cat', 'panda', 'red_panda', 'koala', 'bird', 'raccoon', 'kangaroo'];
    var animal = animals[Math.floor(Math.random() * animals.length)];
    var request = await fetch('https://some-random-api.ml/animal/' + animal);
    var data = await request.json();

    var embed: MessageEmbed = new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription(message).setImage(data.image).setFooter(data.fact);

    await event.message.channel.send(embed);
  };
}

module.exports = (client: BotClient) => {
  return new pet(client);
};
