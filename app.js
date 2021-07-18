const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


let alienWidth = 30;
let alienHeight = 30;
let alienHorizontalInc = 0.99;
let alienVerticalInc = 0; 
let alienReverse = false;

let AliensArr = [];


function drawAliens(){
    AliensArr.forEach(alienRow =>{
        alienRow.forEach(alien => {
            ctx.beginPath();
            ctx.rect(alien.x += alienHorizontalInc , alien.y += alienVerticalInc,alienHeight,alienWidth);
            ctx.fillStyle = "#ffff";
            ctx.fill();
        })
    })
}


//spaceShip Obj
const Spaceship = {
    x : canvas.width / 2,
    y : canvas.height * (80/100),
    width : 20,
    height : 20,
    dx : 0,
    speed : 5
}

//spaceship utility functions

function moveSpaceship(e){
    if(e.key === "ArrowLeft" || e.key === "Left"){
        Spaceship.dx = -Spaceship.speed;
    }
    else if(e.key === "ArrowRight" || e.key === "Right")
        Spaceship.dx = Spaceship.speed;
}

function stopSpaceshipMovement(){
    Spaceship.dx = 0;    
}


function createSpaceship(){
    ctx.beginPath();
    ctx.rect(Spaceship.x, Spaceship.y , Spaceship.width, Spaceship.height);
    ctx.fillStyle = "yellow";
    ctx.fill();
}


function spaceshipCollision(){

    Spaceship.x += Spaceship.dx;
    
    if(Spaceship.x + Spaceship.width >= canvas.width){
        Spaceship.x = canvas.width - Spaceship.width;
    }

    if(Spaceship.x <= 0){
        Spaceship.x = 0;
    }
}


//missle Class
class Missle {
    static missleArr = [];

    constructor(){
        this.width = 5;
        this.height = 10;
        this.x = Spaceship.x + Spaceship.width/2 - this.width/2;
        this.y = Spaceship.y + 1 - this.height/2;
        this.speed = 2;
        this.dy = 0;
    }


    
    createMissle(){
        ctx.beginPath();
        ctx.rect(this.x,this.y,this.width,this.height);
        ctx.fillStyle = "crimson";
        ctx.fill();
    }

    static updateMissleArr(){
        Missle.missleArr.forEach(missle => {
            missle.y -= missle.dy;
            missle.createMissle();
        })
    }
    static removeFromCanvas(){
        Missle.missleArr.forEach( (missle,missleIndex)=> {
            if(missle.y - missle.radius == 0){
                Missle.missleArr.splice(missleIndex,1);
            }
        })
    }

    static missleCollision(){
        Missle.missleArr.forEach((missle,missleIndex) => {
            AliensArr.forEach( (alienRow,alienRowIndex) => {
                alienRow.forEach((alien,alienIndex) => {
                    if(missle.x >= alien.x + alienWidth || alien.x >= missle.x + missle.width)
                        return;
                    if(missle.y >= alien.y + alienHeight || alien.y >= missle.y + missle.height)
                        return;
                    
                    Missle.missleArr.splice(missleIndex,1)
                    AliensArr[alienRowIndex].splice(alienIndex,1)
                })
                   
            })
        })    

        AliensArr = AliensArr.filter(element =>  element.length !== 0);
    }

    static launchMissle(){
        let missle = new Missle();
        missle.dy = missle.speed;
        Missle.missleArr.push(missle);
    }
}




// general utility functions

//initializing game
function initializeGame(){
    AliensArr = [
        [{x:0,y:50},{x:50,y:50},{x:100,y:50},{x:150,y:50},{x:200,y:50},{x:250,y:50},{x:300,y:50},{x:350,y:50}],
        [{x:0,y:100},{x:50,y:100},{x:100,y:100},{x:150,y:100},{x:200,y:100},{x:250,y:100},{x:300,y:100},{x:350,y:100}],
        [{x:0,y:150},{x:50,y:150},{x:100,y:150},{x:150,y:150},{x:200,y:150},{x:250,y:150},{x:300,y:150},{x:350,y:150}]
                ];
                
    Missle.missleArr = [];
    Spaceship.x = canvas.width / 2,
    Spaceship.y = canvas.height * (80/100)
}

//clearing canvas for next frame
function clearCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
}


//reversing/descending alien grid at border collision
function alienCollision(){ 
    let minX = canvas.width;
    let maxX = -1;

    AliensArr.forEach(alienRow => {
        alienRow.forEach(alien => {
            if(alien.x > maxX)
                maxX = alien.x;
            else if (alien.x < minX)
                minX = alien.x;
        })
    })

    if(maxX + 30 >= canvas.width || (alienReverse && minX <= 0) ){
        alienHorizontalInc *= -1;
        alienVerticalInc = 25;
        alienReverse = !alienReverse;
    }
    else{
        alienVerticalInc = 0;
    }
}


//resting the game after 2secs
function resetGame(){
    setTimeout(()=>{
            initializeGame();
            updateCanvas();
    },2000)
}


//stopping when winning or losing condition is met
function stopGame(id){
    let maxY = 0;

    AliensArr.forEach(alienRow => {
        alienRow.forEach(alien => {
            if(alien.y > maxY)
                maxY = alien.y;
        })
    })

    ctx.font = "36px Bebas Neue , cursive";
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#ffff'
    
    if(AliensArr.length === 0){
        cancelAnimationFrame(id);
        ctx.strokeText("VICTORY IS OURS!",canvas.width/2,canvas.height/2);
        resetGame();
    }
    else if(Spaceship.y <= maxY + alienHeight){
        cancelAnimationFrame(id);
        ctx.strokeText("WE WILL GET 'EM NEXT TIME!",canvas.width/2,canvas.height/2);
        resetGame();
    }

}

document.addEventListener("keydown" , e => {moveSpaceship(e)})

document.addEventListener("keyup" , e => {
    if(e.key == 32 || e.key === " "){
        Missle.launchMissle();   
    }
    if(e.key === "ArrowLeft" || e.key === "ArrowRight")
        stopSpaceshipMovement();
})


function updateCanvas(){    
    clearCanvas();
    drawAliens();
    alienCollision();

    Missle.updateMissleArr();
    Missle.removeFromCanvas();
    Missle.missleCollision();

    
    createSpaceship();
    spaceshipCollision();
    
    stopGame(requestAnimationFrame(updateCanvas));
}

initializeGame();
updateCanvas();

