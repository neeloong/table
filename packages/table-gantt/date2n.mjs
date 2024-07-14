/**
 * 
 * @param {Date} date 
 * @returns 
 */
export default function date2n(date) {
	return (Number(date) / 1000 / 60 - date.getTimezoneOffset()) / 60 / 24;
}
