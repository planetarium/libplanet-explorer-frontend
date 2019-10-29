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
        {children}
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
      navigate(`/block/?${value}`);
    }
    else {
      alert('Wrong block hash!');
    }
  };
  return (
    <nav className={className}>
      <NavWrapper>
        <NavSearchBox placeholder="Block hash" onSearch={onSearch} />
        <NetworkNameContainer>
          <TooltipHost
            tooltipProps={{
              onRenderContent: () => <div>{GRAPHQL_ENDPOINT_URI}</div>,
            }}
            delay={TooltipDelay.zero}
            id={hostId}
            directionalHint={DirectionalHint.bottomCenter}>
            <Label>
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
  padding: 20px;
  display: flex;
  align-items: center;
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
