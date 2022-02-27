'use strict';

const express = require("express");
const data = require("./MovieData/data.json");
const axios = require("axios");
const pg = require("pg");

require("dotenv").config();


const app = express();
const APIKEY = process.env.APIKEY;
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);


function MovieData(id, title, release_date, poster_path, overview,){
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
};


app.use(errorHandler);
function errorHandler (err, req, res, next) {
    let error ={
        status:500,
        err:'Sorry, YOU have Error!!'
    };
    res.status(500).send(error)
};

app.get('/', movieHandler);
function movieHandler(req, res){
    let result = [];
    data.data.forEach((value) => {
        let oneMovie = new MovieData(value.title,value.poster_path, value.overview);
        result.push(oneMovie);
    });
    return res.json(result);
};

app.get('/favorite', favoriteHandler);
function favoriteHandler(req, res){
    return res.json("Welcome to Favorite Page");
};

app.get('/trending', trendingHandler);
function trendingHandler(req,res){
    let result = [];
    axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
    .then(apiResponse => {
        apiResponse.data.results.map(ele => {
            let oneMovie = new MovieData(ele.id,ele.title,ele.release_date,ele.poster_path, ele.overview);
            result.push(oneMovie);
        })
        return res.status(200).json(result);
    }).catch(error => {
        errorHandler(error, req, res);
    })
}

app.get("/search", searchHandler);
function searchHandler(req,res){
    const search = req.query.query
    let results = [];
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search || "The"}&page=2`)
    .then(apiResponse=>{
        apiResponse.data.results.map(ele => {
            let oneMovie = new MovieData( ele.id || "N/A",ele.title || "N/A", ele.release_date || "N/A", ele.poster_path || "N/A",ele.overview || "N/A");
            results.push(oneMovie);  
        });
        return res.status(200).json(results);
    }).catch(error => {
        errorHandler(error, req, res);
    })
}

app.get("/popular", popularHandler);
function popularHandler(req,res){
    let result = [];
    axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${APIKEY}&language=en-US&page=1`)
    .then(apiResponse => {
        apiResponse.data.results.map(ele => {
            let oneMovie = new MovieData(ele.id,ele.title,ele.release_date,ele.poster_path, ele.overview);
            result.push(oneMovie);
        })
        return res.status(200).json(result);
    }).catch(error => {
        errorHandler(error, req, res);
    })

}

app.get("/latest", latestHandler);
function latestHandler(req,res){
    axios.get(`https://api.themoviedb.org/3/movie/latest?api_key=${APIKEY}&language=en-US`)
    .then(apiResponse => {
        return res.status(200).json(apiResponse.data);
    }).catch(error => {
        errorHandler(error, req, res);
    })
}
app.get("/getMovies", getMoviesHandler);
function addMovieHandler(req, res) {
    const movie = req.body;
    const sql = `INSERT INTO TheMovieTable(title, release_date, poster_path, overview,comment) VALUES($1, $2, $3, $4, $5) RETURNING *;`;
    const values = [movie.title, movie.release_date,movie.poster_path,movie.overview,movie.comment];
  
    client.query(sql, values).then((result) => {
        return res.status(201).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
}  
app.post("/addMovie", addMovieHandler);
function getMoviesHandler(req, res) {
        const sql =` SELECT * FROM TheMovieTable;`;
        
        client.query(sql).then((result) => {
        return res.status(200).json(result.rows);
        }).catch((error) => {
        errorHandler(error, req, res);
    });
}

app.use("*", notFoundHandler);
function notFoundHandler(req, res){
    return res.status(404).send("Page Not Found");
}

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`);
    });
});