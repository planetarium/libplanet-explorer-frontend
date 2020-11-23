import React, { useState } from 'react';
import { navigate } from 'gatsby-link';
import { Checkbox } from '@fluentui/react';

import Wrapper from '../components/Wrapper';
import List, { OmitListProps, BlockListProps } from '../components/List';
import OffsetSwitch from '../components/OffsetSwitch';

import {
  Transaction,
  TransactionsByAccountComponent,
  Block,
  BlockListComponent,
  TransactionCommonFragment,
} from '../generated/graphql';

import { IndexPageProps } from '../pages';

import useQueryString from '../misc/useQueryString';
import useOffset, { limit } from '../misc/useOffset';
import { accountMineColumns, txColumns } from '../misc/columns';

import styled from '@emotion/styled';

type AccountPageProps = IndexPageProps;

const Ul = styled.ul`
  list-style: none;
  padding: 0;
`;

const AccountPage: React.FC<AccountPageProps> = ({ location }) => {
  const hash = useQueryString(location)[0].slice(0, 42);

  const [txOffset, txOlderHandler, txNewerHandler] = useOffset(location, 'tx');
  const [mineOffset, mineOlderHandler, mineNewerHandler] = useOffset(
    location,
    'mine'
  );
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  return (
    <Wrapper>
      <h1>Account Details</h1>
      <p>
        Account Number: <b>{hash}</b>
      </p>

      <h2>Transactions count</h2>

      <TransactionsByAccountComponent variables={{ involvedAddress: hash }}>
        {({ data, loading, error }) => {
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }

          if (loading)
            return (
              <Ul>
                <li>Signed Transaction: Loading…</li>
                <li>Involved Transaction: Loading…</li>
                <li>missingNonces: Loading…</li>
              </Ul>
            );

          const transactions =
            data && data.transactionQuery && data.transactionQuery.transactions
              ? data.transactionQuery.transactions
              : null;

          if (transactions === null) throw Error('transactions query failed');

          const {
            signedTransactions,
            involvedTransactions,
            missingNonces,
          } = splitTransactions(transactions, hash);

          return (
            <Ul>
              <li>Signed Transaction: {signedTransactions.length}</li>
              <li>Involved Transaction: {involvedTransactions.length}</li>
              <li>missingNonces: {missingNonces.length}</li>
            </Ul>
          );
        }}
      </TransactionsByAccountComponent>

      <TransactionsByAccountComponent
        variables={{ offset: txOffset, limit, involvedAddress: hash }}>
        {({ data, loading, error }) => {
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }

          if (loading)
            return (
              <>
                <OffsetSwitch disable={{ older: true, newer: true }} />
                <TransactionListWrap loading={true} />
              </>
            );

          const transactions =
            data && data.transactionQuery && data.transactionQuery.transactions
              ? data.transactionQuery.transactions
              : null;

          if (transactions === null) throw Error('transactions query failed');

          const {
            signedTransactions,
            involvedTransactions,
            missingNonces,
          } = splitTransactions(transactions, hash);

          return (
            <>
              <OffsetSwitch
                olderHandler={txOlderHandler}
                newerHandler={txNewerHandler}
                disable={{
                  older: loading || transactions.length < limit,
                  newer: loading || txOffset === 0,
                }}
              />
              <TransactionListWrap
                loading={false}
                signed={signedTransactions}
                involved={involvedTransactions}
                missingNonces={missingNonces}
              />
            </>
          );
        }}
      </TransactionsByAccountComponent>
      <h2>Mined Blocks</h2>
      <BlockListComponent
        variables={{ offset: mineOffset, limit, excludeEmptyTxs, miner: hash }}>
        {({ data, loading, error }) => {
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }
          const blocks =
            data && data.blockQuery && data.blockQuery.blocks
              ? (data.blockQuery.blocks as Block[])
              : null;
          return (
            <>
              <Checkbox
                label="Include blocks having any tx"
                checked={excludeEmptyTxs}
                disabled={loading}
                onChange={() => {
                  setExcludeEmptyTxs(!excludeEmptyTxs);
                }}
              />
              <OffsetSwitch
                olderHandler={mineOlderHandler}
                newerHandler={mineNewerHandler}
                disable={{
                  older: loading || (!!blocks && blocks.length < limit),
                  newer: loading || mineOffset === 0,
                }}
              />
              <BlockList
                blocks={blocks}
                loading={loading}
                columns={accountMineColumns}
              />
            </>
          );
        }}
      </BlockListComponent>
    </Wrapper>
  );
};

export default AccountPage;

interface TransactionListWrapProps {
  signed?: TransactionCommonFragment[];
  involved?: TransactionCommonFragment[];
  missingNonces?: number[];
  loading: boolean;
}

const TransactionListWrap: React.FC<TransactionListWrapProps> = ({
  signed,
  involved,
  missingNonces,
  loading,
}) => (
  <>
    <h2>Signed Transactions{counter(signed)}</h2>
    <TransactionList
      loading={loading}
      transactions={signed ? signed : null}
      notFoundMessage={'No Signed Transactions'}
    />
    <h2>Involved Transactions{counter(involved)}</h2>
    <TransactionList
      loading={loading}
      transactions={involved ? involved : null}
      notFoundMessage={'No Involved Transactions'}
    />
    <h2>Missing Nonces{counter(missingNonces)}</h2>
    {missingNonces ? (
      missingNonces.length > 0 ? (
        missingNonces.map(nonce => <p key={nonce}>{nonce}</p>)
      ) : (
        <div>No missing nonces.</div>
      )
    ) : (
      'Loading…'
    )}
  </>
);

const counter = (items?: unknown[]) =>
  items !== undefined && items.length > 0 && `: ${items.length}`;

interface TransactionListProps
  extends Omit<OmitListProps, 'columns' | 'items'> {
  transactions: TransactionCommonFragment[] | null;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  ...props
}) => (
  <List
    items={transactions}
    {...props}
    columns={txColumns}
    onItemInvoked={block => navigate(`/search/?${block.hash}`)}
  />
);

const BlockList: React.FC<BlockListProps> = ({ blocks, ...props }) => (
  <List
    items={blocks}
    {...props}
    onItemInvoked={(block: Block) => navigate(`/search/?${block.hash}`)}
  />
);

function splitTransactions(
  transactions: TransactionCommonFragment[],
  hash: string
) {
  const signedTransactions: TransactionCommonFragment[] = [],
    involvedTransactions: TransactionCommonFragment[] = [];
  transactions.forEach(tx => {
    if (tx.signer === hash) {
      signedTransactions.push(tx);
    } else {
      involvedTransactions.push(tx);
    }
  });

  const missingNonces: number[] = [];
  for (let i = 1; i < signedTransactions.length; ++i) {
    const prevNonce = signedTransactions[i - 1].nonce;
    const nonce = signedTransactions[i].nonce;
    if (prevNonce === nonce - 1) continue;
    for (
      let missingNonce = prevNonce + 1;
      missingNonce < nonce;
      ++missingNonce
    ) {
      missingNonces.push(missingNonce);
    }
  }
  return { signedTransactions, involvedTransactions, missingNonces };
}
