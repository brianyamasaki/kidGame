var gameData = [

  { // level 0
    launchers: [
      {x: 0.5, y: 0.5}
    ],
    grounds: [
      {
        fillStyle: 'darkgray',
        points : [
          { x: 0, y: 0.9 },
          { x: 0.1, y: 0.95 },
          { x: 0.40, y: 0.95 },
          { x: 0.5, y: 0.8},
          { x: 0.6, y: 0.95},
          { x: 0.9, y: 0.95},
          { x: 1, y: 0.9},
          { x: 1, y: 1},
          { x: 0, y: 1}
        ] 
      },
      {
        fillStyle: 'gray',
        points : [
          { x: .3, y: .3},
          { x: .35, y: .35},
          { x: .3, y: .4},
          { x: .25, y: .35}
        ]
      }
    ]
  },
  { // level 1
    launcherImage: 'missile-command/launcher1.png',
    launcherImageCenter: {x: -25, y: -25 },
    launchers: [
      {x: 0.75, y: 0.8},
      {x: 0.2, y: 0.8}
    ],
    missileImage: 'missile-command/missile1.png',
    missileImageCenter: { x: -21, y: -5},
    projectileImage: 'missile-command/bullet.png',
    projectileImageCenter: {x: -10, y:5},
    grounds: [
      {
        fillStyle: 'orange',
        points: [
          { x: 0, y: .8},
          { x: .45, y: .8},
          { x: .50, y: .9},
          { x: .65, y: .9},
          { x: .80, y: .75},
          { x: 1, y: .75},
          { x: 1, y: 1},
          { x: 0, y: 1}
        ]
      }
    ] 
  }
];