const AUTH = {
  iterations: 600000,   // do not change after creating users
  sessionDays: 7,       // length of "Keep me signed in"
  idleMinutes: 30,      // auto sign-out when not "kept signed in" (0 = off)
  users: [
    {

        "username": "admin",
      "salt": "438a30acfd8fd5e176f3b604a07dbd53",
    "verify": "5e26756bfae27f606854078d5bf55a42256f7977fe01a19132427a03504d796f",
    "iv": "fnQMWZ6WQ7QHbx+A",
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
