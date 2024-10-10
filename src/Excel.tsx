import {
    ChangeEvent,
    FocusEvent,
    KeyboardEvent,
    memo,
    MouseEvent,
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
}

const rgbToHex = (rgb: string): string => {
    const result = rgb.match(/\d+/g);
    if (result && result.length === 3) {
        const [r, g, b] = result.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
    return rgb;
};


// Main Excel Component
export default function Excel() {
    const COLUMN_LIMIT = 50;
    const ROW_LIMIT = 50;

    const [cellsData, setCellsData] = useState<Array<Array<CellProps>>>([]);
    const [inputCellId, setInputCellId] = useState<string | null>(null)
    const [editableCellProps, setEditableCellProps] = useState<Record<string, any>>({
        bgColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'sans-serif',
    })

    const [focusedCell, setFocusedCell] = useState<HTMLElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize cells
    useEffect(() => {
        const createCellArr = () => {
            const newCellsData = Array.from({ length: COLUMN_LIMIT }, (_, i) =>
                Array.from({ length: ROW_LIMIT }, (_, j) => ({
                    id: `${i}-${j}`,
                    cellData: "",
                    bgColor: "#ffffff",
                    textColor: "#000000",
                    fontFamily: "sans-serif"
                }))
            );

            return newCellsData;
        };
        setCellsData(createCellArr());
    }, []);

    // Focus input when cell is clicked
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [inputCellId]);

    const handleCellDoubleClick = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        if (target.closest('.cell')) {
            const cell = target.closest('.cell') as HTMLElement;
            setInputCellId(cell.id.split("-").slice(0, -1).join('-'));
        }
    };

    const handleCellInputOnEnter = (e: KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const target = e.target as HTMLElement;
            if (target.closest('.cell')) {
                const cell = target.closest('.cell') as HTMLElement;
                setInputCellId(cell.id.split("-").slice(0, -1).join('-'));
            }
        }
    };

    const handleCellFocus = (e: FocusEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('.cell')) {
            const cell = target.closest('.cell') as HTMLElement;
            setEditableCellProps({
                bgColor: rgbToHex(cell.style.backgroundColor),
                textColor: rgbToHex(cell.style.color),
                fontFamily: cell.style.fontFamily,
            });
            setFocusedCell(cell);
        }
    };

    const handleCellPropChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, cellProp: any) => {
        e.preventDefault();
        if (focusedCell) {
            const updatedValue = e.target.value;
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

    const handleInputBlur = () => {
        setInputCellId(null);
    }


    return (
        <section id="excel">
            <h1>Excel Component</h1>
            <CellPropertiesForm
                editableCellProps={editableCellProps}
                handleCellPropChange={handleCellPropChange}
                focusedCell={focusedCell}
            />

            <div id="main-grid">
                <ColumnHeader columnLimit={COLUMN_LIMIT} />

                <div id="row">
                    <RowHeader rowLimit={ROW_LIMIT} />

                    <div id="cell-grid"
                        style={{
                            gridTemplateColumns: `repeat(${COLUMN_LIMIT}, 100px`
                        }}
                        onDoubleClick={handleCellDoubleClick}
                        onKeyDown={handleCellInputOnEnter}
                        onFocus={handleCellFocus}
                    >
                        {cellsData.map((row, _) => row.map((cell, _) => (
                            <Cell
                                key={cell.id}
                                cell={cell}
                                inputCellId={inputCellId}
                                handleCellPropChange={handleCellPropChange}
                                handleInputBlur={handleInputBlur}
                                inputRef={inputRef}
                            />
                        ))
                        )}
                    </div >
                </div>

            </div>
        </section >
    )
}

function CellPropertiesForm({
    editableCellProps,
    handleCellPropChange,
    focusedCell
}: {
    editableCellProps: Record<string, any>,
    handleCellPropChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, cellProp: any) => void,
    focusedCell: HTMLElement | null
}) {

    return (
        <form id="cell-properties" onSubmit={e => e.preventDefault()}>
            <div>
                <label htmlFor="cell-bg-color">BG-Color: &nbsp;</label>
                <input id="cell-bg-color" type="color" disabled={focusedCell === null}
                    onChange={(e) => handleCellPropChange(e, "bgColor")}
                />
            </div>
            <div>
                <label htmlFor="cell-text-color">Text-Color: &nbsp;</label>
                <input id="cell-text-color" type="color" disabled={focusedCell === null} onChange={(e) => handleCellPropChange(e, "textColor")} />
            </div>
            <div>
                <label htmlFor="cell-font-family">Font-Family: &nbsp;</label>
                <select name="cell-font-family" id="cell-font-family" value={editableCellProps.fontFamily} disabled={focusedCell === null} onChange={(e) => handleCellPropChange(e, "fontFamily")}>
                    <option value="sans">sans</option>
                    <option value="sans-serif">sans-serif</option>
                    <option value="cursive">cursive</option>
                    <option value="monospace">monospace</option>
                    <option value="fantasy">fantasy</option>
                </select>
            </div>
        </form>
    )
}

function ColumnHeader({ columnLimit }: { columnLimit: number }) {
    return (
        <div id="column-header"
            style={{
                width: `calc(100px * ${columnLimit})`,
            }}
        >
            {
                Array.from({ length: columnLimit }, (_, i) => {
                    return (
                        <div
                            key={"column-header-" + i}
                            className="col-header"
                        >
                            {String.fromCharCode(i + 65)}
                        </div>
                    )
                })
            }
        </div>
    )
}

function RowHeader({ rowLimit }: { rowLimit: number }) {

    return (
        <div id="row-header">
            {
                Array.from({ length: rowLimit }, (_, i) => {
                    return (
                        <div
                            key={"row-header-" + i}
                            className="r-header"
                        >
                            {i + 1}
                        </div>
                    )
                })
            }
        </div>
    )
}

const Cell = memo(({
    cell,
    inputCellId,
    handleCellPropChange,
    handleInputBlur,
    inputRef
}: any) => {

    return (
        <div
            id={cell.id + "-cell"}
            className="cell"
            style={{
                backgroundColor: cell.bgColor,
                color: cell.textColor,
                fontFamily: cell.fontFamily,
            }}
            role="button"
            tabIndex={0}
        >
            {inputCellId !== cell.id ?
                <p
                    className="cell-data"
                    id={(cell.id) + "-data"}
                >
                    {cell.cellData}
                </p>
                :
                (
                    <input
                        key={cell.id}
                        id={(cell.id) + "-input"}
                        className="cell-input"
                        type="text"
                        style={{
                            backgroundColor: cell.bgColor,
                            color: cell.textColor,
                            fontFamily: cell.fontFamily,
                        }}
                        value={cell.cellData}
                        onChange={(e) => handleCellPropChange(e, "cellData")}
                        ref={inputRef}
                        onBlur={handleInputBlur}
                    />
                )
            }
        </div>
    )
})
