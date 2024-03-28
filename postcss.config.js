module.exports = {
    plugins: [
        require('autoprefixer')({
            overrideBrowserslist: [
                'Android 4.1',
                'iOS 7.1',
                'Chrome > 31',
                'ff > 31',
                'ie >= 8',
                '> 1%',
            ],
            grid: false,
        }),
        require('postcss-flexbugs-fixes'),
    ],
}
