const path = require('path');

module.exports = {
    entry: {
        background: './src/background.ts',
        content: './src/content.ts',
        modal: './src/modal.ts',
        inject: './src/inject.ts',
        'clipboard-helpers/clipboard-helper': './src/clipboard-helpers/clipboard-helper.ts',
        'clipboard-helpers/clipboard-access-helper': './src/clipboard-helpers/clipboard-access-helper.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
};