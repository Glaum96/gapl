import { MongoClient, type Collection } from 'mongodb';
import { env } from '$env/dynamic/private';

let client: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
	if (!client) {
		const uri = env.MONGODB_URI;
		if (!uri) throw new Error('MONGODB_URI is not set');
		const c = new MongoClient(uri);
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

function db() {
	return getClient().then((c) => c.db('gapl'));
}

export async function getCasesCollection(): Promise<Collection> {
	return (await db()).collection('cases');
}

export async function getUsersCollection(): Promise<Collection> {
	return (await db()).collection('users');
}

export async function getSessionsCollection(): Promise<Collection> {
	return (await db()).collection('sessions');
}

export async function getProposalsCollection(): Promise<Collection> {
	return (await db()).collection('proposals');
}

export async function getVotesCollection(): Promise<Collection> {
	return (await db()).collection('votes');
}

export async function getCommentsCollection(): Promise<Collection> {
	return (await db()).collection('comments');
}
