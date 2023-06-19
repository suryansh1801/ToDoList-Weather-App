import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
import dotenv from 'dotenv';
dotenv.config()
const app = express();
import axios from "axios"

app.set('view engine', 'ejs');
app.set("trust proxy", 1)

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


app.get("/", async function (req, res) {


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

    try {
      const weatherKey = process.env.WEATHER_KEY
      const locKey = c8b7f09f7d91e13e0793a7f3c6ce87e4

      const ip = req.ip==="::1" ? "14.139.231.82" : req.ip;

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


