import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
	if (params.pollid != null) {
		return {
			id: params.pollid,
		};
	}

	throw error(404, 'Not found');
}) satisfies PageLoad;

export const ssr = false;