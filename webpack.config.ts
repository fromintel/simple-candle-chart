import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration {
    devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
    mode: "development",
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',  // Injects CSS into the DOM
                    'css-loader',    // Translates CSS into CommonJS modules
                    'sass-loader'    // Compiles Sass to CSS
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.scss']
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'),
        },
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Simple Candle Chart',
            template: 'src/index.html',
        })
    ],
};

export default config;
