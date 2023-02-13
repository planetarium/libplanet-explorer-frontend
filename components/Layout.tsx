import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Encodable, decode, encode } from 'bencodex';
import { ApolloProvider, useApolloClient } from '@apollo/client/react';
import {
  ApolloClient,
  ApolloError,
  ApolloQueryResult,
  InMemoryCache,
} from '@apollo/client';
import styled from '@emotion/styled';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  DirectionalHint,
  Dropdown,
  IDropdownStyles,
  IDropdownOption,
  IRenderFunction,
  Icon,
  NeutralColors,
  Panel,
  PrimaryButton,
  SearchBox,
  TextField,
  TooltipDelay,
  TooltipHost,
  ITextField,
  Pivot,
  PivotItem,
} from '@fluentui/react';
import { createAccount, isValidPrivateKey } from '@planetarium/account-raw';
import { Account, deriveAddress, signTransaction } from '@planetarium/sign';
import { encodeTxMetadata } from '@planetarium/tx';

import { GraphQLEndPoint, GRAPHQL_ENDPOINTS } from 'lib/graphQLEndPoint';
import {
  BlockByIndexQuery,
  BlockByIndexDocument,
  BlockByHashQuery,
  BlockByHashDocument,
  Get9cTransferAssetActionQuery,
  Get9cTransferAssetActionDocument,
  TransactionByIdQuery,
  TransactionByIdDocument,
  CurrencyEnum,
  StageTransaction9cMutation,
  StageTransaction9cDocument,
} from 'src/gql/graphql';
import {
  NextAccountNonceQuery,
  NextAccountNonceDocument,
} from 'src/explorerGql/graphql';

import Wrapper from 'components/Wrapper';
import { CommonPageProps } from 'lib/staticGeneration';
import useEndpoint from 'lib/useEndpoint';
import useQueryItemId from 'lib/useQueryItemId';

export default function Layout({
  children,
  staticEndpoint,
}: CommonPageProps & {
  children: ReactNode;
}) {
  const endpoint = useEndpoint(staticEndpoint);
  const [client, setClient] = useState<ApolloClient<object> | null>(null);
  useEffect(() => {
    if (endpoint) {
      setClient(
        new ApolloClient({
          cache: new InMemoryCache(),
          uri: endpoint?.uri,
        })
      );
    }
  }, [endpoint]);
  if (endpoint) {
    if (!client) return null;

    return (
      <ApolloProvider client={client}>
        <LayoutContainer>
          <NavBar endpoint={endpoint} />
          <Wrapper>{children}</Wrapper>
        </LayoutContainer>
      </ApolloProvider>
    );
  } else {
    // redirect to the first endpoint
    return <LayoutContainer>{children}</LayoutContainer>;
  }
}

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 120 },
};

function handleSearchError(error: ApolloError, ignore: Array<string> = []) {
  if (
    !error.graphQLErrors.some(error => {
      const { code } = error.extensions;
      return !code || !ignore.includes(code as string);
    })
  ) {
    return { data: null, error: false };
  }
  if (error.networkError) {
    alert(
      'An network error has occured and the error object has been recorded on the console.'
    );
  } else
    alert(
      'An error has occured and the error object has been recorded on the console.'
    );
  console.dir(error);
  return { data: null, error: true };
}

export function NavBar({ endpoint }: { endpoint: GraphQLEndPoint }) {
  const client = useApolloClient();
  const { push } = useRouter();
  const [searchBoxValue, setSearchBoxValue] = useState('');
  const itemId = useQueryItemId();
  const [keyMap, setKeyMap] = useState(new Map<string, string>());
  const [signPanelOpen, setSignPanelOpen] = useState(false);
  useEffect(() => {
    setSearchBoxValue(itemId ?? '');
  }, [itemId]);
  const onSearch = async (value: string) => {
    value = value.trim();
    if (value == itemId) {
      return;
    }
    if (value.match(/^[0-9a-fA-F]{64}$/)) {
      const { data, error } = await client
        .query<BlockByHashQuery>({
          query: BlockByHashDocument,
          variables: { hash: value },
        })
        .catch(e => handleSearchError(e, ['KEY_NOT_FOUND']));
      if (error) {
        return;
      }
      if (data?.chainQuery.blockQuery?.block) {
        push(`/${endpoint.name}/block/?${value}`);
        return;
      }
      const { data: txData, error: txError } = await client
        .query<TransactionByIdQuery>({
          query: TransactionByIdDocument,
          variables: { id: value },
        })
        .catch(e => handleSearchError(e, ['KEY_NOT_FOUND']));
      if (txError) {
        return;
      }
      if (txData?.chainQuery.transactionQuery?.transaction) {
        push(`/${endpoint.name}/transaction/?${value}`);
        return;
      }
      alert('There are no blocks or transactions with the given hash.');
    } else if (value.match(/^0x[0-9a-fA-F]{40}$/)) {
      push(`/${endpoint.name}/account/?${value}`);
    } else if (value.match(/^[0-9]+$/)) {
      try {
        const { data, error } = await client
          .query<BlockByIndexQuery>({
            query: BlockByIndexDocument,
            variables: { index: value },
          })
          .catch(e => handleSearchError(e, ['ARGUMENT_OUT_OF_RANGE']));
        if (error) {
          return;
        }
        const hash = data?.chainQuery.blockQuery?.block?.hash;
        if (hash) {
          push(`/${endpoint.name}/block/?${hash}`);
        } else {
          alert('No such block available.');
        }
      } catch (ApolloError) {
        alert('No such block available.');
      }
    } else {
      alert('Invalid search string.');
    }
  };

  const options: IDropdownOption[] = GRAPHQL_ENDPOINTS.map(endpoint => {
    return {
      key: endpoint.name,
      text: endpoint.name,
      data: {
        icon: 'InternetSharing',
        uri: endpoint.uri,
      },
    };
  });

  const _onRenderTitle: IRenderFunction<IDropdownOption[]> = (
    props?: IDropdownOption[]
  ): JSX.Element => {
    if (!props) return <></>;
    const option = props[0];
    return (
      <TooltipHost
        tooltipProps={{
          onRenderContent: () => <div>{option.data.uri}</div>,
        }}
        delay={TooltipDelay.zero}
        directionalHint={DirectionalHint.bottomCenter}
      >
        <div>
          {option.data && option.data.icon && (
            <Icon
              style={{ marginRight: '8px' }}
              iconName={option.data.icon}
              aria-hidden="true"
              title={option.data.icon}
            />
          )}
          <span>{option.text}</span>
        </div>
      </TooltipHost>
    );
  };

  return (
    <StyledNav>
      <NavWrapper>
        <LogoLink href={`/${endpoint.name}/`}>
          <LogoImg src="/logo.svg" />
        </LogoLink>
        <NavSearchBox
          placeholder="Block Hash / Block Index / TxID / Address starting with 0x"
          onChange={e => {
            if (e) {
              setSearchBoxValue(e.target.value);
            }
          }}
          onSearch={onSearch}
          value={searchBoxValue}
        />
        <NetworkNameContainer>
          <Dropdown
            placeholder="Select an endpoint"
            defaultSelectedKey={endpoint.name}
            options={options}
            onRenderTitle={_onRenderTitle}
            onChange={(_, option) => {
              if (option) {
                push(`/${option.key}/`);
              }
            }}
            styles={dropdownStyles}
          />
        </NetworkNameContainer>
        <Icon
          iconName={
            keyMap.get(endpoint.uri) === undefined
              ? 'AzureKeyVault'
              : 'InsertSignatureLine'
          }
          style={{ color: 'white', fontSize: '1.5rem', margin: '0.5rem' }}
          onClick={() => setSignPanelOpen(true)}
        />
        <Panel
          isOpen={signPanelOpen}
          onDismiss={() => setSignPanelOpen(false)}
          isHiddenOnDismiss={true}
          isBlocking={false}
        >
          <KeyPanel
            endpoint={endpoint}
            nineChroniclesApolloClient={client}
            keyMap={keyMap}
            setKeyMap={setKeyMap}
          />
        </Panel>
      </NavWrapper>
    </StyledNav>
  );
}

function KeyPanel({
  endpoint,
  nineChroniclesApolloClient,
  keyMap,
  setKeyMap,
}: {
  endpoint: GraphQLEndPoint;
  nineChroniclesApolloClient: ApolloClient<object> /* FIXME: swap with explorer client */;
  keyMap: Map<string, string>;
  setKeyMap: (
    value:
      | Map<string, string>
      | ((prev: Map<string, string>) => Map<string, string>)
  ) => void;
}) {
  const keyFieldRef = useRef<ITextField>(null);
  const recipientFieldRef = useRef<ITextField>(null);
  const amountFieldRef = useRef<ITextField>(null);
  const memoFieldRef = useRef<ITextField>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    Object.values(CurrencyEnum)[0]
  );
  const [transferConfirmationDialogOpen, setTransferConfirmationDialogOpen] =
    useState(false);
  const explorerApolloClient = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        uri: endpoint.uri + '/explorer',
      }),
    [endpoint]
  ); /* FIXME: swap with 9c client */
  const key = useMemo(() => keyMap.get(endpoint.uri), [keyMap, endpoint]);
  const account = useMemo(() => (key ? createAccount(key) : undefined), [key]);
  const [signer, setSigner] = useState<string>();
  const [signerBuffer, setSignerBuffer] = useState<Buffer>();
  const { push } = useRouter();
  useEffect(() => {
    async function getSigner() {
      const signer = account ? await deriveAddress(account) : undefined;
      setSigner(signer);
      setSignerBuffer(
        signer ? Buffer.from(signer!.slice(2), 'hex') : undefined
      );
    }
    getSigner();
  }, [account]);
  const [genesisHash, setGenesisHash] = useState<Buffer>();
  async function getGenesisHash() {
    const { data, error } = (await nineChroniclesApolloClient
      .query<BlockByIndexQuery>({
        query: BlockByIndexDocument,
        variables: { index: 0 },
      })
      .catch(e => alert(e.message))) as ApolloQueryResult<BlockByIndexQuery>;
    if (error) {
      console.log(error);
      return;
    }
    setGenesisHash(Buffer.from(data.chainQuery.blockQuery!.block!.hash, 'hex'));
  }
  useEffect(() => {
    getGenesisHash();
  }, [endpoint]);
  if (key === undefined) {
    return (
      <>
        <TextField componentRef={keyFieldRef} />
        <DefaultButton
          text="Load key"
          onClick={() => {
            try {
              if (isValidPrivateKey(keyFieldRef.current?.value ?? '')) {
                setKeyMap(keyMap =>
                  new Map(keyMap).set(
                    endpoint!.uri,
                    keyFieldRef.current?.value ?? ''
                  )
                );
              } else {
                alert('Not a valid private key.');
              }
            } catch (e: any) {
              alert(e.message);
            }
          }}
        />
      </>
    );
  }
  return (
    <>
      Account{' '}
      <b>
        {signer?.slice(0, 10)} ... {signer?.slice(32)}
      </b>
      <Pivot>
        <PivotItem headerText="Transfer">
          <Pivot>
            <PivotItem headerText="9c">
              <TextField label="Recipient" componentRef={recipientFieldRef} />
              <TextField
                label="Amount"
                componentRef={amountFieldRef}
                style={{ textAlign: 'right' }}
                onRenderSuffix={() => (
                  <Dropdown
                    options={Object.values(CurrencyEnum).map(item => ({
                      key: item,
                      text: item,
                    }))}
                    onChange={(_, option) =>
                      setSelectedCurrency(
                        (option as IDropdownOption).key as string
                      )
                    }
                    selectedKey={selectedCurrency}
                    styles={{
                      title: {
                        border: 0,
                        backgroundColor: 'transparent',
                      },
                    }}
                  />
                )}
              />
              <TextField label="Memo" componentRef={memoFieldRef} />
              <DefaultButton
                text="Send"
                onClick={() => setTransferConfirmationDialogOpen(true)}
              />
            </PivotItem>
          </Pivot>
          <Dialog
            hidden={!transferConfirmationDialogOpen}
            onDismiss={() => setTransferConfirmationDialogOpen(false)}
            dialogContentProps={{
              type: DialogType.normal,
              title: 'Confirm Transfer',
            }}
          >
            Transfer <b>{amountFieldRef.current?.value} NCG</b> to{' '}
            <b>{recipientFieldRef.current?.value}</b> with{' '}
            {memoFieldRef.current?.value ? (
              <>
                the memo{' '}
                <span
                  style={{
                    backgroundColor: 'lightgray',
                    color: 'indianred',
                    padding: '0 0.25rem',
                    borderRadius: '0.25rem',
                  }}
                >
                  {memoFieldRef.current?.value}
                </span>
              </>
            ) : (
              <>
                <b>no</b> memo
              </>
            )}
            ?
            <DialogFooter>
              <DefaultButton
                onClick={async () => {
                  const { data, error } = (await nineChroniclesApolloClient
                    .query<Get9cTransferAssetActionQuery>({
                      query: Get9cTransferAssetActionDocument,
                      variables: {
                        sender: signer,
                        recipient: recipientFieldRef.current?.value,
                        amount: amountFieldRef.current?.value,
                        currency: selectedCurrency,
                        memo: memoFieldRef.current?.value,
                      },
                    })
                    .catch(e =>
                      alert(e.message)
                    )) as ApolloQueryResult<Get9cTransferAssetActionQuery>;
                  if (error) {
                    console.log(error);
                    setTransferConfirmationDialogOpen(false);
                    alert(
                      'Error retrieving 9c transferAsset action payload. Consult log for further information.'
                    );
                    return;
                  }
                  const { data: nonceData, error: nonceError } =
                    (await explorerApolloClient
                      .query<NextAccountNonceQuery>({
                        query: NextAccountNonceDocument,
                        variables: {
                          address: signer,
                        },
                      })
                      .catch(e =>
                        alert(e.message)
                      )) as ApolloQueryResult<NextAccountNonceQuery>;
                  if (nonceError) {
                    console.log(nonceError);
                    setTransferConfirmationDialogOpen(false);
                    alert(
                      'Error retrieving nonce. Consult log for further information.'
                    );
                    return;
                  }
                  if (!genesisHash) {
                    await getGenesisHash();
                  }
                  if (!genesisHash) {
                    setTransferConfirmationDialogOpen(false);
                    alert(
                      'Error retrieving genesis hash. Consult log for further information.'
                    );
                    return;
                  }

                  const metadata: Encodable = encodeTxMetadata({
                    nonce: BigInt(nonceData.transactionQuery?.nextNonce),
                    publicKey: (await account!.getPublicKey()) as Uint8Array,
                    signer: signerBuffer as Buffer,
                    timestamp: new Date(),
                    updatedAddresses:
                      signer !== recipientFieldRef.current!.value
                        ? new Set([
                            signerBuffer as Buffer,
                            Buffer.from(
                              recipientFieldRef.current!.value!.startsWith('0x')
                                ? recipientFieldRef.current!.value!.slice(2)
                                : recipientFieldRef.current!.value!,
                              'hex'
                            ),
                          ])
                        : new Set([signerBuffer as Buffer]),
                    genesisHash: genesisHash,
                  });
                  metadata.set(Buffer.from([0x61]), [
                    decode(Buffer.from(data!.actionQuery.transferAsset, 'hex')),
                  ]);

                  const { data: stageData, error: stageError } =
                    (await nineChroniclesApolloClient
                      .mutate<StageTransaction9cMutation>({
                        mutation: StageTransaction9cDocument,
                        variables: {
                          payload: await signTransaction(
                            encode(metadata).toString('hex'),
                            account as Account
                          ),
                        },
                      })
                      .catch(e =>
                        alert(e.message)
                      )) as ApolloQueryResult<StageTransaction9cMutation>;
                  if (stageError) {
                    console.log(stageError);
                    setTransferConfirmationDialogOpen(false);
                    alert(
                      'Error staging transaction. Consult log for further information.'
                    );
                    return;
                  }

                  setTransferConfirmationDialogOpen(false);
                  push(
                    `/${endpoint.name}/transaction/?${stageData.stageTransaction}`
                  );
                }}
                text="Send"
              />
              <PrimaryButton
                onClick={() => setTransferConfirmationDialogOpen(false)}
                text="Cancel"
              />
            </DialogFooter>
          </Dialog>
        </PivotItem>
      </Pivot>
    </>
  );
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  font-family: 'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI',
    -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif;
  background-color: ${NeutralColors.gray10};
`;
const NavWrapper = styled(Wrapper)`
  padding: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
const LogoLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const LogoImg = styled.img`
  height: 48px;
`;
const NavSearchBox = styled(SearchBox)`
  flex: 1;
`;
const NetworkNameContainer = styled.div`
  margin-left: 10px;
`;
const StyledNav = styled.nav`
  background-color: ${NeutralColors.gray190};
`;
