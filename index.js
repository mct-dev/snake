
/**
 * Constants
 */
var 
    COLS=30, ROWS=35, /* */
    EMPTY=0, SNAKE=1, FRUIT=2, // grid values (to determine if a grid x,y is empty, filled with the snake, or filled with fruit)
    UP=0, DOWN=1, LEFT=2, RIGHT=3, /* Snake directions */
    KEY_LEFT=37, KEY_UP=38, KEY_RIGHT=39, KEY_DOWN=40 /* Key codes */

/**
 * Game Objects
*/
var 
    canvas, 
    ctx, 
    keystate, 
    frames,
    score=0

/**
 * Grid Data Structure.  Creates a 2D grid represented by 
 * an array of arrays. 
 * 
 * @type {Object}
 */
var grid = {
    width: null, /* number, the number of columns */
    height: null, /* number, the number of rows */
    _grid: null, /* Array<any>, the data representation */

    /**
     * Initiate, filling a columns x rows grid with the defaultValue
     * 
     * @param {any} defaultValue default value to fill with 
     * @param {number} columns number of columns
     * @param {number} rows number of rows
     */
    init: function(defaultValue,columns,rows) {
        this.width = columns
        this.height = rows

        this._grid = []
        // create empty grid (2D array) with columns.length arrays,
        // filled with rows.length defaultGridValues (0?)
        for (let x = 0; x < columns; x++) {
            this._grid.push([])
            for (let y = 0; y < rows; y++) {
                this._grid[x].push(defaultValue)
            }
        }
    },

    // set [val] at x,y position in _grid array
    set: function(val, x, y) {
        // set value of grid at position x,y (x column and y row)
        this._grid[x][y] = val
    },

    // get value from _grid at x,y position
    get: function(x, y) {
        return this._grid[x][y]
    }
}

var snake = {
    direction: null,
    last: null,
    _queue: null, // list of actions to execute for snake?

    init: function(direction, x, y) {
        this._queue = []
        this.direction = direction

        // set first starting position of snake
        this.insert(x,y)
    },

    /**
     * Add to the start of the snake's queue. Set the
     * last snake location to the newest one.
     * 
     * @param {number} x X coordinate for insert 
     * @param {number} y Y coordinate for insert 
     */
    insert: function(x, y) {
        // add to the start of the queue 
        this._queue.unshift({x:x, y:y})
        // set the last queue position...? why? from the one we just entered?
        this.last = this._queue[0]
    },

    remove: function() {
        // remove last element of snake queue array
        return this._queue.pop()
    }
}

function setFood() {
    // get all empty spots in the grid
    var empty = []
    for (let x = 0; x < grid.width; x++) {
        for (let y =0; y < grid.height; y++) {
            if (grid.get(x,y) === EMPTY) {
                empty.push({x:x, y:y})
            }
        }
    }
    // get random empty space position from this empty list
    var randPosition = empty[Math.floor(Math.random()*empty.length)]
    grid.set(FRUIT, randPosition.x, randPosition.y)
}

function main() {
    canvas = document.createElement('canvas')
    canvas.setAttribute('id', 'snake-canvas')
    canvas.width = COLS*20
    canvas.height = ROWS*20
    ctx = canvas.getContext('2d')
    document.body.appendChild(canvas)
    ctx.font = '12px Quicksand'

    frames = 0
    keystate = {}

    document.addEventListener('keydown', function(event){
        keystate[event.keyCode] = true
    })
    document.addEventListener('keyup', function(event){
        delete keystate[event.keyCode]
    })

    init()
    loop()

}

function init() {
    grid.init(EMPTY, COLS, ROWS)
    score = 0

    // COLS/2 to get middle of the screen (but math.floor to ensure whole number)
    // ROWS-1 to start at the bottom row going UP
    var startPosition = {x: Math.floor(COLS/2), y: ROWS-1}
    snake.init(UP, startPosition.x, startPosition.y)
    grid.set(SNAKE, startPosition.x, startPosition.y)
    setFood()
}

function loop() {
    update()
    draw()

    // tell the browser that you want to perform an animation, and that
    // you want to call loop() every time it "re-paints" the animation
    window.requestAnimationFrame(loop, canvas)
}

function update() {
    frames++

    if (keystate[KEY_LEFT] && snake.direction !== RIGHT){
        snake.direction = LEFT
    }
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT){
        snake.direction = RIGHT 
    }
    if (keystate[KEY_UP] && snake.direction !== DOWN){
        snake.direction = UP 
    }
    if (keystate[KEY_DOWN] && snake.direction !== UP){
        snake.direction = DOWN 
    }

    // every 5 frames...
    if (frames%5 === 0) {
        // get previous snake state
        var newX = snake.last.x
        var newY = snake.last.y

        /**
         * based on the direction of snake movement,
         * increment or decrement the previous snake state
         */
        switch (snake.direction) {
            case LEFT:
                newX--
                break
            case RIGHT:
                newX++
                break
            case UP:
                newY--
                break
            case DOWN:
                newY++
                break
        }
        /**
         * if newly changed snake state is out of bounds or
         * is a tile currently occupied by the snake, start 
         * the game over and return.
         */
        if (newX < 0 || newX > grid.width-1 || 
            newY < 0 || newY > grid.height-1 ||
            grid.get(newX, newY) === SNAKE 
        ) {
            return init()
        }

        /**
         * otherwise, if it's a fruit,
         */
        var tail
        if (grid.get(newX, newY) === FRUIT) {
            score++
            tail = {x:newX, y:newY}
            setFood()
        } else {
            /**
             * Remove the last element in snake queue, and
             * set those coordinates to be empty. Then set  
             * tail to our new coordinates (instead of the ones
             * returned by snake.remove) to use for setting the
             * new tile below.
             */
            tail = snake.remove()
            grid.set(EMPTY, tail.x, tail.y)
            tail.x = newX
            tail.y = newY
        }

        grid.set(SNAKE, tail.x, tail.y)
        snake.insert(tail.x, tail.y)
    }

}

function draw() {
    // draw the tiles in the grid
    var tileWidth = canvas.width / grid.width // get's specfic canvas tile width based on the size of our grid
    var tileHeight = canvas.height / grid.height // get's specfic canvas tile height based on the size of our grid

    // loop through grid to find out which type of tile each tile (x,y) is,
    // then set the context fill color depending on the type.
    for (let x = 0; x < grid.width; x++) {
        for (let y = 0; y < grid.height; y++) {
            switch(grid.get(x,y)) {
                case EMPTY:
                    ctx.fillStyle = '#f4f4f4'
                    break
                case SNAKE:
                    ctx.fillStyle = '#5C7762'
                    break
                case FRUIT:
                    ctx.fillStyle = '#C64C41'
                    break
            }
            // draw a rectangle starting at position (x*tileWidth, y*tileHeight) - this gets the exact
            // canvas position we want to start at, based on our grid location - with a rectangle width 
            // and height of (tileWidth, tileHeight)
            ctx.fillRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight)
        }
    }
    ctx.fillStyle = '#000'
    ctx.fillText(`SCORE: ${score}`, 10, canvas.height - 10)
}
function renderCheck() {
    if (document.getElementById('mobile-hider')) {
        document.body.removeChild(document.getElementById('mobile-hider'))
    }
    if (document.getElementById('snake-canvas')) {
        document.body.removeChild(document.getElementById('snake-canvas'))
    }
    var width = window.innerWidth
    if (width < 1000) {
        var hiderDiv = document.createElement('div')
        hiderDiv.setAttribute('id', 'mobile-hider')
        hiderDiv.textContent = 'Sorry!  The snake game is only available on devices with a larger screen size than this one.'
        document.body.appendChild(hiderDiv)
    } else {
        location.reload()
    }
}
// renderCheck()
window.addEventListener('resize', renderCheck)
main()