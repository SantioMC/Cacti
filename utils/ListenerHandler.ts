import * as path from 'path';
import { BotClient } from "./BotClient";
import * as fs from 'fs';
import { Listener } from './Listener';

export class ListenerHandler {
	listeners: Map<String, Listener> = new Map();
	client: BotClient;
	constructor(client: BotClient) {
		this.client = client;
		readDir(__dirname + path.sep + '..' + path.sep + 'listeners');

		function readDir(directory: string) {
			fs.readdir(path.resolve(directory), (err, files) => {
				if (err) return console.error(err);
				var index: string;
				for (index in files) {
					var file: string = files[index];
					if (file.match('.(js|ts)$')) {
						createListener(client, file.substring(0, file.length - 3), directory);
					} else if (fs.lstatSync(path.resolve(directory + path.sep + file)).isDirectory()) {
						readDir(directory + path.sep + file);
					}
				}
			});
		}

		const createListener = (client: BotClient, name: string, dir: string) => {
			var listener: Listener = require(dir + path.sep + name)(client) as Listener;
			this.listeners.set(name.toLowerCase(), listener);
		};
	}
}