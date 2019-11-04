import React, { useEffect, useState } from 'react';
import { css, cx } from 'emotion';
import styled from '@emotion/styled';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';
import { Icon, Label, SearchBox } from 'office-ui-fabric-react';
import {
  TooltipHost,
  TooltipDelay,
  DirectionalHint,
} from 'office-ui-fabric-react/lib/Tooltip';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
const logo = require('../static/img/logo.svg');

import Wrapper from './Wrapper';
import { navigate } from '@reach/router';

const GRAPHQL_ENDPOINT_URI = process.env.GRAPHQL_ENDPOINT_URI;

interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [client, setClient] = useState<ApolloClient<any> | null>(null);
  useEffect(() => {
    setClient(
      new ApolloClient({
        uri: GRAPHQL_ENDPOINT_URI,
      })
    );
  }, [setClient]);
  if (!client) return null;
  return (
    <ApolloProvider client={client}>
      <LayoutContainer className="ms-bgColor-gray10">
        <NavBar className="ms-bgColor-gray190" />
        <Wrapper>{children}</Wrapper>
      </LayoutContainer>
    </ApolloProvider>
  );
};

export default Layout;

interface NavBarProps {
  className?: string;
}
export const NavBar: React.FC<NavBarProps> = ({ className }) => {
  const hostId = getId('tooltipHost');
  const onSearch = (value: string) => {
    if (value.match(/^[0-9a-fA-F]{64}$/)) {
      navigate(`/search/?${value}`);
    } else {
      alert('Wrong hash!');
    }
  };
  return (
    <nav className={className}>
      <NavWrapper>
        <LogoLink href="/">
          <LogoImg src={logo} />
        </LogoLink>
        <NavSearchBox placeholder="Block Hash / TxID" onSearch={onSearch} />
        <NetworkNameContainer>
          <TooltipHost
            tooltipProps={{
              onRenderContent: () => <div>{GRAPHQL_ENDPOINT_URI}</div>,
            }}
            delay={TooltipDelay.zero}
            id={hostId}
            directionalHint={DirectionalHint.bottomCenter}>
            <Label className="ms-fontColor-gray20">
              <NetworkNameIcon iconName="InternetSharing" />
              {process.env.NETWORK_NAME}
            </Label>
          </TooltipHost>
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
