import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  AiOutlineSortAscending,
  AiOutlineSortDescending
} from 'react-icons/ai';
import { IoMdAdd } from 'react-icons/io';

export function Table<T extends Object, K extends ColumnDef<any, any>[]>(
  data: T[],
  columns: K
) {
  return function tanTable(
    heading: string,
    pageSize: number,
    showPagination: boolean = false
  ) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

    const table = useReactTable({
      data,
      columns,
      initialState: {
        pagination: {
          pageSize
        }
      },
      state: {
        sorting
      },
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting
    });

    return (
      <div className={`dashboard-product-box ${heading || ''}`}>
        <div id="heading">
          <h2 className={`heading`}>{heading}</h2>
          <IoMdAdd
            onClick={() => {
              if (isTransitioning && isOpen) {
                setIsTransitioning(false);
                setTimeout(() => {
                  setIsOpen(false);
                }, 0);

                return;
              }
              setIsOpen(true);
              setTimeout(() => {
                setIsTransitioning(true);
              }, 300);
            }}
            className={`table-hide ${!isOpen && 'open'} `}
          />
        </div>

        {!isTransitioning && (
          <table className={`table ${isOpen && 'close'}`}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <span
                          {...{
                            style: header.column.getIsSorted()
                              ? {
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }
                              : {},
                            onClick: header.column.getToggleSortingHandler()
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <AiOutlineSortAscending />,
                            desc: <AiOutlineSortDescending />
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} className={`${i % 2 === 0 && 'tr-bg'}`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showPagination && !isTransitioning && (
          <div className={`table-pagination ${isOpen && 'close'}`}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <span>{` ${
              table.getState().pagination.pageIndex + 1
            } of ${table.getPageCount()}`}</span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };
}
