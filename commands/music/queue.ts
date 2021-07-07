import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import GuildQueue from '../../utils/GuildQueue';
import { Track } from '../../utils/SongManager';

class queue extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'queue',
      description: 'Shows the track queue for the guild',
      category: 'Music',
      permissionLevel: PermissionLevel.Default,
      aliases: ['q', 'tracks', 'songs']
    });
  }

  execute = async (event: ExecuteEvent) => {
    var queue: GuildQueue | undefined = event.musicQueue;
    if (queue == undefined) return;
    if (!queue.isPlaying) {
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('There is nothing playing!'));
    }

    var songs: Track[] = queue.inQueue;
    var current: Track | undefined = queue.getCurrent();
    if (current == undefined) {
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('There is nothing playing!'));
    }

    let desc = `**Current song:** ${current.video.title}\n\n`;
    for (let i = 0; i < songs.length; i++) {
      desc += `#${i + 1} \`${songs[i].video.title}\`\n*Requested by ${songs[i].requestedBy?.user.tag}*\n`;
    }

    let embed = new MessageEmbed()
      .setColor(event.embedColor)
      .setTitle('Track Queue')
      .setDescription(desc)
      .setFooter('Requested by ' + event.message.author.tag + '!')
      .setTimestamp();

    event.message.channel.send('', embed);
  };
}

module.exports = (client: BotClient) => {
  return new queue(client);
};
