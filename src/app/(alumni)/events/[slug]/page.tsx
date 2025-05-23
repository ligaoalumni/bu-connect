import { EventInfo } from "@/components/custom/event-info";
import { getEventStatus } from "@/lib/event";
import { readEvent } from "@/repositories";
import { formatDate, isSameDay } from "date-fns";
import { notFound } from "next/navigation";
import React from "react";

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const event = await readEvent(slug);

	if (!event) return notFound();

	const isOneDay = isSameDay(
		event.startDate,
		event?.endDate || event.startDate
	);
	const startDate = formatDate(
		event.startDate,
		isOneDay ? "MMMM d, yyyy" : "MMMM d,"
	);
	const endDate = formatDate(event!.endDate!, "- MMMM dd, yyyy");
	const date = `${startDate}${isOneDay ? "" : endDate}`;

	const status = getEventStatus({
		endDate: event.endDate || event.startDate,
		startDate: event.startDate,
		endTime: event.endTime,
		startTime: event.startTime,
	});

	return <EventInfo date={date} status={status} event={event} />;
}
