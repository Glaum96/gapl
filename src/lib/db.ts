import { MongoClient, type Collection } from 'mongodb';
import { env } from '$env/dynamic/private';

let client: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
	if (!client) {
		client = new MongoClient(env.MONGODB_URI);
		await client.connect();
	}
	return client;
}

export async function getCasesCollection(): Promise<Collection> {
	const c = await getClient();
	return c.db('gapl').collection('cases');
}
