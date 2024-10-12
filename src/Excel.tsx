import {
    ChangeEvent,
    FocusEvent,
    memo,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

interface CellProps {
    id: string | null,
    cellData: string,
    bgColor: string,
    textColor: string,
    fontFamily: string,
    isBold: boolean,
    isItalic: boolean,
    isStrikethrough: boolean,
}

const rgbToHex = (rgb: string): string => {
    const result = rgb.match(/\d+/g);
    if (result && result.length === 3) {
        const [r, g, b] = result.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
    return rgb;
};

const indexToAlphabetHeaders = (index: number): string | undefined => {
    if (index === undefined || index < 0) return;

    let alphabets = '';
    while (index >= 0) {
        alphabets = String.fromCharCode(65 + (index % 26)) + alphabets;
        index = Math.floor(index / 26) - 1;
        if (index < 0) break;
    }
    return alphabets;
}


// Main Excel Component
export default function Excel() {
    const COLUMN_LIMIT = 10;
    const ROW_LIMIT = 10;

    const [cellsData, setCellsData] = useState<Array<Array<CellProps>>>([]);
    const [inputCellId, setInputCellId] = useState<string | null>(null);
    const [editableCellProps, setEditableCellProps] = useState<Record<string, any>>({
        bgColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'sans-serif',
        isBold: false,
        isItalic: false,
        isStrikethrough: false,
    });

    const [focusedCell, setFocusedCell] = useState<HTMLElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize cells
    useEffect(() => {
        const savedCellsData = localStorage.getItem('excelCellsData');

        if (savedCellsData) {
            setCellsData(JSON.parse(savedCellsData));
        } else {
            const createCellArr = () => {
                const newCellsData = Array.from({ length: COLUMN_LIMIT }, (_, i) =>
                    Array.from({ length: ROW_LIMIT }, (_, j) => ({
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
        if (cellsData.length > 0) {
            localStorage.setItem('excelCellsData', JSON.stringify(cellsData));
        }
    }, [cellsData]);


    const handleCellFocus = (e: FocusEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('.cell')) {
            const cell = target.closest('.cell') as HTMLElement;
            cell.ondblclick = () => setInputCellId(cell.id.split("-").slice(0, -1).join('-'));
            cell.onkeydown = (e) => {
                if (e.key === "Enter")
                    setInputCellId(cell.id.split("-").slice(0, -1).join('-'));
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
        }
    };


    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const grid = document.querySelector("#cell-grid");

            if (focusedCell) {
                // Check if click is outside the grid
                if (!grid?.contains(e.target as Node)) {
                    focusedCell.classList.add("focused"); // Retain shadow
                }
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [focusedCell]);


    const handleCellPropChange = useCallback((e: React.SyntheticEvent<any>, cellProp: keyof CellProps) => {
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

    return (
        <section id="excel">
            <h1>Excel Component</h1>
            <CellPropertiesForm
                editableCellProps={editableCellProps}
                handleCellPropChange={handleCellPropChange}
                handleCellMerge={handleCellMerge}
                focusedCell={focusedCell}
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

function CellPropertiesForm({
    editableCellProps,
    handleCellPropChange,
    handleCellMerge,
    focusedCell
}: {
    editableCellProps?: Record<string, string>,
    handleCellPropChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, cellProp: any) => void,
    handleCellMerge: () => void,
    focusedCell: HTMLElement | null
}) {
    const [localProps, setLocalProps] = useState(editableCellProps);

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
                    value={localProps?.bgColor || '#ffffff'}
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
                    value={localProps?.textColor || '#000000'}
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
                    value={localProps?.fontFamily || 'sans-serif'}
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
                    // @ts-ignore types are correct but showing error
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
                    // @ts-ignore types are correct but showing error
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
                    // @ts-ignore types are correct but showing error
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
                    // @ts-ignore types are correct but showing error
                    onClick={handleCellMerge}
                />
            </div>
        </form>
    );
}





function ColumnHeader({ columnLimit }: { columnLimit: number }) {
    return (
        <div id="column-header"
            style={{
                width: `calc(100px * ${columnLimit})`,
            }}
        >
            {Array.from({ length: columnLimit }, (_, i) => (
                <div key={"column-header-" + i} className="col-header">
                    {indexToAlphabetHeaders(i)}
                </div>
            ))}
        </div>
    );
}

function RowHeader({ rowLimit }: { rowLimit: number }) {
    return (
        <div id="row-header">
            {Array.from({ length: rowLimit }, (_, i) => (
                <div key={"row-header-" + i} className="r-header">
                    {i + 1}
                </div>
            ))}
        </div>
    );
}

const Cell = memo(({
    cell,
    inputCellId,
    handleInputBlur,
}: any) => {
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
            tabIndex={0}
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
});
