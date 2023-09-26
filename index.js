const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const scoreEl = document.querySelector('#scoreEl');
console.log(scoreEl);
canvas.width = innerWidth;
canvas.height = innerHeight;

const pellets = [];

const boundaries = [];

const powerUps = [];
let redGhostXPosition = [];
let redGhostYPosition = [];
let pinkGhostXPosition =[];
let pinkGhostYPosition = [];   

function createGhost({color, column, row}) {
    return new Ghost({
        c,
        position: {
            x: Boundary.width * column + Boundary.width/2,
            y: Boundary.height * row + Boundary.height/2,
        },

        velocity:{
            x: Ghost.speed,
            y: 0,
        },

        color: color,
        createTime: performance.now()
    })
}

const ghosts = [
    createGhost({column: 6, row: 7}),
    createGhost({color: 'pink', column: 6, row: 11})
]


const player = new Player({
    position: {
        x: Boundary.width + Boundary.width/2,
        y: Boundary.height + Boundary.height/2,
    },
    velocity: {
        x: 0,
        y: 0,
    }
});

const keys = {
    w: {
        pressed: false,
        direction: 'y',
        velocity: -4,
    },
    a: {
        pressed: false,
        direction: 'x',
        velocity: -4,
    },
    s: {
        pressed: false,
        direction: 'y',
        velocity: 4,
    },
    d: {
        pressed: false,
        direction: 'x',
        velocity: 4,
    },
}

let lastKey = '';
let score = 0;

const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],   
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
]

function createImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

const BoundaryImage = {
    '-': './img/pipeHorizontal.png',
    '|': './img/pipeVertical.png',
    '1': './img/pipeCorner1.png',
    '2': './img/pipeCorner2.png',
    '3': './img/pipeCorner3.png',
    '4': './img/pipeCorner4.png',
    '5': './img/pipeConnectorTop.png',
    '6': './img/pipeConnectorRight.png',
    '7': './img/pipeConnectorBottom.png',
    '8': './img/pipeConnectorLeft.png',
    'b': './img/block.png',
    '[': './img/capLeft.png',
    ']': './img/capRight.png',
    '_': './img/capBottom.png',
    '^': './img/capTop.png',
    '+': './img/pipeCross.png',

};

function createBoundaryImage(symbol, i, j) {
    boundaries.push(
        new Boundary({
            position: {
                x: Boundary.width * j,
                y: Boundary.height * i
            },
            image: createImage(BoundaryImage[symbol])
}))}

map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
            case '|':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case 'b':
            case '[':
            case ']':
            case '_':
            case '^':
            case '+':
                createBoundaryImage(symbol, i, j);
                break
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: Boundary.width * j + Boundary.width/2,
                            y: Boundary.height * i + Boundary.height/2,
                        },
                    })
                )
                break
            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: Boundary.width * j + Boundary.width/2,
                            y: Boundary.height * i + Boundary.height/2,
                        },
                    })
                )
                break
            default:
                console.log(`Can't find '${symbol}'`);
        }
    })
})

function circleCollideWithRectangle({
    circle,
    rectangle
}) {
    const padding = Boundary.width / 2 - circle.radius - 1;
    return(
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.width + padding && 
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding && 
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding && 
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
    )
}

function distance({ghost, player}) {
    return (
        Math.sqrt((ghost.position.y + ghost.velocity.y -player.position.y)**2 + ((ghost.position.x + ghost.velocity.x - player.position.x))**2)
    )
}

function checkGhostGetStuck({ghost, potentialPathways, shortestIndex}) {
    
        if (ghost.position.x + potentialPathways[shortestIndex].x == ghost.xposition[ghost.xposition.length-2] && 
            ghost.position.y + potentialPathways[shortestIndex].y == ghost.yposition[ghost.yposition.length-2])
            {
                return true;
            }
        else {
            return false;
        }}
    



let animationId 
function animate() {
    animationId = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    //Detect collision between player and boundaries
    for (const key in keys) {
        if (keys[key].pressed && lastKey == key) {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i];
                if (
                    circleCollideWithRectangle({
                        circle: {
                            ...player,
                            velocity: 
                                {
                                    x: 0,
                                    y: 0,
                                    [keys[key].direction]: keys[key].velocity}
                        },
                        rectangle: boundary
                    })
                )
                    {
                        player.velocity[keys[key].direction] = 0
                        break
                    } 
                else {
                        player.velocity[keys[key].direction] = keys[key].velocity;
                    }
            }
            
        }
        }
    
    // Remove eaten pellets
   for (let i = 0; i < pellets.length; i++ ) {
    const pellet = pellets[i];
    if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius) 
    {
        pellets.splice(i, 1);
        score += 10;
        scoreEl.innerHTML = score;
    }

    }

//Ghost touches player 
    for (let i = 0; i < ghosts.length; i++ ) 
    {
        const ghost = ghosts[i];
        if (Math.hypot(ghost.position.x - player.position.x, ghost.position.y - player.position.y) < ghost.radius + player.radius) 
        {
            if (ghost.scared) {
                ghosts.splice(i, 1);
                if (ghost.color == 'red') {
                    setTimeout(() =>{ghosts.push(createGhost(
                        {color: 'red',
                        column: 6,
                        row: 7}
                    ))}, 5000)
                }
                else {
                    setTimeout(() =>{ghosts.push(createGhost(
                        {color: 'pink',
                        column: 6,
                        row: 11}
                    ))}, 5000)
                }
            }
            else {
                
                if (!ghost.justSpawn) {
                   
                cancelAnimationFrame(animationId);
                console.log('You lose');
                }
            }
        }
    }

    // Win condition 
    if (pellets.length === 0) {
        console.log('You win')
        cancelAnimationFrame(animationId);
    };

    //Powerups go
    for (let i = 0; i < powerUps.length; i++ ) 
    {
        const powerup = powerUps[i];
        powerup.draw();

        //player collides with powerup
        if (Math.hypot(powerup.position.x - player.position.x, powerup.position.y - player.position.y) < powerup.radius + player.radius) 
        {
            powerUps.splice(i, 1);
            ghosts.forEach(ghost => {
                ghost.scared = true;
                setTimeout(() => {ghost.almostNotScared = true}, 4000);
                setTimeout(() => {
                    ghost.scared = false;
                    ghost.almostNotScared = false;
                }, 6000)
            })
            
        }
    }

    //Draw remaining pellets
    for (let i = 0; i < pellets.length; i++ ) 
    {
        pellets[i].draw();
    }

    // Draw maze
    boundaries.forEach(boundary => {
        boundary.draw();

        if (circleCollideWithRectangle({
            circle: player, 
            rectangle: boundary})
            ) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    })
    player.update();  

    const directionObj = [
        {
            direction: 'right',
            x: Ghost.speed,
            y: 0,
        },
        {
            direction: 'left',
            x: -Ghost.speed,
            y: 0,
        },
        {
            direction: 'down',
            x: 0,
            y: Ghost.speed,
        },
        {
            direction: 'up',
            x: 0,
            y: -Ghost.speed,
        },
    ]



    ghosts.forEach(ghost => {
        
        ghost.update();
        
        if (ghost.color == 'red') {
            redGhostXPosition.push(ghost.position.x);
            redGhostYPosition.push(ghost.position.y);
        }
        else {
            pinkGhostXPosition.push(ghost.position.x);
            pinkGhostYPosition.push(ghost.position.y);
        }
        const collisions = [];
        boundaries.forEach(boundary => {
            directionObj.forEach(object => 
                {
       
                if (circleCollideWithRectangle({
                        circle: {
                            ...ghost,
                            velocity: {
                                x: object.x,
                                y: object.y
                            } 
                            },
                            rectangle: boundary
                        }
                    ))
                    {   
                        collisions.push(object.direction)

            }})
           
            }
        )
        const potentialPathways = [];
    
        directionObj.forEach(obj => {
            if (!collisions.includes(obj.direction)) {
                const calculatedDistance = distance({
                    ghost: {...ghost,
                    velocity: {
                        x: obj.x,
                        y: obj.y
                    } },
                    player: player});
                potentialPathways.push({...obj, distance: calculatedDistance})
            }})
        

        let shortestDistance = 0;
        let shortestIndex = null;
            
               
        for (let i = 0; i< potentialPathways.length; i++){
            if (!ghost.scared)
                {if (potentialPathways[i].distance <= shortestDistance || shortestDistance == 0) {
                    shortestDistance = potentialPathways[i].distance;

                    shortestIndex = i;
                }}
            else {
                if (potentialPathways[i].distance >= shortestDistance || shortestDistance == 0) {
                    shortestDistance = potentialPathways[i].distance;

                    shortestIndex = i;
                }
            }
        } 
        
        let isGhostStuck = false;
        //console.log(checkGhostGetStuck({ghost, potentialPathways, shortestIndex}))
        

        isGhostStuck = checkGhostGetStuck({ghost, potentialPathways, shortestIndex});
        // console.log(ghost.color, isGhostStuck)
        if (isGhostStuck ||
            (redGhostXPosition[redGhostXPosition.length-1] == pinkGhostXPosition[pinkGhostXPosition.length-1] && redGhostYPosition[redGhostYPosition.length-1] == pinkGhostYPosition[pinkGhostYPosition.length-1]))

            {
                if (shortestIndex == 0) {
                    ghost.velocity.x = potentialPathways[shortestIndex+1].x;
                    ghost.velocity.y = potentialPathways[shortestIndex+1].y;
                    ghost.xposition.push(ghost.position.x + ghost.velocity.x);
                    ghost.yposition.push(ghost.position.y + ghost.velocity.y);
                }
                else {
                    ghost.velocity.x = potentialPathways[shortestIndex-1].x;
                    ghost.velocity.y = potentialPathways[shortestIndex-1].y;
                    ghost.xposition.push(ghost.position.x + ghost.velocity.x);
                    ghost.yposition.push(ghost.position.y + ghost.velocity.y);
                }
            }
           
        else {
           
            ghost.velocity.x = potentialPathways[shortestIndex].x;
            ghost.velocity.y = potentialPathways[shortestIndex].y;
            ghost.xposition.push(ghost.position.x + ghost.velocity.x);
            ghost.yposition.push(ghost.position.y + ghost.velocity.y);
        }
        
       }

    )
    if (player.velocity.x > 0) {
        player.rotation = 0;
    }
    else if (player.velocity.x < 0) {
        player.rotation = Math.PI;
    }
    else if (player.velocity.y < 0) {
        player.rotation = -Math.PI/2;
    }
    else if (player.velocity.y > 0) {
        player.rotation = Math.PI/2;
    }
} //end of animate()

animate();


addEventListener('keydown', ({key}) => {
        for (const item in keys) {
            if (item == key) {
                keys[item].pressed = true;
                lastKey = key
            }
        }
})

addEventListener('keyup', ({key}) => {
        for (const item in keys) {
            if (item == key) {
                setTimeout(() => {keys[item].pressed = false}, 2000);
            }
        }
})