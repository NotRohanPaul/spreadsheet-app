import { ChangeEvent, useEffect, useState } from "react";
import { CellProps } from "@/Excel";
import {
    ColorInput,
    FontSelect,
    ToggleButton,
    CustomButton,
    FileSelect
} from "@components/CellPropertiesForm";

export default function CellPropertiesForm({
    editableCellProps,
    handleCellPropChange,
    handleCellMerge,
    focusedCell,
    handleDownload,
    handleImportCsv,
    handleClear,
    handleClearAll,
}: {
    editableCellProps?: Record<string, string | boolean>,
    handleCellPropChange: (e: React.SyntheticEvent<Element>, cellProp: keyof CellProps) => void,
    handleCellMerge: () => void,
    focusedCell: HTMLElement | null,
    handleDownload: () => void,
    handleImportCsv: (event: ChangeEvent<HTMLInputElement>) => void,
    handleClear: () => void;
    handleClearAll: () => void;
}) {
    const [localProps, setLocalProps] = useState<Record<string, string | boolean> | undefined>(editableCellProps);

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
            <ColorInput
                label="BG-Color"
                id="cell-bg-color"
                value={(localProps?.bgColor || '#ffffff') as string}
                disabled={focusedCell === null}
                handleChange={(e) => handleLocalChange(e, "bgColor")}
                handleBlur={(e) => handleCellPropChange(e, "bgColor")}
            />

            <ColorInput
                label="Text-Color"
                id="cell-text-color"
                value={(localProps?.textColor || '#000000') as string}
                disabled={focusedCell === null}
                handleChange={(e) => handleLocalChange(e, "textColor")}
                handleBlur={(e) => handleCellPropChange(e, "textColor")}
            />

            <FontSelect
                value={(localProps?.fontFamily || 'sans-serif') as string}
                disabled={focusedCell === null}
                handleChange={(e) => handleCellPropChange(e, "fontFamily")}
            />

            <ToggleButton
                id="cell-bold"
                label="B"
                checked={!!editableCellProps?.isBold}
                disabled={focusedCell === null}
                handleClick={(e) => handleCellPropChange(e, "isBold")}
                style={{ fontWeight: "bold" }}
            />

            <ToggleButton
                id="cell-italic"
                label="I"
                checked={!!editableCellProps?.isItalic}
                disabled={focusedCell === null}
                handleClick={(e) => handleCellPropChange(e, "isItalic")}
                style={{ fontStyle: "italic" }}
            />
            <ToggleButton
                id="cell-strikethrough"
                label="S"
                checked={!!editableCellProps?.isStrikethrough}
                disabled={focusedCell === null}
                handleClick={(e) => handleCellPropChange(e, "isStrikethrough")}
                style={{ textDecoration: "line-through" }}
            />

            <CustomButton
                id="merge-cell"
                label="Merge"
                onClick={handleCellMerge}
                disabled={focusedCell === null}
            />
            <CustomButton
                id="clear-cell"
                label="Clear"
                onClick={handleClear}
                disabled={focusedCell === null}
            />
            <CustomButton
                id="clear-all-cells"
                label="Clear All"
                onClick={handleClearAll}
            />
            <CustomButton
                id="excel-download"
                label="Download CSV"
                onClick={handleDownload}
            />

            <FileSelect
                id="excel-import"
                label="Import"
                onChange={handleImportCsv}
                className="import-btn"
            />
        </form>
    );
}
