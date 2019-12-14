import React from 'react';
import useQueryString from '../misc/useQueryString';
import { navigate } from 'gatsby-link';
import { Link } from 'office-ui-fabric-react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from 'office-ui-fabric-react/lib/DetailsList';
import Wrapper from '../components/Wrapper';
import {
  Transaction,
  TransactionsByAccountComponent,
} from '../generated/graphql';

interface AccountPageProps {
  location: Location;
}

const AccountPage: React.FC<AccountPageProps> = ({ location }) => {
  const [queryString, setQueryString] = useQueryString(location);
  return (
    <Wrapper>
      <h1>{`Account Details`}</h1>
      <p>
        Account Number: <b>{queryString}</b>
      </p>

      <TransactionsByAccountComponent
        variables={{ involvedAddress: queryString }}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading&hellip;</p>;
          if (error) return <p>error!</p>;
          const { transactions } = data!.transactionQuery!;
          if (!transactions) {
            return <p>There are no transactions.</p>;
          }

          const signedTransactions: Transaction[] = [],
            involvedTransactions: Transaction[] = [];
          transactions.forEach(tx => {
            if (tx.signer === queryString) {
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

          const numOfSigned = signedTransactions.length;
          const numOfInvolved = involvedTransactions.length;
          const numOfMissingNonces = missingNonces.length;

          return (
            <>
              <h2>Signed Transactions: {numOfSigned}</h2>
              {numOfSigned > 0 ? (
                <TransactionsList
                  transactions={
                    loading
                      ? []
                      : (signedTransactions as NonNullable<Transaction[]>)
                  }
                />
              ) : (
                <div>No transactions of this type</div>
              )}
              <h2>Involved Transactions: {numOfInvolved}</h2>
              {numOfInvolved ? (
                <TransactionsList
                  transactions={
                    loading
                      ? []
                      : (involvedTransactions as NonNullable<Transaction[]>)
                  }
                />
              ) : (
                <div>No transactions of this type</div>
              )}
              <h2>Missing Nonces: {numOfMissingNonces}</h2>
              {numOfMissingNonces ? (
                missingNonces.map(nonce => <p>{nonce}</p>)
              ) : (
                <div>No missing nonces.</div>
              )}
            </>
          );
        }}
      </TransactionsByAccountComponent>
    </Wrapper>
  );
};

interface TxListProps {
  transactions: Pick<
    Transaction,
    'id' | 'nonce' | 'signature' | 'signer' | 'timestamp'
  >[];
}

const TransactionsList: React.FC<TxListProps> = ({ transactions }) => {
  const columns: IColumn[] = [
    {
      key: 'coulmnNonce',
      name: 'Nonce',
      fieldName: 'nonce',
      minWidth: 5,
      maxWidth: 50,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
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
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'number',
      isPadded: true,
      // FIXME: We'd better to use absolute paths and make Gatsby automatically
      // to rebase these absolute paths on the PATH_PREFIX configuration.
      onRender: ({ id }) => <Link href={`../transaction/?${id}`}>{id}</Link>,
    },
    {
      key: 'columnSignature',
      name: 'Signature',
      fieldName: 'signature',
      minWidth: 100,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
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
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'number',
      isPadded: true,
      onRender: ({ signer }) => (
        // FIXME: We'd better to use absolute paths and make Gatsby automatically
        // to rebase these absolute paths on the PATH_PREFIX configuration.
        <Link href={`./?${signer}`}>{signer}</Link>
      ),
    },
    {
      key: 'columnTimestamp',
      name: 'Timestamp',
      fieldName: 'timestamp',
      minWidth: 100,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'number',
      isPadded: true,
    },
  ];

  return (
    <DetailsList
      items={transactions}
      columns={columns}
      selectionMode={SelectionMode.none}
      getKey={tx => tx.id}
      setKey="set"
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
      // FIXME: We'd better to use absolute paths and make Gatsby automatically
      // to rebase these absolute paths on the PATH_PREFIX configuration.
      onItemInvoked={({ id }) => navigate(`../transaction/?${id}`)}
    />
  );
};

export default AccountPage;
