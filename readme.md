# Git Stash Sync 🚀  
A CLI tool to **automatically track and back up Git stashes to a remote ref. Never lose your stashes again, even after resetting your laptop!  

## Features  
✅ Tracks `git stash push/pop` automatically  
✅ Creates a compressed backup (`tar.gz`) of stashes  
✅ Pushes stash backups to a remote branch (`${username}-stash`)  
✅ Restores stashes when setting up a new machine  

## Installation  

### **Via NPM (Recommended)**  
```sh
npm install -g git-stash-sync
```

## Usage  

### **Sync Stashes**  
```sh
    git-stash-sync init
```
The above command will create a compressed backup of your stashes and push them to a remote ref.

### **Restore Stashes**  
```sh
    git-stash-sync restore
```
The above command will restore your stashes from the remote ref.

### Auto Sync
You can create a git aliash to automatically sync your stashes on every `git stash push/pop`.  
```sh
    git config --global alias.stash '!git stash $@ && git stash-sync backup'
```
Now, every time you run `git stash push/pop`, your stashes will be automatically backed up to a remote branch.
