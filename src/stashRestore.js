const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const tar = require("tar");
const simpleGit = require("simple-git");
const git = simpleGit();

async function stashRestore() {
  // a comment
  try {
    console.log("Checking for stash backup...");

    const username = os.userInfo().username;
    const refName = `refs/stash-backup/${username}`;

    // Fetch the remote ref containing the tarball.
    const fetchOutput = execSync(`git fetch origin ${refName}`, {
      encoding: "utf8",
    });
    if (fetchOutput.includes("error") || fetchOutput.includes("fatal")) {
      console.log("No remote stash backup found.");
      return;
    }

    // Retrieve the tar file via the fetched ref.
    const tarFile = path.join(os.tmpdir(), "fetched_stashes.tar.gz");
    const tarData = execSync(`git cat-file blob FETCH_HEAD`);
    fs.writeFileSync(tarFile, tarData);

    // Create a temporary directory for extraction.
    const extractDir = path.join(os.tmpdir(), "stash_restore");
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir);
    }
    // Clean the extraction directory.
    fs.readdirSync(extractDir).forEach((file) =>
      fs.unlinkSync(path.join(extractDir, file))
    );

    // Extract the tar.gz archive.
    await tar.x({
      file: tarFile,
      cwd: extractDir,
    });

    // Check for patch files in the extracted directory.
    const patchFiles = fs
      .readdirSync(extractDir)
      .filter((file) => file.endsWith(".patch"));
    if (patchFiles.length === 0) {
      console.log("No patch files found in backup.");
      return;
    }

    // For each patch file, apply it and then create a stash from the changes.
    for (const patchFile of patchFiles) {
      const fullPath = path.join(extractDir, patchFile);
      // Apply the patch.
      execSync(`git apply ${fullPath}`);
      // Create a stash entry with a message indicating the patch source.
      execSync(`git stash push -m "Restored stash from ${patchFile}"`);
    }

    console.log("Restored stashes from remote tar backup.");
  } catch (error) {
    console.error("Error restoring stashes:", error);
  }
}

module.exports = stashRestore;
