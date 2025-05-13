import { ChangeEvent, HTMLProps, KeyboardEvent } from "react";

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
    const handleKeyDown = (e: KeyboardEvent<HTMLLabelElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            document.getElementById(id)?.click()
        };
    }
    return (
        <div {...props} className={className + " custom-button"} >
            <label
                htmlFor={id}
                tabIndex={0}
                onKeyDown={handleKeyDown}

            >{label}</label>
            <input
                id={id}
                type="file"
                onChange={onChange}
                hidden
            />
        </div>
    );
}
