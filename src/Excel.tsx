import {
    ChangeEvent,
    FocusEvent,
    Suspense,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";

import {
    FixedSizeGrid as Grid,
    FixedSizeList as List,
    GridChildComponentProps,
    GridOnScrollProps
} from 'react-window';

import { rgbToHex } from "./utils";
import { RowHeader } from './Headers';
import { ColumnHeader } from './Headers';
import Cell from './Cell';
import CellPropertiesForm from './components/CellPropertiesForm/CellPropertiesForm';

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

const CellRenderer = ({ columnIndex, rowIndex, style, data: { cellsDataRef, inputCellId, handleInputBlur } }: GridChildComponentProps) => {
    const cell = cellsDataRef.current[rowIndex]?.[columnIndex];

    if (!cell) return null;

    return (
        <div
            style={style}
        >
            <Cell
                key={cell.id}
                cell={cell}
                inputCellId={inputCellId}
                handleInputBlur={handleInputBlur}
            />
        </div>
    );
};


// Main Excel Component
export default function Excel() {
    const COLUMN_LIMIT = 100;
    const ROW_LIMIT = 100;

    const cellsDataRef = useRef<Array<Array<CellProps>>>([]);
    const [version, setVersion] = useState(0);
    const [inputCellId, setInputCellId] = useState<string | null>(null);
    const [editableCellProps, setEditableCellProps] = useState<Record<string, string | boolean>>({
        bgColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'sans-serif',
        isBold: false,
        isItalic: false,
        isStrikethrough: false,
    });

    const focusedCellRef = useRef<HTMLElement | null>(null);
    const localStorageDelay = useRef<number | null>(null)

    const [isInitialized, setIsInitialized] = useState(false);
    const [gridDimensions, setGridDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 })

    const columnHeaderRef = useRef<List | null>(null);
    const rowHeaderRef = useRef<List | null>(null);
    const gridRef = useRef<HTMLDivElement | null>(null);



    // Initialize cells
    useEffect(() => {
        const savedCellsData = localStorage.getItem('excelCellsData');
        const savedRowLimit = Number(localStorage.getItem('ROW_LIMIT'));
        const savedColumnLimit = Number(localStorage.getItem('COLUMN_LIMIT'));
        if (savedCellsData && savedRowLimit === ROW_LIMIT && savedColumnLimit === COLUMN_LIMIT) {
            cellsDataRef.current = JSON.parse(savedCellsData);
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
            cellsDataRef.current = createCellArr();
        }
        setVersion((v) => v + 1)
        setIsInitialized(true);
    }, []);

    // Save excel data to localStorage
    useEffect(() => {
        if (!isInitialized) return;

        if (localStorageDelay.current) {
            clearTimeout(localStorageDelay.current);
        }

        localStorageDelay.current = setTimeout(() => {
            if (cellsDataRef.current.length > 0) {
                try {
                    localStorage.setItem('excelCellsData', JSON.stringify(cellsDataRef.current));
                    localStorage.setItem('ROW_LIMIT', ROW_LIMIT.toString());
                    localStorage.setItem('COLUMN_LIMIT', COLUMN_LIMIT.toString());
                }
                catch (err) {
                    console.log(err);
                }
            }
        }, 1000);

        return () => {
            if (localStorageDelay.current) {
                clearTimeout(localStorageDelay.current);
            }
        }

    }, [version, isInitialized]);

    const handleScroll = ({ scrollTop, scrollLeft }: GridOnScrollProps) => {
        if (columnHeaderRef.current) {
            columnHeaderRef.current.scrollTo(scrollLeft);
        }
        if (rowHeaderRef.current) {
            rowHeaderRef.current.scrollTo(scrollTop);
        }
    };

    useLayoutEffect(() => {
        const updateGridDimensions = () => {
            const width = (window.innerWidth);
            const height = (window.innerHeight) - 150;
            setGridDimensions({ width, height });
        };
        updateGridDimensions();

        window.addEventListener("resize", updateGridDimensions);

        return () => {
            window.removeEventListener("resize", updateGridDimensions);
        };
    }, []);


    useEffect(() => {
        const handleGridFocus = () => {
            { console.log(focusedCellRef) }
            if (focusedCellRef.current) {
                focusedCellRef.current.focus();
            }
        };

        const gridElement = gridRef.current;
        if (gridElement) {
            gridElement.addEventListener('focus', handleGridFocus);
        }

        return () => {
            if (gridElement) {
                gridElement.removeEventListener('focus', handleGridFocus);
            }
        };
    }, []);




    const handleCellPropChange = useCallback((e: React.SyntheticEvent<Element>, cellProp: keyof CellProps) => {
        e.preventDefault();
        if (focusedCellRef.current) {
            let updatedValue;;
            if (e.type === "click") {
                const target = e.target as HTMLInputElement;
                updatedValue = target.checked;
            }
            else {
                const target = e.target as HTMLInputElement | HTMLSelectElement;
                updatedValue = target.value;
            }

            const [rowIdx, colIdx] = focusedCellRef.current.id.split("-").map(Number);

            (cellsDataRef.current[rowIdx][colIdx][cellProp] as string | boolean) = updatedValue;
            setEditableCellProps((prevProps) => ({ ...prevProps, [cellProp]: updatedValue }));
            setVersion((v) => v + 1);
        }
    }, []);


    const handleCellMerge = () => {
        if (focusedCellRef.current) {
            const [rowIdx, colIdx] = focusedCellRef.current.id.split("-").map(Number);
            if (colIdx < (COLUMN_LIMIT - 1)) {
                cellsDataRef.current[rowIdx][colIdx].cellData += cellsDataRef.current[rowIdx][colIdx + 1].cellData;
                cellsDataRef.current[rowIdx][colIdx + 1].cellData = "";
                setVersion((v) => v + 1);
            }
        }
    }

    const handleInputBlur = (cellId: string, newValue: string) => {
        const [rowIdx, colIdx] = cellId.split("-").map(Number);

        cellsDataRef.current[rowIdx][colIdx].cellData = newValue;
        setVersion((v) => v + 1);
        setInputCellId(null);
    };

    const handleClear = () => {
        if (focusedCellRef.current) {
            const [rowIdx, colIdx] = focusedCellRef.current.id.split("-").map(Number);
            cellsDataRef.current[rowIdx][colIdx] = {
                ...cellsDataRef.current[rowIdx][colIdx],
                cellData: "",
                bgColor: "#ffffff",
                textColor: "#000000",
                fontFamily: "sans-serif",
                isBold: false,
                isItalic: false,
                isStrikethrough: false,
            };
            setVersion((v) => v + 1);
            setEditableCellProps({
                bgColor: '#ffffff',
                textColor: '#000000',
                fontFamily: 'sans-serif',
                isBold: false,
                isItalic: false,
                isStrikethrough: false,
            });
        }
    };

    const handleClearAll = () => {
        cellsDataRef.current = cellsDataRef.current.map(row => row.map(cell => ({
            ...cell,
            cellData: "",
            bgColor: "#ffffff",
            textColor: "#000000",
            fontFamily: "sans-serif",
            isBold: false,
            isItalic: false,
            isStrikethrough: false,
        })))
        setVersion((v) => v + 1);
        setEditableCellProps({
            bgColor: '#ffffff',
            textColor: '#000000',
            fontFamily: 'sans-serif',
            isBold: false,
            isItalic: false,
            isStrikethrough: false,
        });
    };


    const handleDownload = () => {
        try {
            const csv = cellsDataRef.current.map((row) => {
                return (row.map((col) => col.cellData).join(",") + "\n")
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

    const handleImportCsv = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const handleImportedData = (prev: CellProps[][]) => {
                const text = e.target?.result as string;
                const rows = text.split("\n").slice(0, ROW_LIMIT);
                const importedData = prev.map((row, i) => {
                    return row.map((cell, j) => {
                        const cellData = rows[i]?.split(",")[j] || "";
                        return {
                            ...cell,
                            cellData,
                            bgColor: "#ffffff",
                            textColor: "#000000",
                            fontFamily: "sans-serif",
                            isBold: false,
                            isItalic: false,
                            isStrikethrough: false,
                        };
                    });
                });
                return importedData;
            };

            cellsDataRef.current = handleImportedData(cellsDataRef.current);
            setVersion((v) => v + 1);
        };

        reader.readAsText(file);
    };

    const handleCellFocus = (e: FocusEvent<HTMLElement>) => {
        const cell = (e.target as HTMLElement).closest('.cell') as HTMLElement;
        if (cell?.id === focusedCellRef.current?.id || !cell) return;
        const cellId = cell.id.split("-").slice(0, -1).join('-');

        focusedCellRef.current?.classList.remove("active-cell");
        focusedCellRef.current = cell;
        focusedCellRef.current.classList.add("active-cell")

        cell.ondblclick = () => {
            setInputCellId(cellId);
        }
        cell.onkeydown = (e) => {
            if (e.key === "Enter") {
                setInputCellId(cellId);
            }
        }

        setEditableCellProps({
            bgColor: rgbToHex(cell.style.backgroundColor),
            textColor: rgbToHex(cell.style.color),
            fontFamily: cell.style.fontFamily,
            isBold: cell.style.fontWeight === "bold",
            isItalic: cell.style.fontStyle === "italic",
            isStrikethrough: cell.style.textDecoration === "line-through"
        });

    };



    return (
        <section id="excel">
            <h1>Excel Component</h1>
            <Suspense fallback={<h1>Loading</h1>}>
                <CellPropertiesForm
                    editableCellProps={editableCellProps}
                    handleCellPropChange={handleCellPropChange}
                    handleCellMerge={handleCellMerge}
                    focusedCell={focusedCellRef.current}
                    handleDownload={handleDownload}
                    handleImportCsv={handleImportCsv}
                    handleClear={handleClear}
                    handleClearAll={handleClearAll}
                />
            </Suspense>

            <div id="main-grid">
                <ColumnHeader width={gridDimensions.width} columnLimit={COLUMN_LIMIT} ref={columnHeaderRef} />
                <div id="row-part"
                    onFocus={handleCellFocus}
                    tabIndex={0}
                    ref={gridRef}
                >
                    <RowHeader height={gridDimensions.height} rowLimit={ROW_LIMIT} ref={rowHeaderRef} />
                    <Grid
                        itemData={{ cellsDataRef, inputCellId, handleInputBlur }}
                        width={gridDimensions.width}
                        height={gridDimensions.height}
                        columnCount={COLUMN_LIMIT}
                        columnWidth={100}
                        rowCount={ROW_LIMIT}
                        rowHeight={30}
                        onScroll={handleScroll}
                        style={{ paddingRight: "1rem" }}
                    >
                        {CellRenderer}
                    </Grid>
                </div>
            </div>
        </section >
    );
}



