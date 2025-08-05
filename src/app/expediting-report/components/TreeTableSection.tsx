'use client';
import React, { useEffect, useState } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { NodeService } from '@/services/expediting-report/NodeService';

const TreeTableSection = () => {
  const [nodes, setNodes] = useState([]);

  const columns = [
    { field: 'name', header: 'Name', expander: true },
    { field: 'size', header: 'Type' },
    { field: 'type', header: 'Size' },
  ];

  useEffect(() => {
    NodeService.getTreeTableNodes().then((data: any) => setNodes(data));
  }, []);

  return (
    <div className="card max-h-[30vh] overflow-y-auto">
      <TreeTable value={nodes} tableStyle={{ minWidth: '50rem' }}>
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} expander={col.expander} />
        ))}
      </TreeTable>
    </div>
  );
};

export default TreeTableSection;
