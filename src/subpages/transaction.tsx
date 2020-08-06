import React from 'react';
import useQueryString from '../misc/useQueryString';
import { TransactionByIdComponent } from '../generated/graphql';
import { Link } from '@fluentui/react';
import Timestamp from '../components/Timestamp';

interface TransactionPageProps {
  location: Location;
}

const TransactionPage: React.FC<TransactionPageProps> = ({ location }) => {
  const [queryString, setQueryString] = useQueryString(location);
  const id = queryString;
  return (
    <TransactionByIdComponent variables={{ id }}>
      {({ data, loading, error }) => {
        if (loading)
          return (
            <>
              <h2>Transaction Details</h2>
              <p>Loading&hellip;</p>
            </>
          );
        if (error)
          return (
            <>
              <h2>Transaction Details</h2>
              <p>
                Failed to load {id} - {JSON.stringify(error.message)}
              </p>
            </>
          );
        const { transaction } = data!.transactionQuery!;
        if (!transaction)
          return (
            <>
              <h2>Transaction Details</h2>
              <p>
                No such transaction: <code>{id}</code>
              </p>
            </>
          );
        // FIXME: We'd better to use absolute paths and make Gatsby to
        // automatically rebase these absolute paths on the PATH_PREFIX
        // configuration.
        const signerLink = `../account/?${transaction.signer}`;
        return (
          <>
            <h2>Transaction Details</h2>
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
                <Link href={signerLink}>
                  <code>{transaction.signer}</code>
                </Link>
              </dd>
              <dt>Timestamp</dt>
              <dd>
                <Timestamp timestamp={transaction.timestamp} />
              </dd>
              <dt>Updated Addresses</dt>
              {transaction.updatedAddresses.map((address, index) => (
                <dd key={index}>
                  {/*
                  FIXME: We'd better to use absolute paths and make Gatsby to
                  automatically rebase these absolute paths on the PATH_PREFIX
                  configuration.
                  */}
                  <Link href={`../account/?${address}`}>
                    <code>{address}</code>
                  </Link>
                </dd>
              ))}
              <dt>Actions</dt>
              {transaction.actions.map((action, index) => (
                <dd key={index}>
                  <dl>
                    {action.arguments.map(argument => (
                      <React.Fragment key={argument.key}>
                        <dt>{argument.key}</dt>
                        <dd>
                          <pre>
                            <code> {JSON.stringify(argument.value, null, 2)} </code>
                          </pre>
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </dd>
              ))}
            </dl>
          </>
        );
      }}
    </TransactionByIdComponent>
  );
};

export default TransactionPage;
