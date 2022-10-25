module.exports = {
    resolve: {
        fallback: {
            assert: require.resolve('assert'),
            crypto: require.resolve('crypto-browserify'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            zlib: require.resolve("browserify-zlib"),
            stream: require.resolve('stream-browserify'),
        },
    },
};
