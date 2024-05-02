const commands = () => {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("Expected a path to a TS file as the argument");
    process.exit(1);
  }
  return args;
};

export { commands };
