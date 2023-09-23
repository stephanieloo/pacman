const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const scoreEl = document.querySelector('#scoreEl');
console.log(scoreEl);
canvas.width = innerWidth;
canvas.height = innerHeight;

class Boundary {
    static width = 40;
    static height = 40;
    constructor({position, image}) {
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw() {
        //c.fillStyle = 'blue';
        //c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.drawImage(this.image, this.position.x, this.position.y);
    }
}

class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.radians = 0.75;
        this.openRate = 0.12;
        this.rotation = 0;
    }

    draw() {
        c.save();
        c.translate(this.position.x, this.position.y);
        c.rotate(this.rotation);
        c.translate(-this.position.x, -this.position.y);
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians);
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.radians < 0 || this.radians > 0.75) {
            this.openRate = -this.openRate;

        }
        this.radians += this.openRate;
    }
}

class Ghost {
    static speed = 2;
    constructor({position, velocity, color = 'red'}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.xposition = [];
        this.yposition = [];
        this.speed = 2;
        this.scared = false;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.scared? 'blue' : this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Pellet {
    constructor({position, velocity}) {
        this.position = position;
        this.radius = 3;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }

}

class PowerUp {
    constructor({position}) {
        this.position = position;
        this.radius = 8;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }

}

const pellets = [];

const boundaries = [];

const powerUps = [];

const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width/2,
            y: Boundary.height * 7 + Boundary.height/2,
        },

        velocity:{
            x: Ghost.speed,
            y: 0,
        },
    }),

    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width/2,
            y: Boundary.height * 11+ Boundary.height/2,
        },

        velocity:{
            x: Ghost.speed,
            y: 0,
        },
        color: 'pink',
    })
]
//console.log(ghosts);
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
        velocity: -5,
    },
    a: {
        pressed: false,
        direction: 'x',
        velocity: -5,
    },
    s: {
        pressed: false,
        direction: 'y',
        velocity: 5,
    },
    d: {
        pressed: false,
        direction: 'x',
        velocity: 5,
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
                ghosts.splice(i, 1)
            }
            else {
                cancelAnimationFrame(animationId);
                console.log('You lose');
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

                setTimeout(() => {
                    ghost.scared = false;

                }, 5000)
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

        
        if (ghost.position.x + potentialPathways[shortestIndex].x == ghost.xposition[ghost.xposition.length-2] && 

            ghost.position.y + potentialPathways[shortestIndex].y == ghost.yposition[ghost.yposition.length-2] )

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
            ghost.yposition.push(ghost.position.y + ghost.velocity.y);}
        


        console.log(`${ghost.color} ghost's new x velocity is ${ghost.velocity.x}`)
        console.log(`${ghost.color} ghost's new y velocity is ${ghost.velocity.y}`)

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