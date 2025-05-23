import { readAnnouncementAction } from "@/actions";
import { notFound } from "next/navigation";
import React from "react";
import Announcement from "../__components/announcement";

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const announcement = await readAnnouncementAction(slug);

	if (!announcement) return notFound();

	return (
		<Announcement
			announcement={announcement}
			comments={announcement._count.comments}
			likedByIds={announcement.likedBy.map((like) => like.id)}
			likes={announcement._count.likedBy}
		/>
	);
}
