import { ChangeEvent } from "react";

export function FontSelect({
    value,
    disabled,
    handleChange,
}: {
    value: string;
    disabled: boolean;
    handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}) {
    return (
        <div className="input-group">
            <label htmlFor="cell-font-family">Font-Family: &nbsp;</label>
            <select
                id="cell-font-family"
                value={value}
                disabled={disabled}
                onChange={handleChange}
            >
                <option
                    value="sans">sans</option>
                <option value="sans-serif">sans-serif</option>
                <option value="cursive">cursive</option>
                <option value="monospace">monospace</option>
                <option value="fantasy">fantasy</option>
            </select>
        </div>
    );
}
