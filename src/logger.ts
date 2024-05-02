const title = (str: string) => console.log('\x1b[1m%s\x1b[0m', str);
const log = console.log
const logger = { title, log }

export { logger }
