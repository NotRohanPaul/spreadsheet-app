export function CustomButton({
    id,
    label,
    onClick,
    disabled,
}: {
    id: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <div className="custom-button">
            <input
                id={id}
                type="button"
                value={label}
                onClick={onClick}
                disabled={disabled}
            />
        </div>
    );
}
