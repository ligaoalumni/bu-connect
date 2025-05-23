import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		}
	);
}

export default function supabaseLoader({
	src,
	width,
	quality,
}: {
	src: string;
	width: number;
	quality?: number;
}) {
	const url = new URL(`https://example.com${src}`);
	url.searchParams.set("width", width.toString());
	url.searchParams.set("quality", (quality || 75).toString());
	return url.href;
}
