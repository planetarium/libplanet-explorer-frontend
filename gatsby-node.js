const path = require('path');
const GRAPHQL_ENDPOINTS = JSON.parse(process.env.GRAPHQL_ENDPOINTS);

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  const files = [
    { name: 'list.tsx', path: '' },
    { name: 'account.tsx', path: 'account' },
    { name: 'block.tsx', path: 'block' },
    { name: 'search.tsx', path: 'search' },
    { name: 'transaction.tsx', path: 'transaction' },
  ];

  GRAPHQL_ENDPOINTS.forEach(endpoint => {
    files.forEach(file => {
      createPage({
        path: `${endpoint.name}/${file.path}`,
        component: path.resolve(`src/subpages/${file.name}`),
        isPermanent: true,
        context: {
          endpoint,
        },
      });
    });
  });
};
