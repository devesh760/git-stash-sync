# Git Stash Sync 🚀  
A CLI tool to **automatically track and back up Git stashes to a remote branch**. Never lose your stashes again, even after resetting your laptop!  

## Features  
✅ Tracks `git stash push/pop` automatically  
✅ Creates a compressed backup (`tar.gz`) of stashes  
✅ Pushes stash backups to a remote branch (`${username}-stash`)  
✅ Restores stashes when setting up a new machine  

## Installation  

### **Via NPM (Recommended)**  
```sh
npm install -g git-stash-sync
