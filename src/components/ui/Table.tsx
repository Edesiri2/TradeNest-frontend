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
  emptyText?: React.ReactNode;
  className?: string;
  onRowClick?: (record: any) => void;
  loading?: boolean;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  striped = false,
  emptyText = 'No data available',
  className = '',
  onRowClick,
  loading = false
}) => {
  const tableClass = [
    'ui-table',
    striped ? 'ui-table--striped' : '',
    className
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="ui-table-container">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="ui-table-container">
        {typeof emptyText === 'string' ? (
          <div className="ui-table__empty">
            {emptyText}
          </div>
        ) : (
          emptyText
        )}
      </div>
    );
  }

  return (
    <div className="ui-table-container">
      <table className={tableClass}>
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
            {columns.map((column) => (
              <th 
                key={column.key}
                style={{ 
                  width: column.width,
                  textAlign: column.align || 'left'
                }}
                className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
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
              className={`hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-colors duration-150 ${
                striped && index % 2 === 0 ? 'bg-gray-50' : ''
              }`}
            >
              {columns.map((column) => (
                <td 
                  key={column.key}
                  style={{ textAlign: column.align || 'left' }}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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