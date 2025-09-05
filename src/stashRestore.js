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
    console.log("Restoring stashes...");
    console.log("Checking for stash backup...");

    const username = os.userInfo().username;
    const refName = `refs/stash-backup/${username}`;

    // Fetch the remote ref containing the tarball, if 'origin' exists.
    try {
      const remotes = execSync("git remote", { encoding: "utf8" })
        .toString()
        .split(/\s+/)
        .filter(Boolean);
      if (remotes.includes("origin")) {
        execSync(`git fetch origin ${refName}`, { encoding: "utf8" });
      } else {
        console.log("No remote 'origin' found. Attempting local restore only.");
      }
    } catch (fetchError) {
      console.log("Skipping remote fetch due to an error:", fetchError.message);
    }

    // Retrieve the tar file via the fetched ref.
    const tarFile = path.join(os.tmpdir(), "fetched_stashes.tar.gz");
    // Resolve the object hash from the ref if available, otherwise try FETCH_HEAD.
    let tarData;
    try {
      const objectHash = execSync(`git rev-parse ${refName}`, {
        encoding: "utf8",
      })
        .toString()
        .trim();
      tarData = execSync(`git cat-file blob ${objectHash}`);
    } catch {
      // Fallback to FETCH_HEAD if ref cannot be resolved (e.g., no remote push yet)
      tarData = execSync(`git cat-file blob FETCH_HEAD`);
    }
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
      // Apply the patch and update the index so changes are tracked.
      execSync(`git apply --index ${fullPath}`);
      // Create a stash entry with a message indicating the patch source.
      execSync(`git stash push -m "Restored stash from ${patchFile}"`);
      // Clean working directory for next patch, if any.
      execSync(`git reset --hard`);
    }

    console.log("Restored stashes from remote tar backup.");
  } catch (error) {
    console.error("Error restoring stashes:", error);
  }
}

module.exports = stashRestore;
