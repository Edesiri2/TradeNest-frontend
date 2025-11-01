import React from 'react';
import './ui.css';

interface Column {
  key: string;
  title: string;
  render?: (value: any, record: any) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps {
  columns: Column[];
  data: any[];
  striped?: boolean;
  emptyText?: string;
  className?: string;
  onRowClick?: (record: any) => void;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  striped = false,
  emptyText = 'No data available',
  className = '',
  onRowClick
}) => {
  const tableClass = [
    'ui-table',
    striped ? 'ui-table--striped' : '',
    className
  ].filter(Boolean).join(' ');

  if (data.length === 0) {
    return (
      <div className="ui-table-container">
        <div className="ui-table__empty">
          {emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className="ui-table-container">
      <table className={tableClass}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                style={{ 
                  width: column.width,
                  textAlign: column.align || 'left'
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr 
              key={index}
              onClick={() => onRowClick?.(record)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <td 
                  key={column.key}
                  style={{ textAlign: column.align || 'left' }}
                >
                  {column.render 
                    ? column.render(record[column.key], record)
                    : record[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;