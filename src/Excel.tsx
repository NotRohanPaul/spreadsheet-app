import {
    ChangeEvent,
    MouseEvent,
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

// Main Excel Component
export default function Excel() {
    const COLUMN_LIMIT = 100;
    const ROW_LIMIT = 100;

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

    const focusedCellRef = useRef<HTMLElement | null>(null);
    const lastFocusedCellIdRef = useRef<HTMLElement | null>(null);


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
        setIsInitialized(true);
    }, []);

    // Save excel data to localStorage
    useEffect(() => {
        if (!isInitialized) return;

        if (localStorageDelay.current) {
            clearTimeout(localStorageDelay.current);
        }

        localStorageDelay.current = setTimeout(() => {
            if (cellsData.length > 0) {
                try {
                    localStorage.setItem('excelCellsData', JSON.stringify(cellsData));
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

    }, [cellsData, isInitialized]);

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


    // useEffect(() => {
    //     const handleOutsideClick = (e: Event) => {
    //         const grid = gridRef.current;

    //         if (focusedCellRef.current) {
    //             if (!grid?.contains(e.target as Node)) {
    //                 focusedCellRef.current.focus();
    //             }
    //         }
    //     };

    //     document.addEventListener("mousedown", handleOutsideClick);
    //     return () => {
    //         document.removeEventListener("mousedown", handleOutsideClick);
    //     };
    // }, []);

    // useEffect(() => {
    //     const handleTabPress = (e: KeyboardEvent) => {
    //         if (e.key === "Tab") {
    //             const grid = gridRef.current;
    //             const activeElement = document.activeElement;

    //             if (activeElement && !grid?.contains(activeElement) && lastFocusedCellIdRef.current) {
    //                 e.preventDefault();
    //                 const lastCell = document.getElementById(lastFocusedCellIdRef.current + "-cell");
    //                 lastCell?.focus();
    //             }
    //         }
    //     };

    //     document.addEventListener("keydown", handleTabPress);
    //     return () => {
    //         document.removeEventListener("keydown", handleTabPress);
    //     };
    // }, []);




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
    }, []);


    const handleCellMerge = () => {
        if (focusedCellRef.current) {
            const [rowIdx, colIdx] = focusedCellRef.current.id.split("-").map(Number);
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

    const handleClear = () => {
        if (focusedCellRef.current) {
            const [rowIdx, colIdx] = focusedCellRef.current.id.split("-").map(Number);

            setCellsData(prevCellsData => {
                const updatedRows = [...prevCellsData];
                const updatedRow = [...updatedRows[rowIdx]];

                updatedRow[colIdx] = {
                    ...updatedRow[colIdx],
                    cellData: "",
                    bgColor: "#ffffff",
                    textColor: "#000000",
                    fontFamily: "sans-serif",
                    isBold: false,
                    isItalic: false,
                    isStrikethrough: false,
                };

                updatedRows[rowIdx] = updatedRow;
                return updatedRows;
            });

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
        setCellsData(prevCellsData => {
            return prevCellsData.map(row =>
                row.map(cell => ({
                    ...cell,
                    cellData: "",
                    bgColor: "#ffffff",
                    textColor: "#000000",
                    fontFamily: "sans-serif",
                    isBold: false,
                    isItalic: false,
                    isStrikethrough: false,
                }))
            );
        });

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
            const csv = cellsData.map((row) => {
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

            setCellsData((prev) => handleImportedData(prev));
        };

        reader.readAsText(file);
    };

    const handleCellFocus = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault()
        const cell = (e.target as HTMLElement).closest('.cell') as HTMLElement;
        const cellId = cell.id.split("-").slice(0, -1).join('-');

        if (cell.id === focusedCellRef.current?.id || !cell) return;

        cell.classList.add("active-cell")
        { console.log(cell) }

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

        lastFocusedCellIdRef.current = focusedCellRef.current;
        focusedCellRef.current = cell;
    };

    const CellRenderer = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
        const cell = cellsData[rowIndex]?.[columnIndex];

        if (!cell) return null;

        return (
            <div style={style}>
                <Cell
                    key={cell.id}
                    cell={cell}
                    inputCellId={inputCellId}
                    handleInputBlur={handleInputBlur}
                />
            </div>
        );
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
                    onClick={handleCellFocus}
                    ref={gridRef}
                >
                    <RowHeader height={gridDimensions.height} rowLimit={ROW_LIMIT} ref={rowHeaderRef} />
                    <Grid
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



