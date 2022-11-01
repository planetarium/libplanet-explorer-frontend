import * as React from 'react';
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { Stylesheet, resetIds } from '@fluentui/react';

const stylesheet = Stylesheet.getInstance();

// Set up the document, and reset the stylesheet.
export default class FluentUIDocument extends Document<FluentUIDocumentInitialProps> {
  static async getInitialProps(ctx: DocumentContext) {
    resetIds();

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styleTags: stylesheet.getRules(true),
      serializedStylesheet: stylesheet.serialize(),
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            type="text/css"
            dangerouslySetInnerHTML={{ __html: this.props.styleTags }}
          />
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
            window.FabricConfig = window.FabricConfig || {};
            window.FabricConfig.serializedStylesheet = ${this.props.serializedStylesheet};
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

interface FluentUIDocumentInitialProps extends DocumentInitialProps {
  styleTags: string;
  serializedStylesheet: string;
}
