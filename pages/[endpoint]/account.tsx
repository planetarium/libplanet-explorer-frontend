import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { Checkbox } from '@fluentui/react';

import { BlockList, TransactionList } from 'components/List';
import OffsetSwitch from 'components/OffsetSwitch';
import Wrapper from 'components/Wrapper';

import {
  getEndpointFromQuery,
  GraphQLEndPoint,
  GRAPHQL_ENDPOINTS,
  nullEndpoint,
} from 'lib/graphQLEndPoint';
import {
  CommonPageProps,
  getCommonStaticPaths as getStaticPaths,
  getCommonStaticProps as getStaticProps,
} from 'lib/staticGeneration';
import { accountMineColumns, accountTxColumns } from 'lib/listColumns';
import useOffset, { limit } from 'lib/useOffset';
import useIdFromQuery from 'lib/useIdFromQuery';
import useSearchParams from 'lib/useSearchParams';

import {
  Block,
  BlockListDocument,
  BlockListQuery,
  Transaction,
  TransactionsByAccountDocument,
  TransactionsByAccountQuery,
  TransactionCommonFragment,
} from 'src/gql/graphql';

export default function AccountPage({ staticEndpoint }: CommonPageProps) {
  const [transactionsInfo, setTransactionsInfo] = useState<JSX.Element>(<></>);
  const [blocksInfo, setBlocksInfo] = useState<JSX.Element>(<></>);

  const [endpoint, setEndpoint] = useState(staticEndpoint);
  const { isReady, asPath } = useRouter();
  const [query] = useSearchParams(asPath);
  const hash = useIdFromQuery(query);
  const [txOffset, txOlderHandler, txNewerHandler] = useOffset(asPath, 'tx');
  const [mineOffset, mineOlderHandler, mineNewerHandler] = useOffset(
    asPath,
    'mine'
  );
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  const {
    loading: transactionsLoading,
    error: transactionsError,
    data: transactionsData,
  } = useQuery<TransactionsByAccountQuery>(TransactionsByAccountDocument, {
    variables: { offset: txOffset, limit, involvedAddress: hash },
    skip: !endpoint,
  });
  const {
    loading: blocksLoading,
    error: blocksError,
    data: blocksData,
  } = useQuery<BlockListQuery>(BlockListDocument, {
    variables: { offset: mineOffset, limit, excludeEmptyTxs, miner: hash },
    skip: !endpoint,
  });
  useEffect(() => {
    if (!endpoint && isReady) {
      setEndpoint(getEndpointFromQuery(query) ?? GRAPHQL_ENDPOINTS[0]);
    }
  }, [endpoint, isReady, query]);
  useEffect(() => {
    if (transactionsError) {
      console.log(transactionsError);
      setTransactionsInfo(<p>{transactionsError.message}</p>);
    } else if (!endpoint || transactionsLoading) {
      setTransactionsInfo(
        <>
          <Ul>
            <li>Signed Transaction: Loading…</li>
            <li>Involved Transaction: Loading…</li>
          </Ul>
          <OffsetSwitch disable={{ older: true, newer: true }} />
          <TransactionListWrap
            loading={true}
            endpoint={endpoint ?? nullEndpoint}
          />
        </>
      );
    } else {
      const transactionQueryResult =
        transactionsData?.chainQuery.transactionQuery;
      const involvedTransactions =
        transactionQueryResult?.involvedTransactions as Transaction[];
      const signedTransactions =
        transactionQueryResult?.signedTransactions as Transaction[];

      if (involvedTransactions === null || signedTransactions === null) {
        console.log('transactions query failed');
        setTransactionsInfo(<p>Failed to retrieve transactions.</p>);
      }

      setTransactionsInfo(
        <>
          <Ul>
            <li>
              Signed Transaction:{' '}
              {signedTransactions.length === limit
                ? (limit - 1).toString() + '+'
                : signedTransactions.length}
            </li>
            <li>
              Involved Transaction:{' '}
              {involvedTransactions.length === limit
                ? (limit - 1).toString() + '+'
                : involvedTransactions.length}
            </li>
          </Ul>
          <OffsetSwitch
            olderHandler={txOlderHandler}
            newerHandler={txNewerHandler}
            disable={{
              older:
                transactionsLoading ||
                new Set(
                  signedTransactions
                    .map(tx => tx.id)
                    .concat(involvedTransactions.map(tx => tx.id))
                ).size < limit,
              newer: transactionsLoading || txOffset === 0,
            }}
          />
          <TransactionListWrap
            loading={false}
            signed={signedTransactions}
            involved={involvedTransactions}
            endpoint={endpoint ?? nullEndpoint}
          />
        </>
      );
    }
    if (blocksError) {
      console.error(blocksError);
      setBlocksInfo(<p>{blocksError.message}</p>);
    } else {
      const blocks =
        !endpoint || blocksLoading
          ? null
          : (blocksData?.chainQuery.blockQuery?.blocks as Block[] | null);
      setBlocksInfo(
        <>
          <Checkbox
            label="Include blocks having any tx"
            checked={excludeEmptyTxs}
            disabled={!endpoint || blocksLoading}
            onChange={() => {
              setExcludeEmptyTxs(!excludeEmptyTxs);
            }}
          />
          <OffsetSwitch
            olderHandler={mineOlderHandler}
            newerHandler={mineNewerHandler}
            disable={{
              older:
                !endpoint ||
                blocksLoading ||
                (!!blocks && blocks.length < limit),
              newer: !endpoint || blocksLoading || mineOffset === 0,
            }}
          />
          <BlockList
            blocks={blocks}
            loading={!endpoint || blocksLoading}
            columns={accountMineColumns(endpoint ?? nullEndpoint)}
            endpoint={endpoint ?? nullEndpoint}
          />
        </>
      );
    }
  }, [
    blocksData?.chainQuery.blockQuery?.blocks,
    blocksError,
    blocksLoading,
    endpoint,
    excludeEmptyTxs,
    mineNewerHandler,
    mineOffset,
    mineOlderHandler,
    transactionsData?.chainQuery.transactionQuery,
    transactionsError,
    transactionsLoading,
    txNewerHandler,
    txOffset,
    txOlderHandler,
  ]);
  return (
    <Wrapper>
      <h1>Account Details</h1>
      <p>
        Address: <b>{hash}</b>
      </p>

      <h2>Transactions count</h2>

      {transactionsInfo}
      <h2>Mined Blocks</h2>
      {blocksInfo}
    </Wrapper>
  );
}

function TransactionListWrap({
  signed,
  involved,
  loading,
  endpoint,
}: {
  signed?: TransactionCommonFragment[];
  involved?: TransactionCommonFragment[];
  loading: boolean;
  endpoint: GraphQLEndPoint;
}) {
  return (
    <>
      <h2>Signed Transactions{counter(signed)}</h2>
      <TransactionList
        loading={loading}
        transactions={signed ? signed : null}
        notFoundMessage={'No Signed Transactions'}
        endpoint={endpoint}
        columns={accountTxColumns(endpoint)}
      />
      <h2>Involved Transactions{counter(involved)}</h2>
      <TransactionList
        loading={loading}
        transactions={involved ? involved : null}
        notFoundMessage={'No Involved Transactions'}
        endpoint={endpoint}
        columns={accountTxColumns(endpoint)}
      />
    </>
  );
}

function counter(items?: unknown[]) {
  return items !== undefined && items.length > 0 && `: ${items.length}`;
}

const Ul = styled.ul`
  list-style: none;
  padding: 0;
`;

export { getStaticProps, getStaticPaths };
