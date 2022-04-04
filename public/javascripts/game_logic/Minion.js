let minions = [];

class Minion{
    constructor(x, y, health, html_element_class_name) {
        this.x = x;
        this.y = y;

        this.health = health;
        this.selected = false;

        this.goto_x = x;
        this.goto_y = y;

        this.speed_x = 0;
        this.speed_y = 0;

        this.html_element_class_name = html_element_class_name;

        this.create_shape();
        this.set_position();

        document.body.appendChild(this.html_element);
    }
    set_position(){
        this.html_element.style.left = this.x + "px";
        this.html_element.style.top = this.y + "px";
    }

    show_is_selected(){
        if(this.selected) this.html_element.style.opacity = "0.6";
        else this.html_element.style.opacity = "1";
    }

    create_shape(){
        this.html_element = document.createElement("div");
        this.html_element.classList.add(this.html_element_class_name);
    }

    set_goto(x,y){
        this.goto_x = x;
        this.goto_y = y;

        this.set_speed();
    }

    set_speed(){
        // get leaner equation parameters
        // y = k*x + q => q = y - k*x
        // goto_y = k*goto_x + q => goto_y = k*goto_x + y - k*x
        // goto_y - y = k*(goto_x - x)
        // k = (goto_y - y) / (goto_x - x)

        let angle = Math.atan2((this.y + SIZE/2 - this.goto_y), (this.x + SIZE/2 - this.goto_x));
        if(angle<0) angle=Math.PI*2 + angle;
       // console.log("Angle: "+(angle* 180 /  Math.PI).toString());
        this.speed_x = - Math.cos(angle);
        this.speed_y = - Math.sin(angle);
    }

    move(){
        if(!this.is_moving()) return;

        if(this.has_not_arrived()) {
            this.x += this.speed_x;
            this.y += this.speed_y;
            this.set_position();
        }else{
            this.selected = false;
            this.speed_x = 0;
            this.speed_y = 0;
        }
    }

    is_moving(){
        return this.speed_x !== 0 && this.speed_y !== 0;
    }

    has_not_arrived(){
        return Math.abs(this.x - this.goto_x + SIZE/2) > 1 && Math.abs(this.y - this.goto_y+ SIZE/2) > 1;
    }
}
