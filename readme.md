# Git Stash Sync 🚀  
A CLI tool to automatically track and back up Git stashes to a remote ref. Never lose your stashes again, even after resetting your laptop!

## Features  
✅ Track stash events via CLI
✅ Creates a compressed backup (`tar.gz`) of stashes  
✅ Pushes stash backups to a remote ref (`refs/stash-backup/<username>`) when a remote exists  
✅ Restores stashes when setting up a new machine  

## Installation  

### Via npm (recommended)
```sh
npm install -g git-stash-sync
```

## Usage  

### Sync stashes (restore)
```sh
git-stash-sync init
```
Restores stashes from the local/remote backup. If a remote named `origin` exists, the backup is fetched automatically.

### Restore stashes (alias)
```sh
git-stash-sync restore
```
Alias for `init`.

### Backup stashes
```sh
git-stash-sync backup
```
Creates a compressed backup of current stashes and stores it under `refs/stash-backup/<username>`. If `origin` exists, it will push the backup.

### Track (optional)
```sh
git-stash-sync track
```
Outputs a message. You can wire this into your own hooks/aliases.

### Auto sync (optional)
You can create a git alias to trigger backups after `git stash` operations:
```sh
git config --global alias.stash '!git stash $@ && git-stash-sync backup'
```
Now, every time you run `git stash push/pop`, your stashes will be automatically backed up locally and pushed if a remote exists.
