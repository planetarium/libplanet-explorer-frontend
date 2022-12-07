import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Checkbox, Pivot, PivotItem } from '@fluentui/react';

import ConsoleError from 'components/ConsoleError';
import { BlockList, TransactionList } from 'components/List';
import OffsetSwitch from 'components/OffsetSwitch';

import { nullEndpoint } from 'lib/graphQLEndPoint';
import {
  CommonPageProps,
  getCommonStaticPaths as getStaticPaths,
  getCommonStaticProps as getStaticProps,
} from 'lib/staticGeneration';
import { listTxColumns, mainMineColumns } from 'lib/listColumns';
import useEndpoint from 'lib/useEndpoint';
import useOffset, { limit } from 'lib/useOffset';

import {
  Block,
  BlockListDocument,
  BlockListQuery,
  Transaction,
  TransactionListDocument,
  TransactionListQuery,
} from 'src/gql/graphql';

const POLL_INTERVAL = 2000;
const ROUND_DIGITS = 4;

export default function Summary({ staticEndpoint }: CommonPageProps) {
  const endpoint = useEndpoint(staticEndpoint);
  const [offset, olderHandler, newerHandler] = useOffset();
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  const {
    loading: blocksLoading,
    error: blocksError,
    data: blocksData,
  } = useQuery<BlockListQuery>(BlockListDocument, {
    variables: { offset, limit, excludeEmptyTxs },
    pollInterval: POLL_INTERVAL,
    skip: !(endpoint && offset !== undefined),
  });
  const {
    loading: transactionsLoading,
    error: transactionsError,
    data: transactionsData,
  } = useQuery<TransactionListQuery>(TransactionListDocument, {
    variables: { offset, limit, desc: true },
    pollInterval: POLL_INTERVAL,
    skip: !(endpoint && offset !== undefined),
  });
  const blocks = useMemo(
    () =>
      !endpoint || blocksLoading || blocksError
        ? null
        : (blocksData?.chainQuery.blockQuery?.blocks as Block[]) ?? null,
    [
      blocksData?.chainQuery.blockQuery?.blocks,
      blocksError,
      blocksLoading,
      endpoint,
    ]
  );
  const transactions = useMemo(
    () =>
      !endpoint || transactionsLoading || transactionsError
        ? null
        : (transactionsData?.chainQuery.transactionQuery
            ?.transactions as Transaction[]) ?? null,
    [
      endpoint,
      transactionsData?.chainQuery.transactionQuery?.transactions,
      transactionsError,
      transactionsLoading,
    ]
  );
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
        disable={
          !endpoint ||
          blocksLoading ||
          transactionsLoading ||
          offset == undefined
            ? { older: true, newer: true }
            : { older: false, newer: offset < 1 }
        }
      />
      <Pivot>
        <PivotItem headerText="Blocks">
          {blocksError && (
            <>
              <ConsoleError>blocksError</ConsoleError>
              <p>{blocksError.message}</p>
            </>
          )}
          {!blocksError && (
            <BlockList
              blocks={blocks}
              loading={!endpoint || blocksLoading}
              columns={mainMineColumns(endpoint ?? nullEndpoint)}
              endpoint={endpoint ?? nullEndpoint}
            />
          )}
        </PivotItem>
        <PivotItem headerText="Transactions">
          {transactionsError && (
            <>
              <ConsoleError>transactionsError</ConsoleError>
              <p>{transactionsError.message}</p>
            </>
          )}
          {!transactionsError && (
            <TransactionList
              columns={listTxColumns(endpoint ?? nullEndpoint)}
              endpoint={endpoint ?? nullEndpoint}
              loading={!endpoint || transactionsLoading}
              transactions={transactions}
            />
          )}
        </PivotItem>
      </Pivot>
    </main>
  );
}

function SummaryCards({ blocks }: { blocks: Block[] | null }) {
  if (blocks === null)
    return <Cards interval={0} totalBlockProposer={0} totalTxNumber={0} />;

  const timestamps: Date[] = blocks.map(block => new Date(block.timestamp));

  let interval = 0;
  for (let i = 0; i < timestamps.length - 1; i++) {
    interval += +timestamps[i] - +timestamps[i + 1];
  }
  interval /= (timestamps.length - 1) * 1000;

  const txNumbers = blocks.map(block => block.transactions.length);
  const totalTxNumber = txNumbers.reduce((a, b) => a + b, 0);
  const totalBlockProposer = new Set(blocks.map(block => block.miner)).size;
  return (
    <Cards
      interval={interval}
      totalBlockProposer={totalBlockProposer}
      totalTxNumber={totalTxNumber}
    />
  );
}

function Cards({
  interval,
  totalBlockProposer,
  totalTxNumber,
}: {
  interval: number;
  totalBlockProposer: number;
  totalTxNumber: number;
}) {
  return (
    <div className="cards">
      <div className="card" key="interval">
        <strong>{interval.toFixed(ROUND_DIGITS)}</strong> sec
        <p>Average interval in this page</p>
      </div>
      <div className="card" key="total-block-proposer">
        <strong>{totalBlockProposer}</strong>
        <p># of block proposer in this page</p>
      </div>
      <div className="card" key="total-tx-number">
        <strong>{Math.floor(totalTxNumber).toLocaleString()}</strong>
        <p># of transactions in this page</p>
      </div>
    </div>
  );
}

export { getStaticProps, getStaticPaths };
