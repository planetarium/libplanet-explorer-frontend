import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Checkbox, Pivot, PivotItem } from '@fluentui/react';

import { BlockList, TransactionList } from 'components/List';
import OffsetSwitch from 'components/OffsetSwitch';

import {
  getEndpointFromQuery,
  GRAPHQL_ENDPOINTS,
  nullEndpoint,
} from 'lib/graphQLEndPoint';
import {
  CommonPageProps,
  getCommonStaticPaths as getStaticPaths,
  getCommonStaticProps as getStaticProps,
} from 'lib/staticGeneration';
import { listTxColumns, mainMineColumns } from 'lib/listColumns';
import useOffset, { limit } from 'lib/useOffset';
import useSearchParams from 'lib/useSearchParams';

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
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [blockList, setBlockList] = useState<JSX.Element>(<></>);
  const [transactionList, setTransactionList] = useState<JSX.Element>(<></>);

  const [endpoint, setEndpoint] = useState(staticEndpoint);
  const { isReady, asPath } = useRouter();
  const [query] = useSearchParams(asPath);
  const [offset, olderHandler, newerHandler] = useOffset(asPath);
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  const {
    loading: blocksLoading,
    error: blocksError,
    data: blocksData,
  } = useQuery<BlockListQuery>(BlockListDocument, {
    variables: { offset, limit, excludeEmptyTxs },
    pollInterval: POLL_INTERVAL,
    skip: !endpoint,
  });
  const {
    loading: transactionsLoading,
    error: transactionsError,
    data: transactionsData,
  } = useQuery<TransactionListQuery>(TransactionListDocument, {
    variables: { offset, limit, desc: true },
    pollInterval: POLL_INTERVAL,
    skip: !endpoint,
  });
  useEffect(() => {
    if (!endpoint && isReady) {
      setEndpoint(getEndpointFromQuery(query) ?? GRAPHQL_ENDPOINTS[0]);
    }
  }, [endpoint, isReady, query]);
  useEffect(() => {
    if (blocksError) {
      console.error(blocksError);
      setBlockList(<p>{blocksError.message}</p>);
    } else {
      setBlocks(
        blocksLoading
          ? null
          : (blocksData?.chainQuery.blockQuery?.blocks as Block[]) ?? null
      );
      setBlockList(
        <BlockList
          blocks={blocks}
          loading={!endpoint || blocksLoading}
          columns={mainMineColumns(endpoint ?? nullEndpoint)}
          endpoint={endpoint ?? nullEndpoint}
        />
      );
    }
    if (transactionsError) {
      console.error(transactionsError);
      setTransactionList(<p>{transactionsError.message}</p>);
    } else {
      setTransactionList(
        <TransactionList
          columns={listTxColumns(endpoint ?? nullEndpoint)}
          endpoint={endpoint ?? nullEndpoint}
          loading={!endpoint || transactionsLoading}
          transactions={
            transactionsLoading
              ? null
              : (transactionsData?.chainQuery.transactionQuery?.transactions as
                  | Transaction[]) ?? null
          }
        />
      );
    }
  }, [
    blocks,
    blocksData?.chainQuery.blockQuery?.blocks,
    blocksError,
    blocksLoading,
    endpoint,
    transactionsData?.chainQuery.transactionQuery?.transactions,
    transactionsError,
    transactionsLoading,
  ]);

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
          older: !endpoint || blocksLoading || transactionsLoading,
          newer:
            !endpoint || blocksLoading || transactionsLoading || offset < 1,
        }}
      />
      <Pivot>
        <PivotItem headerText="Blocks">{blockList}</PivotItem>
        <PivotItem headerText="Transactions">{transactionList}</PivotItem>
      </Pivot>
    </main>
  );
}

function SummaryCards({ blocks }: { blocks: Block[] | null }) {
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
}

function Cards({
  interval,
  difficultyAverage,
  totalTxNumber,
}: {
  interval: number;
  difficultyAverage: number;
  totalTxNumber: number;
}) {
  return (
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
}

export { getStaticProps, getStaticPaths };
