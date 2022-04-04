class Site{
    constructor(x, y, radius, image_name) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.image_name = image_name;

        this.create_shape();

        document.body.appendChild(this.img);
    }

    create_shape(){
        this.img = document.createElement("img");
        this.img.src = "/images/"+this.image_name;
        this.img.style.position = "absolute";
        this.img.style.left = this.x + "px";
        this.img.style.top = this.y + "px";
        this.img.classList.add("selector");
        this.img.draggable = false;
        this.img.style.pointerEvents = "none";


    }
}