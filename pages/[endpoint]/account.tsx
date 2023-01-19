import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { Checkbox, Pivot, PivotItem, Stack } from '@fluentui/react';

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
  StagedTransactionsByAccountDocument,
  StagedTransactionsByAccountQuery,
} from 'src/gql/graphql';

export default function AccountPage({ staticEndpoint }: CommonPageProps) {
  const endpoint = useEndpoint(staticEndpoint);
  const hash = useQueryItemId();
  const [offset, olderHandler, newerHandler] = useOffset();
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  const {
    loading: blocksLoading,
    error: blocksError,
    data: blocksData,
  } = useQuery<BlockListQuery>(BlockListDocument, {
    variables: { offset, limit, excludeEmptyTxs, miner: hash },
    skip: !(endpoint && offset !== undefined && hash),
  });
  const {
    loading: transactionsLoading,
    error: transactionsError,
    data: transactionsData,
  } = useQuery<TransactionsByAccountQuery>(TransactionsByAccountDocument, {
    variables: { offset, limit, involvedAddress: hash },
    skip: !(endpoint && offset !== undefined && hash),
  });
  const {
    loading: stagedTxsLoading,
    error: stagedTxsError,
    data: stagedTxsData,
  } = useQuery<StagedTransactionsByAccountQuery>(
    StagedTransactionsByAccountDocument,
    {
      variables: { offset, limit, involvedAddress: hash },
      skip: !(endpoint && offset !== undefined && hash),
    }
  );
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
  const { involvedStagedTxs, signedStagedTxs } = useMemo(() => {
    const stagedTxsQueryResult =
      !stagedTxsError && !!endpoint && !stagedTxsLoading
        ? stagedTxsData?.chainQuery.transactionQuery
        : null;
    return {
      involvedStagedTxs: stagedTxsQueryResult?.involvedTransactions as
        | Transaction[],
      signedStagedTxs: stagedTxsQueryResult?.signedTransactions as
        | Transaction[],
    };
  }, [
    endpoint,
    stagedTxsData?.chainQuery.transactionQuery,
    stagedTxsError,
    stagedTxsLoading,
  ]);
  return (
    <Wrapper>
      <h2>Account {hash}</h2>
      <Stack horizontal horizontalAlign="space-between">
        <OffsetSwitch
          olderHandler={olderHandler}
          newerHandler={newerHandler}
          disable={
            !endpoint ||
            blocksLoading ||
            transactionsLoading ||
            stagedTxsLoading
              ? { older: true, newer: true }
              : {
                  older:
                    !!blocks &&
                    blocks.length < limit &&
                    !!signedTransactions &&
                    !!involvedTransactions &&
                    new Set(
                      signedTransactions
                        .map(tx => tx.id)
                        .concat(involvedTransactions.map(tx => tx.id))
                    ).size < limit &&
                    !!signedStagedTxs &&
                    !!involvedStagedTxs &&
                    new Set(
                      signedStagedTxs
                        .map(tx => tx.id)
                        .concat(involvedStagedTxs.map(tx => tx.id))
                    ).size < limit,
                  newer: !offset,
                }
          }
        />
        <Checkbox
          label="Include blocks having any tx"
          checked={excludeEmptyTxs}
          onChange={() => {
            setExcludeEmptyTxs(!excludeEmptyTxs);
          }}
        />
      </Stack>
      <Pivot>
        <PivotItem headerText="Mined Blocks">
          {blocksError ? (
            <>
              <ConsoleError>blocksError</ConsoleError>
              <p>{blocksError.message}</p>
            </>
          ) : (
            <BlockList
              blocks={blocks}
              loading={!endpoint || blocksLoading}
              columns={accountMineColumns(endpoint ?? nullEndpoint)}
              endpoint={endpoint ?? nullEndpoint}
            />
          )}
        </PivotItem>
        <PivotItem headerText="Signed Txs">
          {transactionsError ? (
            <>
              <ConsoleError>{transactionsError}</ConsoleError>
              <p>{transactionsError.message}</p>
            </>
          ) : !!endpoint && !transactionsLoading && !signedTransactions ? (
            <p>Failed to retrieve transactions.</p>
          ) : (
            <TransactionList
              loading={!endpoint || transactionsLoading}
              transactions={signedTransactions ? signedTransactions : null}
              notFoundMessage={'No Signed Transactions'}
              endpoint={endpoint ?? nullEndpoint}
              columns={accountTxColumns(endpoint ?? nullEndpoint)}
            />
          )}
        </PivotItem>
        <PivotItem headerText="Involved Txs">
          {transactionsError ? (
            <>
              <ConsoleError>{transactionsError}</ConsoleError>
              <p>{transactionsError.message}</p>
            </>
          ) : !!endpoint && !transactionsLoading && !involvedTransactions ? (
            <p>Failed to retrieve transactions.</p>
          ) : (
            <TransactionList
              loading={!endpoint || transactionsLoading}
              transactions={involvedTransactions ? involvedTransactions : null}
              notFoundMessage={'No Involved Transactions'}
              endpoint={endpoint ?? nullEndpoint}
              columns={accountTxColumns(endpoint ?? nullEndpoint)}
            />
          )}
        </PivotItem>
        <PivotItem headerText="Signed Txs (Staged)">
          {stagedTxsError ? (
            <>
              <ConsoleError>{stagedTxsError}</ConsoleError>
              <p>{stagedTxsError.message}</p>
            </>
          ) : !!endpoint && !stagedTxsLoading && !signedStagedTxs ? (
            <p>Failed to retrieve staged transactions.</p>
          ) : (
            <TransactionList
              loading={!endpoint || stagedTxsLoading}
              transactions={signedStagedTxs ? signedStagedTxs : null}
              notFoundMessage={'No Signed Staged Transactions'}
              endpoint={endpoint ?? nullEndpoint}
              columns={accountTxColumns(endpoint ?? nullEndpoint)}
            />
          )}
        </PivotItem>
        <PivotItem headerText="Involved Txs (Staged)">
          {stagedTxsError ? (
            <>
              <ConsoleError>{stagedTxsError}</ConsoleError>
              <p>{stagedTxsError.message}</p>
            </>
          ) : !!endpoint && !stagedTxsLoading && !involvedStagedTxs ? (
            <p>Failed to retrieve staged transactions.</p>
          ) : (
            <TransactionList
              loading={!endpoint || stagedTxsLoading}
              transactions={involvedStagedTxs ? involvedStagedTxs : null}
              notFoundMessage={'No Involved Staged Transactions'}
              endpoint={endpoint ?? nullEndpoint}
              columns={accountTxColumns(endpoint ?? nullEndpoint)}
            />
          )}
        </PivotItem>
      </Pivot>
    </Wrapper>
  );
}

const Ul = styled.ul`
  list-style: none;
  padding: 0;
`;

export { getStaticProps, getStaticPaths };
