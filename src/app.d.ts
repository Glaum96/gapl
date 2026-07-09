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
			};
		}
		interface PageData {
			user?: {
				email: string;
				name: string;
				interests: string[];
			} | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
