import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import GuildQueue from '../../utils/GuildQueue';

class volume extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'volume',
      description: 'Sets the volume for the current track',
      category: 'Music',
      permissionLevel: PermissionLevel.Developer,
      aliases: ['v', 'setvolume', 'sv', 'vol'],
      supportsDJ: true,
      arguments: [
        {
          name: 'volume',
          type: 'integer',
          description: "The logarithmic value for the track's volume",
          required: true
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var queue: GuildQueue | undefined = event.musicQueue;
    if (queue == undefined) return;
    if (!queue.isPlaying) {
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('There is nothing playing!'));
    }

    if (!queue.isDJ(event.message.member)) {
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('You need to be a DJ to do this!'));
    }

    var volume: number | undefined = event.arguments.shift() as number;
    if (volume == undefined) return;

    if (volume < 1 || volume > 200) {
      return event.message.channel.send(
        new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('The volume you supplied has to be between 1% and 200%')
      );
    }

    queue.setVolume(volume);

    let embed = new MessageEmbed()
      .setColor(event.embedColor)
      .setTitle(' ')
      .setDescription('Volume set to ' + volume + '%');

    event.message.channel.send('', embed);
  };
}

module.exports = (client: BotClient) => {
  return new volume(client);
};
