import { DateTime } from 'luxon';

export default {
    filters: {
        dateTimeFormat(value, format = 'yyyy-MM-dd HH:mm:ss') {
            const dateTime = DateTime.fromISO(value);

            return dateTime.isValid ? dateTime.toFormat(format) : '';
        },
        numberFormat(value, precision) {
            return typeof value === 'number' ? value.toFixed(precision) : '';
        },
        percentageFormat(value, precision) {
            return typeof value === 'number' ? (value * 100).toFixed(precision) : '';
        }
    }
};
