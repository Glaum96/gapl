// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				email: string;
				name: string;
				interests: string[];
				role?: 'admin' | 'user';
			};
		}
		interface PageData {
			user?: {
				email: string;
				name: string;
				interests: string[];
				role?: 'admin' | 'user';
			} | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
