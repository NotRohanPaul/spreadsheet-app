import { ChangeEvent, useEffect, useState } from "react";
import { CellProps } from "./Excel";

export default function CellPropertiesForm({
    editableCellProps,
    handleCellPropChange,
    handleCellMerge,
    focusedCell,
    handleDownload,
}: {
    editableCellProps?: Record<string, string | boolean>,
    handleCellPropChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, cellProp: keyof CellProps) => void,
    handleCellMerge: () => void,
    focusedCell: HTMLElement | null,
    handleDownload: () => void,


}) {
    const [localProps, setLocalProps] = useState<Record<string, string | boolean> | undefined>(editableCellProps);

    // Update local state whenever focusedCell changes (to reflect the new focused cell's properties)
    useEffect(() => {
        setLocalProps(editableCellProps);
    }, [editableCellProps]);

    const handleLocalChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, prop: string) => {
        setLocalProps((prevProps) => ({
            ...prevProps,
            [prop]: e.target.value
        }));
    };




    return (
        <form id="cell-properties" onSubmit={e => e.preventDefault()}>
            <div>
                <label htmlFor="cell-bg-color">BG-Color: &nbsp;</label>
                <input
                    id="cell-bg-color"
                    type="color"
                    value={(localProps?.bgColor || '#ffffff') as string}
                    disabled={focusedCell === null}
                    onChange={(e) => handleLocalChange(e, "bgColor")}
                    onBlur={(e) => handleCellPropChange(e, "bgColor")}
                />
            </div>
            <div>
                <label htmlFor="cell-text-color">Text-Color: &nbsp;</label>
                <input
                    id="cell-text-color"
                    type="color"
                    value={(localProps?.textColor || '#000000') as string}
                    disabled={focusedCell === null}
                    onChange={(e) => handleLocalChange(e, "textColor")}
                    onBlur={(e) => handleCellPropChange(e, "textColor")}
                />
            </div>
            <div >
                <label htmlFor="cell-font-family">Font-Family: &nbsp;</label>
                <select
                    name="cell-font-family"
                    id="cell-font-family"
                    value={(localProps?.fontFamily || 'sans-serif') as string}
                    disabled={focusedCell === null}
                    onChange={(e) => handleCellPropChange(e, "fontFamily")}
                >
                    <option value="sans">sans</option>
                    <option value="sans-serif">sans-serif</option>
                    <option value="cursive">cursive</option>
                    <option value="monospace">monospace</option>
                    <option value="fantasy">fantasy</option>
                </select>
            </div>

            <div className="toogle-cell-props">
                <input
                    id="cell-bold"
                    type="checkbox"
                    checked={!!editableCellProps?.isBold}
                    disabled={focusedCell === null}
                    // @ts-expect-error types are correct but showing error
                    onClick={(e) => handleCellPropChange(e, "isBold")}
                    hidden
                />
                <label htmlFor="cell-bold" style={{ fontWeight: "bold" }}>B</label>
            </div>
            <div className="toogle-cell-props">
                <input
                    id="cell-italic"
                    type="checkbox"
                    checked={!!editableCellProps?.isItalic}
                    disabled={focusedCell === null}
                    // @ts-expect-error types are correct but showing error
                    onClick={(e) => handleCellPropChange(e, "isItalic")}
                    hidden
                />
                <label htmlFor="cell-italic" style={{ fontStyle: "italic" }}>I</label>
            </div>
            <div className="toogle-cell-props">
                <input
                    id="cell-strikethrough"
                    type="checkbox"
                    checked={!!editableCellProps?.isStrikethrough}
                    disabled={focusedCell === null}
                    // @ts-expect-error types are correct but showing error
                    onClick={(e) => handleCellPropChange(e, "isStrikethrough")}
                    hidden
                />
                <label htmlFor="cell-strikethrough" style={{ textDecoration: "line-through" }}>S</label>
            </div>

            <div className="merge-button">
                <input
                    id="cell-strikethrough"
                    type="button"
                    value="Merge"
                    disabled={focusedCell === null}
                    onClick={handleCellMerge}
                />
            </div>

            <div className="download-button">
                <input
                    id="excel-download"
                    type="button"
                    value="Download CSV"
                    onClick={handleDownload}
                />
            </div>
        </form>
    );
}