"use client";

import * as React from "react";
import {
	add,
	addDays,
	eachDayOfInterval,
	format,
	isSameDay,
	isWithinInterval,
} from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { EventFormProps } from "@/types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

export function DateTimePicker() {
	const [date, setDate] = React.useState<Date>();

	/**
	 * carry over the current time when a user clicks a new day
	 * instead of resetting to 00:00
	 */
	const handleSelect = (newDay: Date | undefined) => {
		if (!newDay) return;
		if (!date) {
			setDate(newDay);
			return;
		}
		const diff = newDay.getTime() - date.getTime();
		const diffInDays = diff / (1000 * 60 * 60 * 24);
		const newDateFull = add(date, { days: Math.ceil(diffInDays) });
		setDate(newDateFull);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-[280px] justify-start text-left font-normal",
						!date && "text-muted-foreground"
					)}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP HH:mm:ss") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(d) => handleSelect(d)}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}

export function DatePickerWithRange({
	className,
	handleValue,
	fromDefault,
	toDefault,
	events,
}: React.HTMLAttributes<HTMLDivElement> & {
	handleValue: (date: DateRange) => void;
	fromDefault?: Date;
	toDefault?: Date;
	events?: EventFormProps["events"];
}) {
	const [error, setError] = React.useState<string | null>(null);
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: fromDefault,
		to: toDefault,
	});

	const getEventForDate = (date: Date) => {
		return (events ?? []).find((event) =>
			isWithinInterval(date, {
				start: event.start,
				end: event.end,
			})
		);
	};

	const isDateDisabled = (date: Date) => {
		return (events || []).some((event) =>
			isWithinInterval(date, {
				start: event.start,
				end: event.end,
			})
		);
	};

	const hasDisabledDatesInRange = (range: DateRange) => {
		if (!range.from || !range.to) return false;

		const datesInRange = eachDayOfInterval({
			start: range.from,
			end: range.to,
		});

		return datesInRange.some((date) => isDateDisabled(date));
	};

	const DayContent = ({ date }: { date: Date }) => {
		const event = getEventForDate(date);

		if (!event) {
			return <span className=" ">{format(date, "d")}</span>;
		}

		return (
			<TooltipProvider delayDuration={100}>
				<Tooltip>
					<TooltipTrigger asChild className="   text-red-600">
						<span className="relative opacity-50  flex h-8 w-8 items-center justify-center rounded  ">
							<X className="absolute h-20 w-20" />
							{format(date, "d")}
						</span>
					</TooltipTrigger>
					<TooltipContent>
						<p className="font-semibold">Event: {event.title}</p>
						<p className="text-xs text-muted-foreground">
							{format(event.start, "PPP")}
							{!isSameDay(event.start, event.end) &&
								` - ${format(event.end, "PPP")}`}
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	};

	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground"
						)}>
						<CalendarIcon />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "LLL dd, y")} -{" "}
									{format(date.to, "LLL dd, y")}
								</>
							) : (
								format(date.from, "LLL dd, y")
							)
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="center">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						fromDate={addDays(new Date(), 7)}
						selected={date}
						onSelect={(value) => {
							if (value) {
								setError(null);
								// Check if the range contains any disabled dates
								if (hasDisabledDatesInRange(value)) {
									setDate(undefined);
									setError("Cannot select a range that includes booked dates");
									return;
								}

								setDate(value);
								handleValue(value);
							}
						}}
						numberOfMonths={2}
						components={{
							DayContent,
						}}
					/>
					{error && (
						<p className="mt-2 px-4 pb-4 text-sm text-destructive">{error}</p>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
