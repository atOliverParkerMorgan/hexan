let random_usernames = ["John Doe", "Bob Smith", "123", "-1", "true"]
const random_username = random_usernames[Math.floor(Math.random()*random_usernames.length)]
// const enemy_city_cords = document.querySelector("#enemy_city_cords").textContent.split(" ");

describe('', () => {
  it('passes', () => {
    cy.visit('/')
    cy.get("#nick_input").type("{enter}");
    cy.get("#nick_input").type(random_username).type("{enter}");

    // gameSettings
    cy.get("#game_mode_to_2v2_button").click();
    cy.get("#game_mode_to_FRIEND_button").click();
    cy.get("#game_mode_to_AI_button").click();
    cy.get("#game_mode_to_1v1_button").click();

    cy.get('#myRange')
       .invoke('val', 400)
        .trigger('change')

    cy.get("#play_button").click();
    cy.get("#time");

    cy.wait(6000);
    cy.get("#my_city_cords")
        .then(($my_city_cords)=>{
          const my_city_cords = $my_city_cords.text().split(" ");
          cy.wait(4000);
          cy.get("canvas").then($canvas => {
            // Get dimension of the canvas

            const canvasWidth = $canvas.width();
            const canvasHeight = $canvas.height();

            // Divide in half since cursor will be at center of canvas

            const canvasCenterX = canvasWidth / 2;
            const canvasCenterY = canvasHeight / 2;

            // Determine the click position by dissecting the space where the button is
            // This helps allow the test to work responsively

            const buttonX = canvasCenterX + ( ( canvasCenterX / 3 ) * 2 );
            const buttonY = canvasCenterY + ( ( canvasCenterY / 3 ) * 2 );

            // Wrap the canvas with the Cypress API, scroll it into view, and click in the location!

            cy.wrap($canvas)
                .click(parseInt(my_city_cords[0]), parseInt(my_city_cords[1]))
          });
        });
  })
  // Run a visual test to confirm it's working
})