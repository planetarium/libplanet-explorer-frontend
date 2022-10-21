import React from 'react';
import { Link } from '@fluentui/react';

import Timestamp from '../components/Timestamp';
import { Block, Transaction } from '../generated/graphql';

export const commonProps = {
  isRowHeader: true,
  isResizable: true,
  isSorted: false,
};

export const mainMineColumns = (endpointName: string) => [
  {
    key: 'columnIndex',
    name: 'Index',
    fieldName: 'index',
    iconName: 'NumberSymbol',
    isIconOnly: true,
    minWidth: 60,
    maxWidth: 60,
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
      <Link href={`/${endpointName}/block/?${hash}`}>{hash}</Link>
    ),
  },
  {
    key: 'columnTimestamp',
    name: 'Timestamp',
    fieldName: 'timestamp',
    minWidth: 60,
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
    minWidth: 100,
    maxWidth: 450,
    ...commonProps,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
    onRender: ({ miner }: Block) => (
      <Link href={`/${endpointName}/account/?${miner}`}>{miner}</Link>
    ),
  },
  {
    key: 'columnDifficulty',
    name: 'Difficulty',
    minWidth: 80,
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
    key: 'columnTimeTaken',
    name: 'Time Taken',
    minWidth: 50,
    maxWidth: 200,
    ...commonProps,
    data: 'string',
    isPadded: true,
    onRender: ({ timestamp, previousBlock }: Block) => {
      if (previousBlock === null || previousBlock === undefined) {
        return <>{0}</>;
      }
      const beforeTimestamp = Date.parse(previousBlock.timestamp);
      const nowTimestamp = Date.parse(timestamp);
      return <>{(nowTimestamp - beforeTimestamp) / 1000}</>;
    },
  },
  {
    key: 'columnTxNumber',
    name: 'Tx #',
    minWidth: 30,
    maxWidth: 40,
    ...commonProps,
    isSortedDescending: false,
    data: 'number',
    isPadded: true,
    onRender: ({ transactions }: Block) => <>{transactions.length}</>,
  },
];

export const accountMineColumns = (endpointName: string) => [
  {
    key: 'columnIndex',
    name: 'Index',
    fieldName: 'index',
    iconName: 'NumberSymbol',
    isIconOnly: true,
    minWidth: 40,
    maxWidth: 60,
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
      <Link href={`/${endpointName}/block/?${hash}`}>{hash}</Link>
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
      <Link href={`/${endpointName}/account/?${miner}`}>{miner}</Link>
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
    key: 'columnTimeTaken',
    name: 'Time Taken',
    minWidth: 50,
    maxWidth: 200,
    ...commonProps,
    data: 'string',
    isPadded: true,
    onRender: ({ timestamp, previousBlock }: Block) => {
      if (previousBlock === null || previousBlock === undefined) {
        return <>{0}</>;
      }
      const beforeTimestamp = Date.parse(previousBlock.timestamp);
      const nowTimestamp = Date.parse(timestamp);
      return <>{(nowTimestamp - beforeTimestamp) / 1000}</>;
    },
  },
  {
    key: 'columnTxNumber',
    name: 'Tx #',
    minWidth: 30,
    maxWidth: 40,
    ...commonProps,
    isSortedDescending: false,
    data: 'number',
    isPadded: true,
    onRender: ({ transactions }: Block) => <>{transactions.length}</>,
  },
];

export const accountTxColumns = (endpointName: string) => [
  {
    key: 'columnNonce',
    name: 'Nonce',
    fieldName: 'nonce',
    minWidth: 5,
    maxWidth: 50,
    ...commonProps,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
  },
  {
    key: 'columnId',
    name: 'ID',
    fieldName: 'id',
    minWidth: 100,
    maxWidth: 200,
    ...commonProps,
    isSortedDescending: true,
    data: 'number',
    isPadded: true,
    onRender: ({ id }: Transaction) => (
      <Link href={`/${endpointName}/transaction/?${id}`}>{id}</Link>
    ),
  },
  {
    key: 'columnSignature',
    name: 'Signature',
    fieldName: 'signature',
    minWidth: 100,
    maxWidth: 200,
    ...commonProps,
    isSortedDescending: true,
    data: 'number',
    isPadded: true,
  },
  {
    key: 'columnSigner',
    name: 'Signer',
    fieldName: 'signer',
    minWidth: 100,
    maxWidth: 200,
    ...commonProps,
    isSortedDescending: true,
    data: 'number',
    isPadded: true,
    onRender: ({ signer }: Transaction) => (
      <Link href={`/${endpointName}/account/?${signer}`}>{signer}</Link>
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
    data: 'number',
    isPadded: true,
    onRender: ({ timestamp }: Transaction) => (
      <Timestamp timestamp={timestamp} />
    ),
  },
];

export const listTxColumns = (endpointName: string) => [
  {
    key: 'columnId',
    name: 'Id',
    fieldName: 'id',
    minWidth: 50,
    maxWidth: 300,
    isRowHeader: true,
    isResizable: true,
    isSorted: false,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
    // FIXME: We'd better to use absolute paths and make Gatsby automatically
    // to rebase these absolute paths on the PATH_PREFIX configuration.
    onRender: ({ id }: Transaction) => (
      <Link href={`/${endpointName}/transaction/?${id}`}>{id}</Link>
    ),
  },
  {
    key: 'columnSigner',
    name: 'Signer',
    fieldName: 'signer',
    minWidth: 50,
    maxWidth: 300,
    isRowHeader: true,
    isResizable: true,
    isSorted: false,
    isSortedDescending: false,
    data: 'string',
    isPadded: true,
    onRender: ({ signer }: Transaction) => (
      // FIXME: We'd better to use absolute paths and make Gatsby to
      // automatically rebase these absolute paths on the PATH_PREFIX
      // configuration.
      <Link href={`/${endpointName}/account/?${signer}`}>{signer}</Link>
    ),
  },
  {
    key: 'columnTimestamp',
    name: 'Timestamp',
    fieldName: 'timestamp',
    minWidth: 50,
    maxWidth: 100,
    isRowHeader: true,
    isResizable: true,
    isSorted: false,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
    onRender: ({ timestamp }: Transaction) => (
      <Timestamp timestamp={timestamp} />
    ),
  },
  {
    key: 'columnNonceNumber',
    name: 'Nonce',
    minWidth: 40,
    maxWidth: 80,
    isRowHeader: true,
    isResizable: true,
    isSorted: false,
    isSortedDescending: false,
    data: 'number',
    isPadded: true,
    onRender: (tx: Transaction) => <>{tx.nonce ? tx.nonce : '--'}</>,
  },
];
