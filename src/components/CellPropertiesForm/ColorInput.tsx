import { ChangeEvent } from "react";

export function ColorInput({
    label,
    id,
    value,
    disabled,
    handleChange,
    handleBlur,
}: {
    label: string;
    id: string;
    value: string;
    disabled: boolean;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="input-group">
            <label htmlFor={id}>{label}: &nbsp;</label>
            <input
                id={id}
                type="color"
                value={value}
                disabled={disabled}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        </div>
    );
}
