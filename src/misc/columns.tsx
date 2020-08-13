import React from 'react';
import { Link } from '@fluentui/react';
import { IColumn } from '@fluentui/react/lib/DetailsList';

import Timestamp from '../components/Timestamp';
import { Block } from '../generated/graphql';

export const commonProps = {
  isRowHeader: true,
  isResizable: true,
  isSorted: false,
};

export const columns = [
  {
    key: 'columnIndex',
    name: 'Index',
    fieldName: 'index',
    iconName: 'NumberSymbol',
    isIconOnly: true,
    minWidth: 5,
    maxWidth: 41,
    ...commonProps,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
    onRender: ({ index }: Block) => <>{Number(index).toLocaleString()}</>,
  },
  {
    key: 'columnHash',
    name: 'Block Hash',
    fieldName: 'hash',
    minWidth: 5,
    maxWidth: 450,
    ...commonProps,
    isSortedDescending: false,
    data: 'string',
    isPadded: true,
    onRender: ({ hash }: Block) => (
      <Link href={`./block/?${hash}`}>{hash}</Link>
    ),
  },
  {
    key: 'columnTimestamp',
    name: 'Timestamp',
    fieldName: 'timestamp',
    minWidth: 100,
    maxWidth: 200,
    ...commonProps,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
    onRender: ({ timestamp }: Block) => <Timestamp timestamp={timestamp} />,
  },
  {
    key: 'columnMiner',
    name: 'Miner',
    fieldName: 'miner',
    minWidth: 123,
    maxWidth: 450,
    ...commonProps,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
    onRender: ({ miner }: Block) => (
      <Link href={`./account/?${miner}`}>{miner}</Link>
    ),
  },
  {
    key: 'columnDifficulty',
    name: 'Difficulty',
    minWidth: 50,
    maxWidth: 200,
    ...commonProps,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
    onRender: ({ difficulty }: Block) => (
      <>{Math.floor(difficulty).toLocaleString()}</>
    ),
  },
  {
    key: 'columnTxNumber',
    name: 'Tx #',
    minWidth: 5,
    maxWidth: 40,
    ...commonProps,
    isSortedDescending: false,
    data: 'number',
    isPadded: true,
    onRender: ({ transactions }: Block) => <>{transactions.length}</>,
  },
];
