let bottom_menu = document.getElementById("bottom_menu");

export function show_bottom_menu(city){
    show_city_data(city.name, city.food_per_a_minute, city.production_per_a_minute);
    bottom_menu.style.visibility = "visible";
    console.log("here");
}
export function hide_bottom_menu(){
    bottom_menu.style.visibility = "hidden";
    console.log("here");
}
function show_city_data(name, food_per_a_minute, production_per_a_minute){
    document.getElementById("city_name").innerText = name;
    document.getElementById("food_per_a_minute").innerText = food_per_a_minute;
    document.getElementById("production_per_a_minute").innerText = production_per_a_minute;

}
