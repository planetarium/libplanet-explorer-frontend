import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApolloProvider, useApolloClient } from '@apollo/client/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import styled from '@emotion/styled';
import {
  DirectionalHint,
  Dropdown,
  IDropdownStyles,
  IDropdownOption,
  IRenderFunction,
  Icon,
  NeutralColors,
  SearchBox,
  TooltipDelay,
  TooltipHost,
} from '@fluentui/react';

import { GraphQLEndPoint, GRAPHQL_ENDPOINTS } from 'lib/graphQLEndPoint';
import {
  BlockByIndexQuery,
  BlockByIndexDocument,
  BlockByHashQuery,
  BlockByHashDocument,
  TransactionByIdQuery,
  TransactionByIdDocument,
} from 'src/gql/graphql';

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

export function NavBar({ endpoint }: { endpoint: GraphQLEndPoint }) {
  const client = useApolloClient();
  const { push } = useRouter();
  const [searchBoxValue, setSearchBoxValue] = useState('');
  const itemId = useQueryItemId();
  useEffect(() => {
    setSearchBoxValue(itemId ?? '');
  }, [itemId]);
  const onSearch = async (value: string) => {
    value = value.trim();
    if (value.match(/^[0-9a-fA-F]{64}$/)) {
      const data = await client
        .query<BlockByHashQuery>({
          query: BlockByHashDocument,
          variables: { hash: value },
        })
        .catch(() => null);
      if (data?.data.chainQuery.blockQuery?.block) {
        push(`/${endpoint.name}/block/?${value}`);
        return;
      }
      const txData = await client
        .query<TransactionByIdQuery>({
          query: TransactionByIdDocument,
          variables: { id: value },
        })
        .catch(() => null);
      if (txData?.data.chainQuery.transactionQuery?.transaction) {
        push(`/${endpoint.name}/transaction/?${value}`);
        return;
      }
      alert('There are no blocks or transactions with the given hash.');
    } else if (value.match(/^0x[0-9a-fA-F]{40}$/)) {
      push(`/${endpoint.name}/account/?${value}`);
    } else if (value.match(/^[0-9]+$/)) {
      try {
        const data = await client.query<BlockByIndexQuery>({
          query: BlockByIndexDocument,
          variables: { index: value },
        });
        const hash = data.data.chainQuery.blockQuery?.block?.hash;
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
      </NavWrapper>
    </StyledNav>
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
