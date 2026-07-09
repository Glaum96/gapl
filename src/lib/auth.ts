import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { getUsersCollection, getSessionsCollection } from './db.js';
import type { ObjectId } from 'mongodb';

export interface User {
	_id?: ObjectId;
	email: string;
	passwordHash: string;
	name: string;
	interests: string[];
	createdAt: number;
}

export interface Session {
	token: string;
	userId: string;
	expiresAt: number;
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function createUser(email: string, password: string, name: string): Promise<User> {
	const col = await getUsersCollection();
	const existing = await col.findOne({ email: email.toLowerCase() });
	if (existing) throw new Error('E-postadressen er allerede registrert');

	const passwordHash = await bcrypt.hash(password, 12);
	const user: Omit<User, '_id'> = {
		email: email.toLowerCase(),
		passwordHash,
		name,
		interests: [],
		createdAt: Date.now()
	};
	const result = await col.insertOne(user as User);
	return { ...user, _id: result.insertedId };
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
	const col = await getUsersCollection();
	const user = await col.findOne<User>({ email: email.toLowerCase() });
	if (!user) return null;
	const ok = await bcrypt.compare(password, user.passwordHash);
	return ok ? user : null;
}

export async function createSession(userId: string): Promise<string> {
	const col = await getSessionsCollection();
	const token = randomBytes(32).toString('hex');
	const session: Session = {
		token,
		userId,
		expiresAt: Date.now() + SESSION_TTL_MS
	};
	await col.insertOne(session);
	return token;
}

export async function getSessionUser(token: string): Promise<User | null> {
	const sessions = await getSessionsCollection();
	const session = await sessions.findOne<Session>({ token, expiresAt: { $gt: Date.now() } });
	if (!session) return null;

	const users = await getUsersCollection();
	return users.findOne<User>({ email: session.userId });
}

export async function deleteSession(token: string): Promise<void> {
	const col = await getSessionsCollection();
	await col.deleteOne({ token });
}

export async function updateInterests(email: string, interests: string[]): Promise<void> {
	const col = await getUsersCollection();
	await col.updateOne({ email }, { $set: { interests } });
}
