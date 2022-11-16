import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import Link from 'components/Link';
import { TransactionList } from 'components/List';
import Timestamp from 'components/Timestamp';
import { listTxColumns } from 'lib/listColumns';
import {
  CommonPageProps,
  getCommonStaticPaths as getStaticPaths,
  getCommonStaticProps as getStaticProps,
} from 'lib/staticGeneration';
import useEndpoint from 'lib/useEndpoint';
import useQueryItemId from 'lib/useQueryItemId';

import {
  Block,
  BlockByHashDocument,
  BlockByHashQuery,
  Transaction,
} from 'src/gql/graphql';

export default function BlockPage({ staticEndpoint }: CommonPageProps) {
  const endpoint = useEndpoint(staticEndpoint);
  const hash = useQueryItemId();
  const { loading, error, data } = useQuery<BlockByHashQuery>(
    BlockByHashDocument,
    {
      variables: { hash },
      skip: !(endpoint && hash),
    }
  );
  const block = useMemo(
    () =>
      (!!endpoint && !loading && !error
        ? (data?.chainQuery.blockQuery?.block as Block) ?? null
        : null) as Block,
    [data?.chainQuery.blockQuery?.block, endpoint, error, loading]
  );
  return (
    <>
      <h2>Block Details</h2>
      {error ? (
        <p>
          Failed to load {hash} - {JSON.stringify(error.message)}
        </p>
      ) : !endpoint || loading ? (
        <p>Loading&hellip;</p>
      ) : !block ? (
        <p>
          No such block: <code>{hash}</code>
        </p>
      ) : (
        <>
          <dl>
            <dt>Index</dt>
            <dd>{block.index}</dd>
            <dt>Hash</dt>
            <dd>
              <code>{block.hash}</code>
            </dd>
            <dt>Nonce</dt>
            <dd>
              <code>{block.nonce}</code>
            </dd>
            <dt>Miner</dt>
            <dd>
              <Link href={`/${endpoint.name}/account/?${block.miner}`}>
                <code>{block.miner}</code>
              </Link>
            </dd>
            <dt>Timestamp</dt>
            <dd>
              <Timestamp timestamp={block.timestamp} />
            </dd>
            <dt>State Root Hash</dt>
            <dd>
              <code>{block.stateRootHash}</code>
            </dd>
            <dt>Previous hash</dt>
            <dd>
              {block.previousBlock ? (
                <Link
                  href={`/${endpoint.name}/block/?${block.previousBlock.hash}`}
                >
                  <code>{block.previousBlock.hash}</code>
                </Link>
              ) : (
                'N/A'
              )}
            </dd>
            <dt>Difficulty</dt>
            <dd>{block.difficulty}</dd>
            <dt>Total Difficulty</dt>
            <dd>{block.totalDifficulty.toString()}</dd>
            <dt>Transactions</dt>
            {block.transactions.length > 0 ? (
              <TransactionList
                transactions={block.transactions as NonNullable<Transaction[]>}
                endpoint={endpoint}
                loading={loading}
                columns={listTxColumns(endpoint)}
              />
            ) : (
              <dd>
                <i>There is no transactions in this block.</i>
              </dd>
            )}
          </dl>
        </>
      )}
    </>
  );
}

export { getStaticProps, getStaticPaths };
