let mouse_x;
let mouse_y;

let select_square;

generate_map(100);

queen = new Queen(500,500);
queen2 = new Queen(700,700);

minions.push(queen);
minions.push(queen2);

document.addEventListener("mouseup",()=>{
    if(select_square != null){
        select_square.delete_select_square();
        select_square = null;
    }
})

document.addEventListener("mousedown", (event)=>{
    switch (event.which){
        case 1:
            select_square = new SelectSquare(mouse_x, mouse_y);
            break;
        case 3:
            selected_goto(mouse_x, mouse_y);
            break;
    }

})

// right click
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener("mousemove",(event)=>{
    mouse_x = event.pageX;
    mouse_y = event.pageY;
    // console.log(mouse_x+" "+mouse_y);
    if(select_square != null){
        select_square.update_select_square_size(mouse_x, mouse_y);
    }

})

function selected_goto(x, y){
    for(let minion of minions){
        if(minion.selected) minion.set_goto(x, y);
    }
}

setInterval(loop, 1); // 33 milliseconds = ~ 30 frames per sec

function loop() {
    for(let minion of minions){
        minion.show_is_selected();
        if(minion.selected) minion.move();
    }
    for(let tree of all_trees){
    }
}

function generate_map(number_of_trees){
    for (let i = 0; i < number_of_trees ; i++) {
        let x = Math.random() * window.innerWidth * .9;
        let y = Math.random() * window.innerHeight *.85;

        all_trees.push(new Tree(x, y, "tree.png"));
    }
}
