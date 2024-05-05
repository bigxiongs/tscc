const commands = (): (boolean | string[])[] => {
  let args = process.argv.slice(2);
  if (!args.length) help();
  let options = ""
  if (args[0].startsWith("-")) {
    options = args[0].slice(1)
    args = args.slice(1)
  }
  if (options.includes("h")) return help()
  else return [args, options.includes("l"), options.includes("p")];
};

const help = () => {
  console.log(
    "The tscc compiler. Copyright (C) 2013-, SSE of USTC.\n" +
    "Usage: tscc [options] <filename>\n\n"+
    "Available options:\n"+
    "\t-l     dump tokens from lexical analysis\n"+
    "\t-p     dump ast nodes from parsing\n"+
    "\t-h  show this help information"
  );
  process.exit(1);
};

export { commands };
