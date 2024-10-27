import { indexToAlphabetHeaders } from "./utils";

export function ColumnHeader({ columnLimit }: { columnLimit: number }) {
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

export function RowHeader({ rowLimit }: { rowLimit: number }) {
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