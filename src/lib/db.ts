import { MongoClient, type Collection } from 'mongodb';
import { env } from '$env/dynamic/private';

let client: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
	if (!client) {
		const c = new MongoClient(env.MONGODB_URI);
		try {
			await c.connect();
		} catch (err) {
			await c.close().catch(() => {});
			throw err;
		}
		client = c;
	}
	return client;
}

export async function getCasesCollection(): Promise<Collection> {
	const c = await getClient();
	return c.db('gapl').collection('cases');
}
