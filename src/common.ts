const reducer = (composed: Function, func: Function) => (...args: any) => composed(func(...args))
export const compose = (...funcs: Function[]) => funcs.length == 1 ? funcs[0] : funcs.reduce(reducer)

export const noop = () => {}

