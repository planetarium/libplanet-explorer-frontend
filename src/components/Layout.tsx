import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ApolloProvider, useApolloClient } from 'react-apollo';
import ApolloClient from 'apollo-boost';
import { Icon, SearchBox } from '@fluentui/react';
import {
  TooltipHost,
  TooltipDelay,
  DirectionalHint,
} from '@fluentui/react/lib/Tooltip';
import {
  Dropdown,
  IDropdownStyles,
  IDropdownOption,
} from '@fluentui/react/lib/Dropdown';

import { GraphQLEndPoint, GRAPHQL_ENDPOINTS } from '../misc/graphQLEndPoint';
import {
  BlockByIndexQuery,
  BlockByIndexDocument,
} from '../generated/graphql';

import logo from '../static/img/logo.svg';

import Wrapper from './Wrapper';
import { navigate } from 'gatsby-link';

interface LayoutProps {
  children: React.ReactNode;
  pageContext: { endpoint: GraphQLEndPoint };
}
const Layout: React.FC<LayoutProps> = ({ children, pageContext }) => {
  if (pageContext.endpoint) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [client, setClient] = useState<ApolloClient<any> | null>(null);
    useEffect(() => {
      setClient(
        new ApolloClient({
          uri: pageContext.endpoint.uri,
        })
      );
    }, [setClient, pageContext]);
    if (!client) return null;

    return (
      <ApolloProvider client={client}>
        <LayoutContainer className="ms-bgColor-gray10">
          <NavBar
            className="ms-bgColor-gray190"
            endpoint={pageContext.endpoint}
          />
          <Wrapper>{children}</Wrapper>
        </LayoutContainer>
      </ApolloProvider>
    );
  } else {
    // redirect to the first endpoint
    return (
      <LayoutContainer className="ms-bgColor-gray10">
        {children}
      </LayoutContainer>
    );
  }
};

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 120 },
};

export default Layout;

interface NavBarProps {
  className?: string;
  endpoint: GraphQLEndPoint;
}
export const NavBar: React.FC<NavBarProps> = ({ className, endpoint }) => {
  const client = useApolloClient();
  const onSearch = async (value: string) => {
    value = value.trim();
    if (value.match(/^[0-9a-fA-F]{64}$/)) {
      navigate(`/${endpoint.name}/search/?${value}`);
    } else if (value.match(/^0x[0-9a-fA-F]{40}$/)) {
      navigate(`/${endpoint.name}/account/?${value}`);
    } else if (value.match(/^[0-9]+$/)) {
      try {
        const data = await client.query<BlockByIndexQuery>({
          query: BlockByIndexDocument,
          variables: {index: value},
        })
        const hash = data.data.chainQuery.blockQuery
          && data.data.chainQuery.blockQuery.block
          && data.data.chainQuery.blockQuery.block.hash
          ? data.data.chainQuery.blockQuery.block.hash
          : null;
        if (hash)
        {
          navigate(`/${endpoint.name}/block/?${hash}`);
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

  const _onRenderTitle = (options: IDropdownOption[]): JSX.Element => {
    const option = options[0];

    return (
      <TooltipHost
        tooltipProps={{
          onRenderContent: () => <div>{option.data.uri}</div>,
        }}
        delay={TooltipDelay.zero}
        directionalHint={DirectionalHint.bottomCenter}>
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
    <nav className={className}>
      <NavWrapper>
        <LogoLink href={`/${endpoint.name}/`}>
          <LogoImg src={logo} />
        </LogoLink>
        <NavSearchBox placeholder="Block Hash / Block Index / TxID / Address starting with 0x" onSearch={onSearch} />
        <NetworkNameContainer>
          <Dropdown
            placeholder="Select an endpoint"
            defaultSelectedKey={endpoint.name}
            options={options}
            // @ts-ignore
            onRenderTitle={_onRenderTitle}
            onChanged={item => {
              navigate(`/${item.key}/`);
            }}
            styles={dropdownStyles}
          />
        </NetworkNameContainer>
      </NavWrapper>
    </nav>
  );
};

const LayoutContainer = styled.div`
  min-height: 100vh;
  font-family: 'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI',
    -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif;
`;
const NavWrapper = styled(Wrapper)`
  padding: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
const LogoLink = styled.a`
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
