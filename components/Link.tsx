import NextLink from 'next/link';
import { ILinkProps, Link as FluentUILink } from '@fluentui/react';

export default function Link(props: ILinkProps) {
  return <FluentUILink as={NextLink} {...props} />;
}
