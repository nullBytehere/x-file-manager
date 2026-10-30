const AUTH = {
  iterations: 600000,   // do not change after creating users
  sessionDays: 7,       // length of "Keep me signed in"
  idleMinutes: 30,      // auto sign-out when not "kept signed in" (0 = off)
  users: [
    {
    "username": "admin",
    "salt": "70504425c87104f1236e3882e0337e25",
    "verify": "302de16cc16ae245cc9a3539e7dee6c488963ef6e8a5ad2e67274d09cd3f089e",
    "iv": "Xaka3peTN8RjCOK2",
    "vault": "PGBMxHrQKU0usyp80ts06BKyrXFvVIXQOEINPdDhI4XgeSPwPGhIjypphHgi1t3CrGcb10ktIb40+60PduUUXUQkD4JmUG6+EprmvXPvAivGy40IOlEbXK6F9fXcGCPQP2/ITYfoQoP4YDd9QA==",
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
