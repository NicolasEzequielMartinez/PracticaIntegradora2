const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5
    },
    colors: {
        error: 'red bold',
        warn: 'red italic bold',
        info: 'yellow italic bold',
        http: 'green italic',
        verbose: 'blue italic',
        debug: 'cyan dim italic'
    }
};

export default customLevels;