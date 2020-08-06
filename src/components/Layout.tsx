import React, { useEffect, useState } from 'react';
import { css, cx } from 'emotion';
import styled from '@emotion/styled';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';
import { Icon, Label, SearchBox, IRenderFunction } from '@fluentui/react';
import {
  TooltipHost,
  TooltipDelay,
  DirectionalHint,
} from '@fluentui/react/lib/Tooltip';
import {
  Dropdown,
  DropdownMenuItemType,
  IDropdownStyles,
  IDropdownOption,
} from '@fluentui/react/lib/Dropdown';
import { getId } from '@fluentui/react/lib/Utilities';

import { GraphQLEndPoint, GRAPHQL_ENDPOINTS } from '../misc/graphQLEndPoint';

const logo = require('../static/img/logo.svg');

import Wrapper from './Wrapper';
import { navigate } from 'gatsby-link';

interface LayoutProps {
  children: React.ReactNode;
  pageContext: { endpoint: GraphQLEndPoint };
}
const Layout: React.FC<LayoutProps> = ({ children, pageContext }) => {
  if (pageContext.endpoint) {
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
  const hostId = getId('tooltipHost');
  const onSearch = (value: string) => {
    if (value.match(/^[0-9a-fA-F]{64}$/)) {
      navigate(`/search/?${value}`);
    } else {
      alert('Wrong hash!');
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
        <NavSearchBox placeholder="Block Hash / TxID" onSearch={onSearch} />
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
const NetworkNameIcon = styled(Icon)`
  margin-right: 5px;
`;
