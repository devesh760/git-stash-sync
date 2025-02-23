#!/usr/bin/env node

const { Command } = require("commander");
const stashBackup = require("../src/stashBackup");
const stashRestore = require("../src/stashRestore");

const program = new Command();

program
  .name("git-stash-sync")
  .description("A CLI tool to backup and restore Git stashes")
  .version("1.0.0", "-v, --version", "Output the current version");

program
  .command("init")
  .description("Restore stashes from the remote tar backup")
  .action(async () => {
    console.log("Initializing stash sync...");
    await stashRestore();
  });

program
  .command("backup")
  .description("Manually trigger stash backup as a tar archive")
  .action(async () => {
    console.log("Backing up stashes...");
    await stashBackup();
  });

program.parse(process.argv);
