import * as mongoose from 'mongoose';
import { MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { ITag } from '../../models/tag';

class tag extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'tag',
      description: 'Modify and manage bot tags',
      category: 'Utility',
      aliases: ['tags'],
      permissionLevel: PermissionLevel.Developer,
      arguments: []
    });
  }

  execute = async (event: ExecuteEvent) => {
    const Tag: mongoose.Model<ITag> = mongoose.model('Tag');
    var operator: String | undefined = event.unparsedArguments.shift();

    if (operator == null) {
      event.message.channel.send(`Valid arguments are \`list\`, \`create\`, \`source\`, and \`delete\`!`);
    } else if (operator == 'list') {
      var tags: ITag[] = await Tag.find({});
      var tagNames: string[] = tags.map((x) => x.name);
      event.message.channel.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor(event.embedColor)
          .setDescription('**Available Tags: **' + tagNames.join(', '))
      );
    } else if (operator == 'create') {
      var name: string | undefined = event.unparsedArguments.shift();
      var content: string | undefined = event.message.content.substring(13 + `${name}`.length);
      if (name == null || content == null) {
        return event.message.channel.send(
          new MessageEmbed()
            .setTitle('Tags')
            .setColor('#ff0000')
            .setFooter('Requested by ' + event.message.author.tag)
            .setDescription('Invalid arguments, use the following:```diff\n- ' + event.client.data.prefix + 'tags create <name> <content>```')
        );
      }

      var existingTag: ITag | null = await Tag.findOne({ name: name.toLowerCase() });
      if (existingTag != null) existingTag.delete();

      await Tag.create({
        name: name.toLowerCase(),
        content: content,
        owner: event.message.author.id,
        timeCreated: new Date().getTime()
      });

      event.message.channel.send(
        new MessageEmbed()
          .setTitle('Tags')
          .setColor(event.embedColor)
          .setFooter('Created by ' + event.message.author.tag)
          .setDescription(`Created a new tag named \`${name}\`!`)
      );
    } else if (operator == 'delete' || operator == 'remove') {
      var name: string | undefined = event.unparsedArguments.shift();

      if (name == null) {
        return event.message.channel.send(
          new MessageEmbed()
            .setTitle('Tags')
            .setColor('#ff0000')
            .setFooter('Requested by ' + event.message.author.tag)
            .setDescription('Invalid arguments, use the following:```diff\n- ' + event.client.data.prefix + 'tags create <name> <content>```')
        );
      }

      var existingTag: ITag | null = await Tag.findOne({ name: name.toLowerCase() });
      if (existingTag == null) {
        return event.message.channel.send(
          new MessageEmbed()
            .setTitle('Tags')
            .setColor('#ff0000')
            .setFooter('Requested by ' + event.message.author.tag)
            .setDescription('Unknown tag! Are you sure you spelt the tag name correctly?')
        );
      }

      await existingTag.delete();

      event.message.channel.send(
        new MessageEmbed()
          .setTitle('Tags')
          .setColor(event.embedColor)
          .setFooter('Deleted by ' + event.message.author.tag)
          .setDescription(`Deleted the tag named \`${name}\`!`)
      );
    } else if (operator == 'source') {
      var name: string | undefined = event.unparsedArguments.shift();

      if (name == null) {
        return event.message.channel.send(
          new MessageEmbed()
            .setTitle('Tags')
            .setColor('#ff0000')
            .setFooter('Requested by ' + event.message.author.tag)
            .setDescription('Invalid arguments, use the following:```diff\n- ' + event.client.data.prefix + 'tags create <name> <content>```')
        );
      }

      var existingTag: ITag | null = await Tag.findOne({ name: name.toLowerCase() });
      if (existingTag == null) {
        return event.message.channel.send(
          new MessageEmbed()
            .setTitle('Tags')
            .setColor('#ff0000')
            .setFooter('Requested by ' + event.message.author.tag)
            .setDescription('Unknown tag! Are you sure you spelt the tag name correctly?')
        );
      }

      event.message.channel.send(
        new MessageEmbed()
          .setTitle('Source Code for ' + existingTag.name)
          .setColor(event.embedColor)
          .setFooter('Requested by ' + event.message.author.tag)
          .setDescription(`\`\`\`\n${existingTag.content}\`\`\``)
      );
    }
  };
}
1;
module.exports = (client: BotClient) => {
  return new tag(client);
};
