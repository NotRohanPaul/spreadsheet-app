import { MouseEvent } from "react";

export function ToggleButton({
    id,
    label,
    checked,
    disabled,
    handleClick,
    style,
}: {
    id: string;
    label: string;
    checked: boolean;
    disabled: boolean;
    handleClick: (e: MouseEvent<HTMLInputElement>) => void;
    style: React.CSSProperties;
}) {
    return (
        <div className="toggle-cell-props">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onClick={handleClick}
                hidden
            />
            <label htmlFor={id} style={style}>{label}</label>
        </div>
    );
}
