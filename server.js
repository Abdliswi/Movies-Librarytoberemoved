'use strict';

const express = require("express");
const data = require("./MovieData/data.json");
const app = express();

function MovieData(title, poster_path, overview,){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
};

app.get('/', movieHandler);
app.get('/favorite', favoriteHandler);

function movieHandler(req, res){
    let result = [];
    data.data.forEach((value) => {
        let oneMovie = new MovieData(value.title,value.poster_path, value.overview);
        result.push(oneMovie);
    });
    return res.json(result);
};

function favoriteHandler(req, res){
    return res.json("Welcome to Favorite Page");
};

app.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
});