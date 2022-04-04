let all_trees = [];

class Tree extends Site{
    constructor(x, y, img_name) {
        super(x, y, 100, img_name);
        this.img.style.transform = "rotate("+Math.floor(Math.random() * (360 + 1))+"deg)";



    }
}