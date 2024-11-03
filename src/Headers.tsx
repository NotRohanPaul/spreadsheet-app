import { FixedSizeList as List } from "react-window";
import { indexToAlphabetHeaders } from "./utils";
import { forwardRef, Ref, } from "react";

export const ColumnHeader = forwardRef(({ width, columnLimit }: { columnLimit: number, width: number }, ref) => {
    return (
        <div className="column-header-container">
            <List
                ref={ref as Ref<List>}
                width={width - 115}
                height={30}
                itemCount={columnLimit}
                itemSize={100}
                layout="horizontal"
                style={{ overflow: "hidden", marginLeft: "50px" }}
            >
                {({ index, style }) => (
                    <div key={`column-header-${index}`} style={{ ...style, width: "100px" }} className="column-header header">
                        {indexToAlphabetHeaders(index)}
                    </div>
                )}
            </List>
        </div >
    );
});

export const RowHeader = forwardRef(({ height, rowLimit }: { rowLimit: number, height: number }, ref) => {
    return (
        <div className="row-header-container">
            <List
                ref={ref as Ref<List>}
                width={50}
                height={height - 20}
                itemCount={rowLimit}
                itemSize={30}
                layout="vertical"
                style={{ overflow: "hidden" }}
            >
                {({ index, style }) => (
                    <div key={`row-header-${index}`} style={{ ...style, height: "30px" }} className="row-header header">
                        {index + 1}
                    </div>
                )}
            </List>
        </div >
    );
});
