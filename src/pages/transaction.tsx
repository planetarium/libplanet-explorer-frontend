import React from 'react';
import useQueryString from '../misc/useQueryString';
import { TransactionByIdComponent } from '../generated/graphql';

interface TransactionPageProps {
  location: Location;
}

const TransactionPage: React.FC<TransactionPageProps> = ({ location }) => {
  const [queryString, setQueryString] = useQueryString(location);
  const id = queryString;
  return (
    <TransactionByIdComponent variables={{ id }}>
      {({ data, loading, error }) => {
        if (loading) return <p>loading&hellip;</p>;
        if (error) return <p>error!</p>;
        const { transaction } = data!;
        if (!transaction)
          return (
            <p>
              No such transaction: <code>{id}</code>
            </p>
          );
        return (
          <dl>
            <dt>Id</dt>
            <dd>
              <code>{transaction.id}</code>
            </dd>
            <dt>Nonce</dt>
            <dd>{transaction.nonce} </dd>
            <dt>Public Key</dt>
            <dd>
              <code>{transaction.publicKey}</code>
            </dd>
            <dt>Signature</dt>
            <dd>
              <code>{transaction.signature}</code>
            </dd>
            <dt>Signer</dt>
            <dd>
              <code>{transaction.signer}</code>
            </dd>
            <dt>Timestamp</dt>
            <dd>{transaction.timestamp}</dd>
            <dt>Updated Addresses</dt>
            {
              transaction.updatedAddresses.map(
                address => <dd><code>{address}</code></dd>
              )
            }
          </dl>
        );
      }}
    </TransactionByIdComponent>
  );
};

export default TransactionPage;
