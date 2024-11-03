import { useCallback, useEffect, useRef } from "react";
import { CellProps } from "./Excel";

const Cell = ({
    cell,
    inputCellId,
    handleInputBlur,
}: {
    cell: CellProps,
    inputCellId: string | null,
    handleInputBlur: (cellId: string, newValue: string) => void,
}) => {
    const inputCellRef = useRef<HTMLInputElement>(null);

    // Focus input when cell is clicked
    useEffect(() => {
        if (inputCellRef.current) {
            inputCellRef.current.focus();
        }
    }, [inputCellId]);

    const handleBlur = useCallback(() => {
        if (inputCellRef.current) {
            const updatedValue = inputCellRef.current.value;
            if (cell.id)
                handleInputBlur(cell.id, updatedValue);

            const parentCell = inputCellRef.current.closest('.cell') as HTMLElement;
            parentCell.classList.remove("focused");
        }

    }, [cell.id, handleInputBlur]);


    return (
        <div
            id={cell.id + "-cell"}
            className="cell"
            style={{
                backgroundColor: cell.bgColor,
                color: cell.textColor,
                fontFamily: cell.fontFamily,
                fontWeight: cell.isBold ? "bold" : "normal",
                fontStyle: cell.isItalic ? "italic" : "normal",
                textDecoration: cell.isStrikethrough ? "line-through" : "none",
            }}
            role="button"
        >
            {inputCellId !== cell.id ?
                <p className="cell-data" id={(cell.id) + "-data"}>
                    {cell.cellData}
                </p>
                :
                (
                    <input
                        key={cell.id}
                        id={(cell.id) + "-input"}
                        className="cell-input"
                        type="text"
                        defaultValue={cell.cellData}
                        ref={inputCellRef}
                        style={{
                            backgroundColor: cell.bgColor,
                            color: cell.textColor,
                            fontFamily: cell.fontFamily,
                        }}
                        onBlur={handleBlur}
                    />
                )
            }
        </div>
    );
};

export default Cell;
