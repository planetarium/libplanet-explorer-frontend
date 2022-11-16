import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { Checkbox } from '@fluentui/react';

import ConsoleError from 'components/ConsoleError';
import { BlockList, TransactionList } from 'components/List';
import OffsetSwitch from 'components/OffsetSwitch';
import Wrapper from 'components/Wrapper';

import { GraphQLEndPoint, nullEndpoint } from 'lib/graphQLEndPoint';
import {
  CommonPageProps,
  getCommonStaticPaths as getStaticPaths,
  getCommonStaticProps as getStaticProps,
} from 'lib/staticGeneration';
import { accountMineColumns, accountTxColumns } from 'lib/listColumns';
import useEndpoint from 'lib/useEndpoint';
import useOffset, { limit } from 'lib/useOffset';
import useQueryItemId from 'lib/useQueryItemId';

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
  const endpoint = useEndpoint(staticEndpoint);
  const hash = useQueryItemId();
  const [txOffset, txOlderHandler, txNewerHandler] = useOffset('tx');
  const [mineOffset, mineOlderHandler, mineNewerHandler] = useOffset('mine');
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  const {
    loading: transactionsLoading,
    error: transactionsError,
    data: transactionsData,
  } = useQuery<TransactionsByAccountQuery>(TransactionsByAccountDocument, {
    variables: { offset: txOffset, limit, involvedAddress: hash },
    skip: !(endpoint && txOffset !== undefined && hash),
  });
  const {
    loading: blocksLoading,
    error: blocksError,
    data: blocksData,
  } = useQuery<BlockListQuery>(BlockListDocument, {
    variables: { offset: mineOffset, limit, excludeEmptyTxs, miner: hash },
    skip: !(endpoint && mineOffset !== undefined && hash),
  });
  const blocks = useMemo(
    () =>
      !blocksError && !!endpoint && !blocksLoading
        ? (blocksData?.chainQuery.blockQuery?.blocks as Block[]) ?? null
        : null,
    [
      blocksData?.chainQuery.blockQuery?.blocks,
      blocksError,
      blocksLoading,
      endpoint,
    ]
  );
  const { involvedTransactions, signedTransactions } = useMemo(() => {
    const transactionQueryResult =
      !transactionsError && !!endpoint && !transactionsLoading
        ? transactionsData?.chainQuery.transactionQuery
        : null;
    return {
      involvedTransactions: transactionQueryResult?.involvedTransactions as
        | Transaction[],
      signedTransactions: transactionQueryResult?.signedTransactions as
        | Transaction[],
    };
  }, [
    endpoint,
    transactionsData?.chainQuery.transactionQuery,
    transactionsError,
    transactionsLoading,
  ]);
  return (
    <Wrapper>
      <h1>Account Details</h1>
      <p>
        Address: <b>{hash}</b>
      </p>

      <h2>Transactions count</h2>

      {transactionsError ? (
        <>
          <ConsoleError>{transactionsError}</ConsoleError>
          <p>{transactionsError.message}</p>
        </>
      ) : !!endpoint &&
        !transactionsLoading &&
        (!involvedTransactions || !signedTransactions) ? (
        <p>Failed to retrieve transactions.</p>
      ) : (
        <>
          <Ul>
            <li>
              Signed Transaction:{' '}
              {!endpoint || transactionsLoading ? (
                <>Loading...</>
              ) : signedTransactions.length === limit ? (
                (limit - 1).toString() + '+'
              ) : (
                signedTransactions.length
              )}
            </li>
            <li>
              Involved Transaction:{' '}
              {!endpoint || transactionsLoading ? (
                <>Loading...</>
              ) : involvedTransactions.length === limit ? (
                (limit - 1).toString() + '+'
              ) : (
                involvedTransactions.length
              )}
            </li>
          </Ul>
          <OffsetSwitch
            olderHandler={txOlderHandler}
            newerHandler={txNewerHandler}
            disable={
              !endpoint || transactionsLoading
                ? { older: true, newer: true }
                : {
                    older:
                      new Set(
                        signedTransactions
                          .map(tx => tx.id)
                          .concat(involvedTransactions.map(tx => tx.id))
                      ).size < limit,
                    newer: !txOffset,
                  }
            }
          />
          <TransactionListWrap
            loading={!endpoint || transactionsLoading}
            signed={signedTransactions}
            involved={involvedTransactions}
            endpoint={endpoint ?? nullEndpoint}
          />
        </>
      )}
      <h2>Mined Blocks</h2>
      {blocksError ? (
        <>
          <ConsoleError>blocksError</ConsoleError>
          <p>{blocksError.message}</p>
        </>
      ) : (
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
            disable={
              !endpoint || blocksLoading
                ? { older: true, newer: true }
                : {
                    older: !!blocks && blocks.length < limit,
                    newer: !mineOffset,
                  }
            }
          />
          <BlockList
            blocks={blocks}
            loading={!endpoint || blocksLoading}
            columns={accountMineColumns(endpoint ?? nullEndpoint)}
            endpoint={endpoint ?? nullEndpoint}
          />
        </>
      )}
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
