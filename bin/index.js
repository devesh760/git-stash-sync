#!/usr/bin/env node

const stashBackup = require("../src/stashBackup");
const stashRestore = require("../src/stashRestore");

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "init") {
    console.log("Initializing stash sync...");
    await stashRestore();
  } else if (args[0] === "backup") {
    console.log("Backing up stashes as a compressed tar archive...");
    await stashBackup();
  } else if (args[0] === "track") {
    console.log("Tracking stash changes (alias for backup)...");
    await stashBackup();
  } else {
    console.log("Usage:");
    console.log(
      "  git-stash-sync init   # Restore stashes from the remote tar backup"
    );
    console.log(
      "  git-stash-sync backup # Manually trigger stash backup as a tar archive"
    );
    console.log(
      "  git-stash-sync track  # Start tracking stash changes (alias for backup)"
    );
  }
}

main();
