import { INDUSTRIES } from "@/constant";
import { NotificationType } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Helper functions for image grid layout
export function getImageGridClass(count: number): string {
	switch (count) {
		case 1:
			return "grid-cols-1";
		case 2:
			return "grid-cols-2";
		case 3:
			return "grid-cols-2";
		case 4:
			return "grid-cols-2";
		case 5:
			return "grid-cols-3";
		default:
			return "grid-cols-1";
	}
}

export function getImageHeightClass(count: number, index: number): string {
	// Special case for 3 images (2x2 grid with first image taking full width)
	if (count === 3 && index === 0) {
		return "col-span-2 aspect-[2/1]";
	}

	// For 5 images, we're only showing 3, with a different layout
	if (count === 5) {
		if (index === 0) {
			return "aspect-square";
		} else {
			return "aspect-square";
		}
	}

	// Default heights
	switch (count) {
		case 1:
			return "aspect-[16/9]";
		case 2:
			return "aspect-square";
		case 3:
		case 4:
			return "aspect-square";
		default:
			return "aspect-square";
	}
}

// Helper function to get industry name by id
export const getIndustryName = (industryId: string) => {
	const industry = INDUSTRIES.find((i) => i.id === industryId);
	return industry ? industry.name : industryId;
};

export function getNotificationMessage(type: NotificationType): string {
	switch (type) {
		case "EVENT":
			return "You have a new event invitation!";
		case "EVENT_COMMENT":
			return "Someone commented on an event.";
		case "ANNOUNCEMENT":
			return "A new announcement is available. Check it out!";
		case "LIKE_ANNOUNCEMENT":
			return "Your comment received a new like!";
		case "POST":
			return "A new post has been shared.";
		case "POST_COMMENT":
			return "Someone commented on your post.";
		case "LIKE_POST":
			return "Your post received a new like!";
		case "NEW_JOB":
			return "A new job opportunity has been posted.";
		case "JOB":
			return "Check out the latest job postings.";
		case "NEW_RECRUITMENT":
			return "A new recruitment opportunity is available.";
		case "RECRUITMENT":
			return "Explore the latest recruitment notices.";
		case "NEW_POLL":
			return "A new poll has been created. Cast your vote!";
		case "POLL":
			return "Don't forget to participate in ongoing polls.";
		case "RECRUITMENT_APPLICATION":
			return "A new recruitment application has been submitted.";
		default:
			return "You have a new notification.";
	}
}

export function getNotificationTitle(type: NotificationType): string {
	switch (type) {
		case "EVENT":
			return "New Event";
		case "EVENT_COMMENT":
			return "New Comment on an Event You Engaged With";
		case "ANNOUNCEMENT":
			return "New Announcement";
		case "LIKE_ANNOUNCEMENT":
			return "Someone Liked Your Announcement";
		case "ANNOUNCEMENT_COMMENT":
			return "New Comment on an Announcement You Engaged With";
		case "POST":
			return "New Post";
		case "LIKE_POST":
			return "Someone Liked Your Post";
		case "POST_COMMENT":
			return "New Comment on a Post You Engaged With";
		case "NEW_JOB":
			return "New Job Opportunity";
		case "JOB":
			return "Job Notification";
		case "NEW_RECRUITMENT":
			return "New Recruitment Posted";
		case "RECRUITMENT":
			return "Recruitment Notification";
		case "NEW_POLL":
			return "New Poll Created";
		case "POLL":
			return "Poll Notification";
		case "RECRUITMENT_APPLICATION":
			return "New Recruitment Application";
		default:
			return "Notification";
	}
}
