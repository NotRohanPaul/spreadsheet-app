/* eslint-disable @typescript-eslint/no-unused-vars */
import { FocusEvent, lazy, useCallback, useEffect, useRef, useState } from "react";
import { rgbToHex } from "./utils";
import { RowHeader } from './Headers';
import { ColumnHeader } from './Headers';


const Cell = lazy(() => import('./Cell'));
const CellPropertiesForm = lazy(() => import('./CellPropertiesForm'));

export interface CellProps {
    id: string | null,
    cellData: string,
    bgColor: string,
    textColor: string,
    fontFamily: string,
    isBold: boolean,
    isItalic: boolean,
    isStrikethrough: boolean,
}

// Main Excel Component
export default function Excel() {
    const COLUMN_LIMIT = 15;
    const ROW_LIMIT = 25;

    const [cellsData, setCellsData] = useState<Array<Array<CellProps>>>([]);
    const [inputCellId, setInputCellId] = useState<string | null>(null);
    const [editableCellProps, setEditableCellProps] = useState<Record<string, string | boolean>>({
        bgColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'sans-serif',
        isBold: false,
        isItalic: false,
        isStrikethrough: false,
    });

    const [focusedCell, setFocusedCell] = useState<HTMLElement | null>(null);
    const [lastFocusedCellId, setLastFocusedCellId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const localStorageDelay = useRef<number | null>(null)
    // Initialize cells
    useEffect(() => {
        const savedCellsData = localStorage.getItem('excelCellsData');
        const savedRowLimit = Number(localStorage.getItem('ROW_LIMIT'));
        const savedColumnLimit = Number(localStorage.getItem('COLUMN_LIMIT'));
        if (savedCellsData && savedRowLimit === ROW_LIMIT && savedColumnLimit === COLUMN_LIMIT) {
            setCellsData(JSON.parse(savedCellsData));
        } else {
            const createCellArr = () => {
                const newCellsData = Array.from({ length: ROW_LIMIT }, (_, i) =>
                    Array.from({ length: COLUMN_LIMIT }, (_, j) => ({
                        id: `${i}-${j}`,
                        cellData: "",
                        bgColor: "#ffffff",
                        textColor: "#000000",
                        fontFamily: "sans-serif",
                        isBold: false,
                        isItalic: false,
                        isStrikethrough: false,
                    }))
                );
                return newCellsData;
            };
            setCellsData(createCellArr());
        }
    }, []);

    // Save excel data to localStorage
    useEffect(() => {
        if (localStorageDelay.current) {
            clearTimeout(localStorageDelay.current);
        }

        localStorageDelay.current = setTimeout(() => {
            if (cellsData.length > 0) {
                localStorage.setItem('excelCellsData', JSON.stringify(cellsData));
                localStorage.setItem('ROW_LIMIT', ROW_LIMIT.toString());
                localStorage.setItem('COLUMN_LIMIT', COLUMN_LIMIT.toString());
            }
        }, 1000);
        { console.log(cellsData) }

        return () => {
            if (localStorageDelay.current) {
                clearTimeout(localStorageDelay.current);
            }
        }

    }, [cellsData]);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const grid = document.querySelector("#cell-grid");

            if (focusedCell) {
                if (!grid?.contains(e.target as Node)) {
                    focusedCell.classList.add("focused");
                }
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [focusedCell]);

    useEffect(() => {
        const handleTabPress = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                const grid = document.querySelector("#cell-grid");
                const activeElement = document.activeElement;

                if (activeElement && !grid?.contains(activeElement) && lastFocusedCellId) {
                    e.preventDefault();
                    const lastCell = document.getElementById(lastFocusedCellId + "-cell");
                    lastCell?.focus();
                }
            }
        };

        document.addEventListener("keydown", handleTabPress);
        return () => {
            document.removeEventListener("keydown", handleTabPress);
        };
    }, [lastFocusedCellId]);


    const handleCellFocus = (e: FocusEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('.cell')) {
            const cell = target.closest('.cell') as HTMLElement;
            const cellId = cell.id.split("-").slice(0, -1).join('-');
            cell.ondblclick = () => setInputCellId(cellId);
            cell.onkeydown = (e) => {
                if (e.key === "Enter")
                    setInputCellId(cellId);
            }

            setEditableCellProps({
                bgColor: rgbToHex(cell.style.backgroundColor),
                textColor: rgbToHex(cell.style.color),
                fontFamily: cell.style.fontFamily,
                isBold: cell.style.fontWeight === "bold",
                isItalic: cell.style.fontStyle === "italic",
                isStrikethrough: cell.style.textDecoration === "line-through"
            });

            if (focusedCell && focusedCell !== cell) {
                focusedCell.classList.remove("focused");
            }

            cell.classList.add("focused");
            setFocusedCell(cell);
            setLastFocusedCellId(cellId);
        }
    };

    const handleCellPropChange = useCallback((e: React.SyntheticEvent<Element>, cellProp: keyof CellProps) => {
        e.preventDefault();
        if (focusedCell) {
            let updatedValue;;
            if (e.type === "click") {
                const target = e.target as HTMLInputElement;
                updatedValue = target.checked;
            }
            else {
                const target = e.target as HTMLInputElement | HTMLSelectElement;
                updatedValue = target.value;
            }

            const [rowIdx, colIdx] = focusedCell.id.split("-").map(Number);

            setCellsData(prevCellsData => {
                const updatedRows = [...prevCellsData];
                const updatedRow = [...updatedRows[rowIdx]];

                updatedRow[colIdx] = {
                    ...updatedRow[colIdx],
                    [cellProp]: updatedValue,
                };

                updatedRows[rowIdx] = updatedRow;

                return updatedRows;
            });

            setEditableCellProps(prevProps => ({ ...prevProps, [cellProp]: updatedValue }));
        }
    }, [focusedCell]);


    const handleCellMerge = () => {
        if (focusedCell) {
            const [rowIdx, colIdx] = focusedCell.id.split("-").map(Number);
            if (colIdx < (COLUMN_LIMIT - 1)) {
                setCellsData(prevCellsData => {
                    const updatedRows = [...prevCellsData];
                    const updatedRow = [...updatedRows[rowIdx]]

                    updatedRow[colIdx] = {
                        ...updatedRow[colIdx],
                        cellData: updatedRow[colIdx].cellData + updatedRow[colIdx + 1].cellData,
                    }

                    updatedRow[colIdx + 1] = {
                        ...updatedRow[colIdx + 1],
                        cellData: "",
                        bgColor: "#ffffff",
                        textColor: "#000000",
                        fontFamily: "sans-serif",
                        isBold: false,
                        isItalic: false,
                        isStrikethrough: false,
                    };

                    updatedRows[rowIdx] = updatedRow

                    return updatedRows
                })
            }
        }
    }

    const handleInputBlur = (cellId: string, newValue: string) => {
        const [rowIdx, colIdx] = cellId.split("-").map(Number);

        setCellsData(prevCellsData => {
            const updatedRows = [...prevCellsData];
            const updatedRow = [...updatedRows[rowIdx]];

            updatedRow[colIdx] = {
                ...updatedRow[colIdx],
                cellData: newValue,
            };

            updatedRows[rowIdx] = updatedRow;
            return updatedRows;
        });

        setInputCellId(null);
    };

    const handleDownload = () => {
        try {
            const csv = cellsData.map((row) => {
                return (row.map((col) => col.cellData).join(",") + ",\n")
            }).join("")
            const link = document.createElement("a");

            const file = new Blob([csv], { type: 'text/plain' });

            link.href = URL.createObjectURL(file);

            link.download = "excel.csv";

            link.click();
            URL.revokeObjectURL(link.href);
        }
        catch (err) {
            console.warn(err);
        }
    };


    return (
        <section id="excel">
            <h1>Excel Component</h1>
            <CellPropertiesForm
                editableCellProps={editableCellProps}
                handleCellPropChange={handleCellPropChange}
                handleCellMerge={handleCellMerge}
                focusedCell={focusedCell}
                handleDownload={handleDownload}
            />

            <div id="main-grid">
                <ColumnHeader columnLimit={COLUMN_LIMIT} />

                <div id="row">
                    <RowHeader rowLimit={ROW_LIMIT} />

                    <div id="cell-grid"
                        style={{
                            gridTemplateColumns: `repeat(${COLUMN_LIMIT}, 100px)`
                        }}
                        onFocus={handleCellFocus}
                    >
                        {cellsData.map((row, _) => row.map((cell, _) => (
                            <Cell
                                key={cell.id}
                                cell={cell}
                                inputCellId={inputCellId}
                                handleInputBlur={handleInputBlur}
                                inputRef={inputRef}
                            />
                        )))}
                    </div>
                </div>

            </div>
        </section>
    );
}

