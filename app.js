import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
import dotenv from 'dotenv';
dotenv.config()
const app = express();
import axios from "axios"

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-suryansh:test123@cluster0.5ymiwdm.mongodb.net/todolistDB", { useNewUrlParser: true }, { useUnifiedTopology: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Plan your Day here!"
});

const item2 = new Item({
  name: "Hit the + button to add a Task."
});

const item3 = new Item({
  name: "<-- Hit this to delete a Task."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// app.get("/", async (req, res, next) => {
//   const locKey = process.env.LOCATION_KEY;
//   const locResponse = await fetch(
//     `http://api.ipstack.com/${req.ip}?access_key=${locKey}`
//   );
//   const location = await locResponse.json();
// });

// app.get("/", async (req, res, next) => {

//   const weatherKey = process.env.WEATHER_KEY;
//   const response = await fetch(
//     `http://api.weatherstack.com/current?access_key=${weatherKey}&query=${location.city}`
//   );
//   const weather = await response.json();
// });

// app.get("/", async (req, res, next) => {
//   // ....
//   res.render("weather", { title: "weather", weather });
// });
app.get("/", async function (req, res) {

  // const locKey = process.env.LOCATION_KEY;
  // const locResponse = await fetch(
  //   `http://api.ipstack.com/${req.ip}?access_key=${locKey}`
  // );
  // const location = await locResponse.json();

  // const weatherKey = process.env.WEATHER_KEY;
  // const response = await fetch(
  //   `http://api.weatherstack.com/current?access_key=${weatherKey}&query=${location.city}`
  // );
  // const weatherD = await response.json();

  Item.find({}, async function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      //res.render("list",{listTitle: "Today", weather:weatherD});

    try {
      const weatherKey = process.env.WEATHER_KEY
      const locKey = process.env.LOCATION_KEY

      const ip = process.env.NODE_ENV === "development" ? "45.127.199.132" : "45.127.199.132"

      console.log(req.ip);

      const LOCATION_FETCH_URL = encodeURI(`http://api.ipstack.com/${ip}?access_key=${locKey}`)

      const locationRes = await axios.get(LOCATION_FETCH_URL)

      const location = locationRes.data

      const WEATHER_FETCH_URL = encodeURI(`http://api.weatherstack.com/current?access_key=${weatherKey}&query=${location.city.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`)

      const weatherRes = await axios.get(WEATHER_FETCH_URL)

      const weather = await weatherRes.data

      console.log(LOCATION_FETCH_URL, WEATHER_FETCH_URL);
      console.log(weather);
      
      res.render("list", { listTitle: "Today", newListItems: foundItems, weather: weather })
    } catch (error) {
      console.log(error);
    };
    }
  });

});

// app.get("/:customListName", function(req, res){
//   const customListName = _.capitalize(req.params.customListName);

//   List.findOne({name: customListName}, function(err, foundList){
//     if (!err){
//       if (!foundList){
//         //Create a new list
//         const list = new List({
//           name: customListName,
//           items: defaultItems
//         });
//         list.save();
//         res.redirect("/" + customListName);
//       } else {
//         //Show an existing list

//       //  const weather = {
//       //     location: {
//       //       name: "Nagpur"
//       //     }
//       //   }

//       const weather = "nagpur"

//         res.render("list", {listTitle: "lol", newListItems: foundList.items, weather: "nagpur"});
//       }
//     }
//   });
// });



app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function (req, res) {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started successfully");
});

// http://api.ipstack.com/2405:201:600d:d1ee:6422:a8cb:ca19:4956?access_key=47e089d0232e8937beb76512b242acbe
//39a6b677615a4d460be030bb64ed8092 weatherstack API key