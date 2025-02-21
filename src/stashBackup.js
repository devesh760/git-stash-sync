const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const tar = require("tar");
const simpleGit = require("simple-git");
const git = simpleGit();

async function stashBackup() {
  try {
    console.log("Backing up stashes as a compressed tar archive...");

    // Get the list of stashes from Git.
    const stashListOutput = execSync("git stash list").toString().trim();
    if (!stashListOutput) {
      console.log("No stashes found to backup.");
      return;
    }

    // Create a temporary directory for the backup files.
    const tmpDir = path.join(os.tmpdir(), "stash_backup");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }
    // Clean the directory.
    fs.readdirSync(tmpDir).forEach((file) =>
      fs.unlinkSync(path.join(tmpDir, file))
    );

    // Save the stash list (optional but useful for reference).
    fs.writeFileSync(path.join(tmpDir, "stash-index.txt"), stashListOutput);

    // Split the list by line; each line represents a stash (e.g., "stash@{0}: WIP on ...")
    const stashEntries = stashListOutput.split("\n");
    for (let i = 0; i < stashEntries.length; i++) {
      // Export the diff (patch) for each stash.
      const patch = execSync(`git stash show -p stash@{${i}}`).toString();
      fs.writeFileSync(path.join(tmpDir, `stash-${i}.patch`), patch);
    }

    // Create a tar.gz archive of the backup directory.
    const tarFile = path.join(os.tmpdir(), "stashes.tar.gz");
    if (fs.existsSync(tarFile)) {
      fs.unlinkSync(tarFile);
    }
    await tar.c(
      {
        gzip: true,
        file: tarFile,
        cwd: tmpDir,
      },
      fs.readdirSync(tmpDir)
    );

    // Use Git plumbing to store the tar file as an object.
    const hash = execSync(`git hash-object -w ${tarFile}`).toString().trim();

    // Determine a custom ref name, for example based on the OS username.
    const username = os.userInfo().username;
    const refName = `refs/stash-backup/${username}`;
    // Update the ref to point to the stored tarball.
    execSync(`git update-ref ${refName} ${hash}`);
    // Push the ref to the remote repository.
    execSync(`git push origin ${refName}`);

    console.log("Pushed stash tar archive to remote ref:", refName);
  } catch (error) {
    console.error("Error backing up stashes:", error);
  }
}

module.exports = stashBackup;
