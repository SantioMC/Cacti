import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { MessageEmbed } from 'discord.js';

class rps extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'rps',
      description: 'Play rock paper scissors with the bot!',
      category: 'Fun',
      aliases: [],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'rock|paper|scissors',
          description: 'What option you want to use',
          required: true,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var play: string = <string>event.arguments.shift();
    if (!['rock', 'paper', 'scissors'].includes(play))
      event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription("That isn't `rock`, `paper`, or `scissors`!"));

    var embed: MessageEmbed = new MessageEmbed().setTitle(' ').setColor(event.embedColor);

    var num: number = 0;
    if (play == 'rock') num = 1;
    else if (play == 'paper') num = 2;
    else if (play == 'scissors') num = 3;

    var botPlay: number = Math.ceil(Math.random() * 3);

    if (num == botPlay) embed.setDescription('Both you and Cacti choose ' + play + "! It's a draw");
    if (num == 1 && botPlay == 2) embed.setDescription('Cacti choose **paper**! You lose!');
    if (num == 1 && botPlay == 3) embed.setDescription('Cacti choose **scissors**! You win!');
    if (num == 2 && botPlay == 1) embed.setDescription('Cacti choose **rock**! You win!');
    if (num == 2 && botPlay == 3) embed.setDescription('Cacti choose **scissors**! You lose!');
    if (num == 3 && botPlay == 1) embed.setDescription('Cacti choose **rock**! You lose!');
    if (num == 3 && botPlay == 2) embed.setDescription('Cacti choose **paper**! You win!');

    event.message.channel.send(embed);
  };
}

module.exports = (client: BotClient) => {
  return new rps(client);
};
