export default {
    optionalNonNegativeNumber(name) {
        return (value) => (
            !value ||
            (
                typeof value === 'number' &&
                value >= 0
            ) ||
            `${name} must either be empty or non-negative`
        );
    },
    requiredNonNegativeNumber(name) {
        return (value) => (
            (
                value &&
                typeof value === 'number' &&
                value >= 0
            ) ||
            `${name} is required and must be non-negative`
        );
    },
    requiredString(name) {
        return (value) => (
            (
                value &&
                !(/^\s*$/).test(value)
            ) ||
            `${name} is required`
        );
    }
};
