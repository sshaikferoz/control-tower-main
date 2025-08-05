import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Maximize2Icon } from 'lucide-react';
import React from 'react';

type DataItem = {
  [key: string]: string | number;
};

type TableMetricProps = {
  //   totalAmount: string;
  data: DataItem[];
  columns?: Array<{ field: string; header: string }>;
  title?: string;
};

// You may need to import these styles in your global CSS or component-specific CSS
const tableStyles = `
        /* Override PrimeReact DataTable styles to match the reference design */
        .metric-table .p-datatable-wrapper {
            border-radius: 0;
            border: 0.6px solid #d1d1d1;
            overflow: hidden;
        }

        .metric-table .p-datatable-table {
            border-collapse: collapse;
            overflow:auto
        }

        .metric-table .p-datatable-thead > tr > th {
            background: transparent;
            color: #83bd01;
            font-family: 'Ghawar-Bold', Helvetica, sans-serif;
            font-size: 13px;
            font-weight: bold;
            padding: 5px 16px;
            height: 30px;
            border: none;
            text-align: left;
        }

        .metric-table .p-datatable-thead > tr > th:nth-child(2),
        .metric-table .p-datatable-thead > tr > th:nth-child(3) {
            text-align: center;
        }

        .metric-table .p-datatable-tbody > tr {
            background: transparent;
            height: 30px;
            border-bottom: 0.5px solid white;
        }

        .metric-table .p-datatable-tbody > tr:last-child {
            border-bottom: none;
        }

        .metric-table .p-datatable-tbody > tr > td {
            border: none;
            padding: 5px 16px;
            color: white;
            font-size: 14px;
            line-height: 18px;
        }

        .metric-table .p-datatable-tbody > tr > td:first-child {
            font-family: 'Ghawar-Regular', Helvetica, sans-serif;
        }

        .metric-table .p-datatable-tbody > tr > td:not(:first-child) {
            font-family: 'Ghawar-Hefty', Helvetica, sans-serif;
            text-align: center;
        }
        `;
// const TableMetric = ({ totalAmount, data, columns, title = 'My Top Items' }:
const TableMetric = ({ data, columns, title = 'My Top Items' }: TableMetricProps) => {
  // If columns are provided, use them. Otherwise, derive from the data
  const tableColumns =
    columns ||
    (data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          field: key,
          header: key.toUpperCase().replace(/_/g, ' '),
        }))
      : []);

  // Define column widths based on the reference design
  const getColumnWidth = (index: number, total: number) => {
    if (total === 3) {
      if (index === 0) return '160px'; // SUPPLIER NAME width
      if (index === 1) return '90px'; // CONTRACTS width
      if (index === 2) return '95px'; // VALUE width
    }
    return 'auto';
  };

  return (
    <>
      {/* Include the styles */}
      <style>{tableStyles}</style>

      <div className="h-full w-full overflow-hidden rounded-xl border border-solid border-[#00214E]">
        <div className="h-full p-0">
          <div className="relative h-full rounded-xl bg-gradient-to-b from-[#00214E] to-[#0164B0]">
            {/* Card Header */}
            <div className="flex items-center justify-between px-7 pt-1.5 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="text-base leading-4 font-normal tracking-[-0.16px] text-white"
                  style={{ fontFamily: 'Ghawar-Hefty, Helvetica' }}
                >
                  {title}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* <div
                  className="text-[21px] leading-8 font-bold text-white"
                  style={{ fontFamily: 'Ghawar-SmeiBold, Helvetica' }}
                >
                  {totalAmount}
                </div> */}
                {/* <Maximize2Icon className="h-4 w-[15px] text-white" /> */}
              </div>
            </div>

            {/* Table */}
            <div className="flex-grow overflow-auto px-7 pb-4">
              <div className="metric-table">
                <DataTable
                  value={data}
                  className="max-h-[175px] overflow-auto border-[0.6px] border-solid border-[#d1d1d1]"
                  showGridlines={false}
                >
                  {tableColumns.map((col, index) => (
                    <Column
                      key={col.field}
                      field={col.field}
                      header={col.header}
                      style={{
                        width: getColumnWidth(index, tableColumns.length),
                      }}
                    />
                  ))}
                </DataTable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableMetric;
