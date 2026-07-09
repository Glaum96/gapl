import { getProposalsCollection, getVotesCollection, getCommentsCollection } from './db.js';
import type { ObjectId } from 'mongodb';

export interface Proposal {
	_id?: ObjectId;
	caseId: string;
	userId: string;
	userName: string;
	text: string;
	createdAt: number;
}

export interface Vote {
	_id?: ObjectId;
	proposalId: string;
	userId: string;
	vote: 1 | -1;
}

export interface Comment {
	_id?: ObjectId;
	proposalId: string;
	caseId: string;
	userId: string;
	userName: string;
	text: string;
	createdAt: number;
}

export interface ProposalWithStats {
	id: string;
	caseId: string;
	userId: string;
	userName: string;
	text: string;
	createdAt: number;
	upvotes: number;
	downvotes: number;
	userVote: 1 | -1 | null;
	comments: Array<Omit<Comment, '_id'> & { id: string }>;
}

export async function getProposalsForCase(
	caseId: string,
	userId: string | null
): Promise<ProposalWithStats[]> {
	const [proposals, votes, comments] = await Promise.all([
		getProposalsCollection().then((c) =>
			c.find<Proposal>({ caseId }).sort({ createdAt: 1 }).toArray()
		),
		getVotesCollection().then((c) => c.find<Vote>({ caseId }).toArray()),
		getCommentsCollection().then((c) =>
			c.find<Comment>({ caseId }).sort({ createdAt: 1 }).toArray()
		)
	]);

	return proposals.map((p) => {
		const id = String(p._id);
		const pvotes = votes.filter((v) => v.proposalId === id);
		return {
			id,
			caseId: p.caseId,
			userId: p.userId,
			userName: p.userName,
			text: p.text,
			createdAt: p.createdAt,
			upvotes: pvotes.filter((v) => v.vote === 1).length,
			downvotes: pvotes.filter((v) => v.vote === -1).length,
			userVote: userId ? (pvotes.find((v) => v.userId === userId)?.vote ?? null) : null,
			comments: comments
				.filter((c) => c.proposalId === id)
				.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }))
		};
	});
}

export async function addProposal(
	caseId: string,
	userId: string,
	userName: string,
	text: string
): Promise<Proposal> {
	const col = await getProposalsCollection();
	const proposal: Omit<Proposal, '_id'> = {
		caseId,
		userId,
		userName,
		text: text.trim(),
		createdAt: Date.now()
	};
	const result = await col.insertOne(proposal as Proposal);
	return { ...proposal, _id: result.insertedId };
}

export async function castVote(
	proposalId: string,
	caseId: string,
	userId: string,
	vote: 1 | -1
): Promise<void> {
	const col = await getVotesCollection();
	const existing = await col.findOne<Vote>({ proposalId, userId });

	if (existing && existing.vote === vote) {
		// Same vote again → retract
		await col.deleteOne({ proposalId, userId });
	} else {
		await col.updateOne(
			{ proposalId, userId },
			{ $set: { vote, caseId } },
			{ upsert: true }
		);
	}
}

export async function addComment(
	proposalId: string,
	caseId: string,
	userId: string,
	userName: string,
	text: string
): Promise<Comment> {
	const col = await getCommentsCollection();
	const comment: Omit<Comment, '_id'> = {
		proposalId,
		caseId,
		userId,
		userName,
		text: text.trim(),
		createdAt: Date.now()
	};
	const result = await col.insertOne(comment as Comment);
	return { ...comment, _id: result.insertedId };
}
