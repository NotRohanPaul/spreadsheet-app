import { ChangeEvent, HTMLProps } from "react";

export function FileSelect({
    id,
    label,
    onChange,
    className,
    ...props
}: {
    id: string;
    label: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
} & HTMLProps<HTMLDivElement>) {
    return (
        <div {...props} className={className + " custom-button"} >
            <label htmlFor={id} tabIndex={0}>{label}</label>
            <input
                id={id}
                type="file"
                onChange={onChange}
                hidden
            />
        </div>
    );
}
