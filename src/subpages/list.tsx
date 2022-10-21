import React, { useState } from 'react';

import {
  Checkbox,
  Pivot,
  PivotItem,
} from '@fluentui/react';

import {
  Block,
  BlockListComponent,
  Transaction,
  TransactionListComponent,
} from '../generated/graphql';

import useOffset, { limit } from '../misc/useOffset';
import { listTxColumns, mainMineColumns } from '../misc/columns';

import { BlockList, TransactionList } from '../components/List';
import OffsetSwitch from '../components/OffsetSwitch';

import { IndexPageProps } from '../pages/index';

type ListPageProps = IndexPageProps;

const POLL_INTERVAL = 2000;
const ROUND_DIGITS = 4;

const ListPage: React.FC<ListPageProps> = ({ location, ...props }) => {
  const [offset, olderHandler, newerHandler] = useOffset(location);
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  return (
    <main>
      <Checkbox
        label="Include blocks having any tx"
        checked={excludeEmptyTxs}
        onChange={() => setExcludeEmptyTxs(!excludeEmptyTxs)}
      />
      <SummaryCards blocks={blocks} />
      <OffsetSwitch
        olderHandler={olderHandler}
        newerHandler={newerHandler}
        disable={{
          older: blocksLoading || transactionsLoading,
          newer: blocksLoading || transactionsLoading || offset < 1,
        }}
      />
      <Pivot>
        <PivotItem headerText='Blocks'>
          <BlockListComponent
            variables={{ offset, limit, excludeEmptyTxs }}
            pollInterval={POLL_INTERVAL}>
            {({ data, loading, error }) => {
              setBlocksLoading(loading);
              if (error) {
                console.error(error);
                return <p>{error.message}</p>;
              }

              if (!loading) {
                setBlocks(
                  data &&
                    data.chainQuery.blockQuery &&
                    data.chainQuery.blockQuery.blocks
                    ? (data.chainQuery.blockQuery.blocks as Block[])
                    : null
                );
              }

              return (
                <BlockList
                  blocks={blocks}
                  loading={loading}
                  columns={(mainMineColumns(props.pageContext.endpoint.name))}
                  endpointName={props.pageContext.endpoint.name}
                />
              );
            }}
          </BlockListComponent>
        </PivotItem>
        <PivotItem headerText='Transactions'>
          <TransactionListComponent
            variables={{ offset, limit, desc: true }}
            pollInterval={POLL_INTERVAL}>
            {({ data, loading, error }) => {
              setTransactionsLoading(loading);
              if (error) {
                console.error(error);
                return <p>{error.message}</p>;
              }

              let transactions = null;
              if (!loading) {
                transactions =
                  data &&
                  data.chainQuery.transactionQuery &&
                  data.chainQuery.transactionQuery.transactions
                    ? (data.chainQuery.transactionQuery
                        .transactions as Transaction[])
                    : null;
              }

              return (
                <TransactionList
                  columns={listTxColumns(props.pageContext.endpoint.name)}
                  endpointName={props.pageContext.endpoint.name}
                  loading={loading}
                  transactions={transactions}
                />
              );
            }}
          </TransactionListComponent>
        </PivotItem>
      </Pivot>
    </main>
  );
};

export default ListPage;

export interface SummaryCardsProps {
  blocks: Block[] | null;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ blocks }) => {
  if (blocks === null)
    return <Cards interval={0} difficultyAverage={0} totalTxNumber={0} />;

  const timestamps: Date[] = blocks.map(block => new Date(block.timestamp));

  let interval = 0;
  for (let i = 0; i < timestamps.length - 1; i++) {
    interval += +timestamps[i] - +timestamps[i + 1];
  }
  interval /= (timestamps.length - 1) * 1000;

  const difficulties = blocks.map(block => block.difficulty);
  const difficultyAverage =
    difficulties.reduce((d, sum) => d + sum, 0) / difficulties.length;

  const txNumbers = blocks.map(block => block.transactions.length);
  const totalTxNumber = txNumbers.reduce((a, b) => a + b, 0);
  return (
    <Cards
      interval={interval}
      difficultyAverage={difficultyAverage}
      totalTxNumber={totalTxNumber}
    />
  );
};

interface CardsProps {
  interval: number;
  difficultyAverage: number;
  totalTxNumber: number;
}

const Cards: React.FC<CardsProps> = ({
  interval,
  difficultyAverage,
  totalTxNumber,
}) => (
  <div className="cards">
    <div className="card" key="interval">
      <strong>{interval.toFixed(ROUND_DIGITS)}</strong> sec
      <p>Average interval in this page</p>
    </div>
    <div className="card" key="difficultyAverage">
      <strong>{Math.floor(difficultyAverage).toLocaleString()}</strong>
      <p>Average difficulty in this page</p>
    </div>
    <div className="card" key="total-tx-number">
      <strong>{Math.floor(totalTxNumber).toLocaleString()}</strong>
      <p>Total txs in this page</p>
    </div>
  </div>
);
