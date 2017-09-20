var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect();

// Display all of the items available for sale
connection.query("SELECT item_id, product_name, price FROM products;", function(err, res) {
    if (err) throw err;
    console.log(res);
    start();
});

function start() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "Which product would you like to buy?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How much of the product would you like to buy?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }

        // determine if we have enough in stock
        if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
          // if we do, start getting total and updating database
          subtract = chosenItem.stock_quantity - parseInt(answer.quantity);
          total = chosenItem.price * answer.quantity;
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: subtract
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("order has been placed successfully!");
              // how much of the product left we have in stack after purchase

			  console.log("Your total is $" + total);
            });
        }
        else {
         // Not enough in stock
        console.log("We don't have enough in stock, sorry :( ");
        }
      });
  });
}