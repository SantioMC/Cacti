import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { Collection, GuildMember, Message, MessageEmbed, Snowflake, TextChannel } from 'discord.js';

class clean extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'clean',
      description: 'Manage messages in bulk',
      category: 'Moderation',
      aliases: ['purge'],
      permissions: ['MANAGE_MESSAGES'],
      botPermissions: ['MANAGE_MESSAGES'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'amount',
          description: 'The amount of messages to delete',
          required: true,
          type: 'integer'
        },
        {
          name: 'user',
          description: 'The user to affect',
          required: false,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    await event.message.delete();

    var amount: number = <number>event.arguments[0];
    if (amount < 2 || amount > 100)
      return event.message.channel.send(
        new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription('You can only delete up to 100 messages! (min of 2)')
      );

    var messages: Collection<Snowflake, Message>;
    if (event.arguments.length < 2) {
      messages = await event.message.channel.messages.fetch().then((m) => (messages = m));
    } else {
      var user: GuildMember = <GuildMember>event.arguments[1];

      messages = await event.message.channel.messages.fetch().then((m) => (messages = m));
      messages = messages.filter((m) => m.author.id == user.id);
    }

    (<TextChannel>event.message.channel)
      .bulkDelete(messages.first(amount))
      .then((deleted) => {
        event.message.channel
          .send(
            new MessageEmbed()
              .setTitle(' ')
              .setColor(event.embedColor)
              .setDescription('Successfully deleted **' + deleted.size + '** message' + (deleted.size > 1 ? 's' : '') + '!')
          )
          .then((m: Message) => m.delete({ timeout: 3000 }));
      })
      .catch((e) => {
        event.message.channel.send(
          new MessageEmbed()
            .setTitle(' ')
            .setColor('#ff0000')
            .setDescription('Failed to purge ' + amount + ' messages!')
        );
      });
  };
}

module.exports = (client: BotClient) => {
  return new clean(client);
};
