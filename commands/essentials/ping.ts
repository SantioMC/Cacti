import { Message, MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';

class ping extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'ping',
      description: 'Check the bots latency',
      category: 'Essential',
      permissionLevel: PermissionLevel.Default,
      arguments: []
    });
  }

  execute = async (event: ExecuteEvent) => {
    var message: Message = await event.message?.channel?.send(event.loadingEmote + ' Checking latency...');
    message.edit(
      ``,
      new MessageEmbed()
        .setTitle('Application Latency')
        .setDescription(
          `:spider_web: Websocket Latency: ${event.client.ws.ping}ms\n:ping_pong: Bot Latency: ${new Date().getTime() - message.createdTimestamp}ms`
        )
        .setColor(event.embedColor)
        .setFooter('Requested by ' + event.message.author.tag)
        .setTimestamp()
    );
  };
}

module.exports = (client: BotClient) => {
  return new ping(client);
};
