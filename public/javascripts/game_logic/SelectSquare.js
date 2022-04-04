class SelectSquare{
    constructor(anchor_pos_x, anchor_pos_y) {
        this.anchor_pos_x = anchor_pos_x;
        this.anchor_pos_y = anchor_pos_y;
        this.create_select_square();

        this.x_below_anchor = false;
        this.y_below_anchor = false;
    }

    create_select_square(){
        this.select_square = document.createElement("div");
        this.select_square.classList.add("square");
        this.select_square.style.left = this.anchor_pos_x+"px";
        this.select_square.style.top = this.anchor_pos_y+"px";
        document.body.appendChild(this.select_square);
    }

    update_select_square_size(x, y){
        let top_left_corner_x, top_left_corner_y, width, height;

        this.x_below_anchor = x>this.anchor_pos_x;
        this.y_below_anchor = y>this.anchor_pos_y;

        if(this.x_below_anchor) {
            top_left_corner_x = this.anchor_pos_x;
            width = x - this.anchor_pos_x;
            this.select_square.style.width = width + "px";

        }else{
            top_left_corner_x = x;
            width = this.anchor_pos_x - x;

            this.select_square.style.left = top_left_corner_x + "px";
            this.select_square.style.width = width + "px";

        }if(this.y_below_anchor) {
            top_left_corner_y = this.anchor_pos_y;
            height = y - this.anchor_pos_y;
            this.select_square.style.height = height + "px";

        }else{
            top_left_corner_y = y;
            height = this.anchor_pos_y - y;

            this.select_square.style.top = top_left_corner_y + "px";
            this.select_square.style.height = height + "px";
        }

        this.set_selected_items(top_left_corner_x, top_left_corner_y, width, height);

    }

    delete_select_square(){
        document.body.removeChild(this.select_square);
    }

    set_selected_items(top_left_corner_x, top_left_corner_y, width, height){
        for(let minion of minions){

            if (minion.x > top_left_corner_x && minion.y > top_left_corner_y &&
                minion.x < top_left_corner_x + width && minion.y< top_left_corner_y + height ||
                minion.x + SIZE > top_left_corner_x && minion.y + SIZE > top_left_corner_y &&
                minion.x + SIZE < top_left_corner_x + width && minion.y + SIZE < top_left_corner_y + height
            ){
                minion.selected = true;
            }
        }
    }

}