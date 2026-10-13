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
