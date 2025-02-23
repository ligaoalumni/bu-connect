import { Input } from "../ui/input";
import { ComponentProps, ReactElement } from "react";

type Props = {
	className: string;
	containerProps?: ComponentProps<"div">;
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	startIcon?: ReactElement;
	endIcon?: ReactElement;
	hasPadding?: boolean;
};

export function InputWithIcon({
	className,
	startIcon,
	endIcon,
	inputProps,
	hasPadding = true,
}: Props) {
	return (
		<div className={`flex items-center  relative  w-full `}>
			{startIcon && (
				<div className="absolute left-2 top-[50%] cursor-pointer -translate-y-[50%]">
					{startIcon}
				</div>
			)}
			<Input
				{...inputProps}
				className={`${startIcon && "pl-10"} ${endIcon && "pr-10"} ${className}`}
			/>

			{endIcon && (
				<div
					className={`absolute ${
						hasPadding ? "right-2" : "right-0"
					} top-[50%] cursor-pointer -translate-y-[50%]`}>
					{endIcon}
				</div>
			)}
		</div>
	);
}
