"use client";

import {
	readAnnouncementCommentsAction,
	writeAnnouncementCommentAction,
} from "@/actions";
import type { AnnouncementCommentWithUser, PaginationResult } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { AlertCircle, MessageSquare, RefreshCw } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import CommentBox from "./comment-box-input";
import { formatDistanceToNow } from "date-fns";
import { createBrowserClient } from "@/lib/supabase-client";
import { useContentData } from "@/contexts/content-context";

interface AnnouncementCommentsSectionProps {
	announcementId: number;
}

export function AnnouncementCommentsSection({
	announcementId,
}: AnnouncementCommentsSectionProps) {
	const { setData: setContentData } = useContentData();
	const [data, setData] = useState<
		PaginationResult<AnnouncementCommentWithUser>
	>({
		count: 0,
		data: [],
		hasMore: false,
	});
	const [loading, setLoading] = useState({
		initialFetch: true,
		fetchingMore: false,
	});
	const [pagination, setPagination] = useState({
		limit: 10,
		page: 0,
	});
	const [hasError, setHasError] = useState(false);

	const handleFetchMore = async (fetchMore?: boolean) => {
		try {
			setLoading({
				initialFetch: !fetchMore && data.data.length === 0,
				fetchingMore: fetchMore || false,
			});
			setHasError(false);

			const response = await readAnnouncementCommentsAction({
				announcementId,
				pagination: fetchMore
					? { ...pagination, page: pagination.page + 1 }
					: pagination,
			});

			if (fetchMore) {
				setData((prev) => ({
					count: response.count,
					hasMore: response.hasMore,
					data: [...prev.data, ...response.data],
				}));
				setPagination((prev) => ({
					...prev,
					page: prev.page + 1,
				}));
			} else {
				setData(response);
			}
		} catch {
			setHasError(true);
			toast.error("Error fetching attendants", {
				description: "Please try again later.",
				richColors: true,
				duration: 5000,
			});
		} finally {
			setLoading({
				initialFetch: false,
				fetchingMore: false,
			});
		}
	};

	const handleRefresh = () => {
		setPagination({
			limit: 10,
			page: 0,
		});
		handleFetchMore();
	};

	useEffect(() => {
		handleFetchMore();
	}, [announcementId]);

	useEffect(() => {
		const db = createBrowserClient();
		const subscription = db
			.channel("announcement_comments_channel")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "announcement_comments",
					filter: `announcementId=eq.${announcementId}`,
				},
				async (payload) => {
					console.log("Change received in announcement_comments:", payload);
					if (payload.new) {
						const { data } = await db
							.from("users")
							.select("*")
							.eq("id", payload.new.commentById)
							.single();

						if (data) {
							setData((prev) => ({
								...prev,
								data: [
									{
										commentBy: {
											avatar: data.avatar,
											batch: data.batch,
											firstName: data.firstName,
											id: data.id,
											lastName: data.lastName,
										},
										announcementId: payload.new.announcementId,
										comment: payload.new.comment,
										commentById: payload.new.commentById,
										createdAt: new Date(),
										id: payload.new.id,
									},
									...prev.data,
								],
							}));
							setContentData((prev) => ({
								id: prev?.id || 0,
								likes: prev?.likes || 0,
								isLiked: prev?.isLiked || false,
								comments: Number(prev?.comments || 0) + 1,
							}));
						}
					}
				}
			)
			.subscribe();

		// Cleanup subscription on unmount
		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const handleComment = async (comment: string) => {
		try {
			await writeAnnouncementCommentAction({ announcementId, comment });
		} catch (err) {
			toast.error("Error on posting comment", {
				description:
					err instanceof Error
						? err.message
						: "Something went wrong, please try again later.",
				position: "top-center",
				richColors: true,
			});
		}
	};

	return (
		<div className="space-y-4 overflow-hidden break-words">
			<div className="flex items-center justify-between">
				{/* <h1 className="font-medium text-lg flex items-center gap-2">
					<MessageCircle className="h-5 w-5" />
					Comments
					{!loading.initialFetch && !hasError && (
						<span className="text-sm text-muted-foreground">
							({data.count})
						</span>
					)}
				</h1> */}
				{/* {!loading.initialFetch && (
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={loading.fetchingMore || loading.initialFetch}>
                          <RefreshCw
                              className={`h-4 w-4 mr-2 ${
                                  loading.initialFetch || loading.fetchingMore
                                      ? "animate-spin"
                                      : ""
                              }`}
                          />
                          Refresh
                      </Button>
                  )} */}
			</div>

			{/* Error State */}
			{hasError && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-6 flex flex-col items-center justify-center space-y-4 text-center">
					<AlertCircle className="h-12 w-12 text-red-500" />
					<div>
						<h3 className="font-semibold text-red-700">
							Error fetching comments
						</h3>
						<p className="text-red-600 mt-1">
							We couldn&apos;t load the comments. Please try again.
						</p>
					</div>
					<Button
						onClick={handleRefresh}
						variant="destructive"
						className="mt-2">
						<RefreshCw className="h-4 w-4 mr-2" />
						Try Again
					</Button>
				</div>
			)}

			{/* Initial Loading State */}
			{loading.initialFetch && !hasError && (
				<div className="space-y-4">
					{Array.from({ length: 5 }).map((_, index) => (
						<CommentSkeleton key={index} />
					))}
				</div>
			)}

			<div>
				<CommentBox onSubmit={handleComment} />
			</div>

			{/* Content State */}
			{!loading.initialFetch && !hasError && (
				<>
					{data.data.length > 0 ? (
						<div className="space-y-3">
							<div className="space-y-3 divide-y divide-gray-100">
								{data.data.map((comment) => (
									<div className="pt-3 first:pt-0" key={comment.id}>
										<CommentCard {...comment} />
									</div>
								))}
							</div>

							{/* Load More Section */}
							{loading.fetchingMore && (
								<div className="pt-2 space-y-4">
									{Array.from({ length: 3 }).map((_, index) => (
										<CommentSkeleton key={`more-${index}`} />
									))}
								</div>
							)}

							{data.hasMore && !loading.fetchingMore && (
								<div className="pt-4 flex justify-center">
									<Button
										variant="outline"
										className={`w-full max-w-xs `}
										disabled={loading.fetchingMore}
										onClick={() => handleFetchMore(true)}>
										{loading.fetchingMore ? (
											<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
										) : (
											"Load More Comments"
										)}
									</Button>
								</div>
							)}

							{!data.hasMore && data.data.length > 5 && (
								<p className="text-center text-sm text-muted-foreground pt-2">
									You&apos;ve reached the end of the list
								</p>
							)}
						</div>
					) : (
						<div className="rounded-lg border border-dashed p-8 flex flex-col items-center justify-center text-center">
							<MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
							<h3 className="font-medium">No comments yet</h3>
							<p className="text-sm text-muted-foreground mt-1">
								Be the first to leave a comment on this event.
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}

const CommentCard = (comment: AnnouncementCommentWithUser) => {
	const name = `${comment.commentBy.firstName} ${comment.commentBy.lastName}`;

	return (
		<div className="group hover:bg-gray-50 p-3 rounded-md transition-colors">
			<div className="flex items-center gap-3 mb-2">
				<Avatar className="border">
					{comment.commentBy.avatar ? (
						<AvatarImage
							src={comment.commentBy.avatar || ""}
							alt={comment.commentBy.avatar}
						/>
					) : (
						<AvatarFallback className="bg-primary/10 text-primary">
							{comment.commentBy.firstName.charAt(0)}
							{comment.commentBy.lastName.charAt(0)}
						</AvatarFallback>
					)}
				</Avatar>
				<div>
					<h3 className="font-medium group-hover:text-primary transition-colors">
						{name}
					</h3>
					<p className="text-xs text-muted-foreground flex items-center gap-2">
						{comment.commentBy.batch && (
							<>
								<span>{comment.commentBy.batch}</span>
								<span className="inline-block h-1 w-1 rounded-full bg-gray-300"></span>
							</>
						)}
						<span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
					</p>
				</div>
			</div>
			<p className="text-sm pl-12">{comment.comment}</p>
		</div>
	);
};

const CommentSkeleton = () => {
	return (
		<div className="p-3">
			<div className="flex items-center gap-3 mb-2">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-24" />
				</div>
			</div>
			<Skeleton className="h-4 w-full max-w-md ml-12" />
			<Skeleton className="h-4 w-full max-w-sm ml-12 mt-1" />
		</div>
	);
};
