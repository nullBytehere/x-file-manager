// js/auth.js — users, passwords and access rules (edit this file only).
//
// No password is stored here. Each user has a random salt and a "verify" value, which is a
// SHA-256 of a PBKDF2 key (600,000 rounds). Neither value can be turned back into the password
// or used to sign in, and a saved session cannot be forged from this file.
//
// ADD A USER
//   1. Open your site (login page), press F12 -> Console, run:
//        makeUser("alice", "a-long-strong-password")
//    copy(await makeUser("alice", "ekta-lomba-strong-password"))
//        makeUser("bob", "another-strong-password", {
//          folders: { allow: ["01. My Photos"], deny: ["Private"] },
//          files:   { allow: "*", deny: ["*.mp4", "*secret*"] }
//        })
//   2. Copy the object it prints into the "users" list below.
//   Delete the demo users (admin, guest) before you publish.
//
// ACCESS RULES (per user)
//   folders.allow : "*" = every folder, or a list like ["Trips", "01. Photos/Public"]
//   folders.deny  : hidden folders. "Private" hides every folder with that name at any level,
//                   "Trips/Old" hides only that path. "*" wildcards work.
//   files.allow   : "*" = every file, or patterns like ["*.jpg", "@images", "@videos"]
//   files.deny    : hidden files, e.g. ["*.mp4", "*secret*", "Trips/draft.png"]
//
// REAL PROTECTION FOR YOUR FILES (recommended)
//   Keep this site in a PUBLIC repo (free GitHub Pages) and keep photos/videos in a separate
//   PRIVATE repo. Point js/config.js at the private repo, create a read-only fine-grained token
//   for it (Contents: Read), then run:
//        makeUser("alice", "her-password", { token: "github_pat_xxx" })
//   The token is encrypted with her password, so nobody can read the private repo without it.
const AUTH = {
  iterations: 600000,   // do not change after creating users
  sessionDays: 7,       // length of "Keep me signed in"
  idleMinutes: 30,      // auto sign-out when not "kept signed in" (0 = off)
  users: [
    {

        "username": "admin",
        "salt": "00e8ebe53227c78568f6e962c87a4e38",
        "verify": "dd09401eb78c1a3d5e0ddacf99737c325c7a8085aa7ea61033f4797ddcbe850e",
        "iv": "nNZQWiyyVx6hcajv",
        "vault": "fkilmf6dgDZcEmvTgeXpHCbHfIgLkJGkvPSmKDdEaR5t3zTo+97uTqaCaR1Amw4ipiuhDPJskVWKJyshMAFpbLXXIkesEUkB1WnemRQ0/rzhr9oqx5D/VUY5iBhsAUTFwnV0AzjUrQKdcH1vkQ==",
        "folders": {
            "allow": "*",
            "deny": []
        },
        "files": {
            "allow": "*",
            "deny": []
        }
    },
    {
        "username": "guest",
        "salt": "1950a17a4c674694e7d3c6262f571ee1",
        "verify": "919f99b52c5897eab8ffd28f5f0ee91b87e8217deb4719709ca8133f2489de38",
        "folders": {
            "allow": "*",
            "deny": [
                "Private"
            ]
        },
        "files": {
            "allow": "*",
            "deny": [
                "*secret*"
            ]
        }
    }
]
};
