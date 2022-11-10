import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import Link from 'components/Link';
import { TransactionList } from 'components/List';
import Timestamp from 'components/Timestamp';
import { getEndpointFromQuery, GRAPHQL_ENDPOINTS } from 'lib/graphQLEndPoint';
import { listTxColumns } from 'lib/listColumns';
import {
  CommonPageProps,
  getCommonStaticPaths as getStaticPaths,
  getCommonStaticProps as getStaticProps,
} from 'lib/staticGeneration';
import useIdFromQuery from 'lib/useIdFromQuery';
import useSearchParams from 'lib/useSearchParams';

import {
  Block,
  BlockByHashDocument,
  BlockByHashQuery,
  Transaction,
} from 'src/gql/graphql';

export default function BlockPage({ staticEndpoint }: CommonPageProps) {
  const [pageContent, setPageContent] = useState<JSX.Element>(<></>);

  const [endpoint, setEndpoint] = useState(staticEndpoint);
  const { isReady, asPath } = useRouter();
  const [query] = useSearchParams(asPath);
  const hash = useIdFromQuery(query);
  const { loading, error, data } = useQuery<BlockByHashQuery>(
    BlockByHashDocument,
    {
      variables: { hash },
      skip: !endpoint,
    }
  );
  useEffect(() => {
    if (!endpoint && isReady) {
      setEndpoint(getEndpointFromQuery(query) ?? GRAPHQL_ENDPOINTS[0]);
    }
  }, [endpoint, isReady, query]);
  useEffect(() => {
    if (!endpoint || loading) {
      setPageContent(<p>Loading&hellip;</p>);
      return;
    }
    if (error) {
      setPageContent(
        <p>
          Failed to load {hash} - {JSON.stringify(error.message)}
        </p>
      );
      return;
    }
    const block = data?.chainQuery.blockQuery?.block as Block;
    if (!block) {
      setPageContent(
        <p>
          No such block: <code>{hash}</code>
        </p>
      );
      return;
    }

    setPageContent(
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
    );
  }, [data?.chainQuery.blockQuery?.block, endpoint, error, hash, loading]);
  return (
    <>
      <h2>Block Details</h2>
      {pageContent}
    </>
  );
}

export { getStaticProps, getStaticPaths };
