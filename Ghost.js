class Ghost {
    static speed = 2;
    constructor({c, position, velocity, color = 'red', createTime}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.xposition = [];
        this.yposition = [];
        this.speed = 2;
        this.scared = false;
        this.almostNotScared = false;
        this.isWhite = true;
        this.createTime = createTime;
        this.justSpawn = true;
        setInterval(() => {this.isWhite = !this.isWhite}, 300);
    }

    draw() {
        const timeNow = performance.now();
        if (timeNow - this.createTime > 1300) {
            this.justSpawn = false;
        }

        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      
        if (this.almostNotScared || this.justSpawn) {
            if (this.isWhite)
                {
                    c.fillStyle = 'white'
                }
            else {
                c.fillStyle = 'orange'
            }
            
        }
        else {
            c.fillStyle = this.scared? 'blue': this.color
        }

        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}