const shell = require("shelljs");
const path = require("path");
const fs = require("fs");

const CLI_COMMAND = `node ${path.resolve(__dirname, "../bin/index.js")}`;
const TEST_REPO = path.join(__dirname, "test-repo");

// Helper function to set up a temporary Git repository
const setupTestRepo = () => {
  shell.rm("-rf", TEST_REPO);
  shell.mkdir(TEST_REPO);
  shell.cd(TEST_REPO);
  shell.exec("git init");
  shell.exec("git config user.name 'TestUser'");
  shell.exec("git config user.email 'test@example.com'");
  shell.exec(
    "touch README.md && git add README.md && git commit -m 'Initial commit'"
  );
};

// Helper function to create a test file
const createTestFile = (filename, content) => {
  fs.writeFileSync(filename, content);
  shell.exec(`git add ${filename}`);
};

describe("Git Stash Sync CLI", () => {
  beforeAll(() => {
    setupTestRepo();
  });

  afterAll(() => {
    shell.cd(__dirname); // Return to the test root
    shell.rm("-rf", TEST_REPO);
  });

  test("should initialize stash sync and restore stashes", () => {
    const output = shell.exec(`${CLI_COMMAND} init`).stdout;
    expect(output).toContain("Checking for stash backup");
  });

  test("should track stash changes", () => {
    const output = shell.exec(`${CLI_COMMAND} track`).stdout;
    expect(output).toContain("Tracking stash changes...");
  });

  test("should create a stash backup", () => {
    createTestFile("testfile.txt", "Some content");
    shell.exec("git stash push -m 'Test stash'");

    const output = shell.exec(`${CLI_COMMAND} backup`).stdout;
    expect(output).toContain("Backing up stash...");
    expect(output).toContain("Pushing backup to remote...");
  });

  test("should restore stashes from backup", () => {
    shell.exec("git stash clear"); // Clear any existing stash
    const output = shell.exec(`${CLI_COMMAND} init`).stdout;

    expect(output).toContain("Restoring stashes...");
    const restoredStashList = shell.exec("git stash list").stdout;
    expect(restoredStashList).toContain("stash@{0}");
  });
});
