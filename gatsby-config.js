require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
  pathPrefix: process.env.PATH_PREFIX,
  plugins: [
    'gatsby-plugin-typescript',
    {
      resolve: 'gatsby-plugin-layout',
      options: {
        component: require.resolve('./src/components/Layout.tsx'),
      },
    },
    'gatsby-plugin-catch-links',
  ],
};
