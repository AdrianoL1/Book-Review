import express from "express";
import bodyParser  from "body-parser";
import * as db from "./db/index.js";

const app = express();
const port = 3000;

db.connect();

app.use(bodyParser.urlencoded({limit: '25mb', extended: true}));
app.use(bodyParser.json({limit: '25mb'}))
app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        const reviews = await db.query("SELECT * FROM books");
        res.render("index.ejs", {reviews: reviews.rows});
    } catch (error) {
        console.log(error.message);
    }
});

app.route("/addReview")
    .get(async (req, res) => {
        res.render("add-review.ejs");
    })
    .post(async (req, res) => {
        const bookTitle = req.body.bookTitle;
        const bookReview = req.body.bookReview;
        const bookRating = parseInt(req.body.bookRating);
        const bookCover = req.body.coverData;
        const bookDescription = req.body.bookDescription;

        try {
            const result = await db.query("INSERT INTO books (title, review, rating, cover, description) VALUES ($1, $2, $3, $4, $5)", [bookTitle, bookReview, bookRating, bookCover, bookDescription]);
            res.redirect("/");
        } catch (error) {
            console.log(error);
        }
    });

app.route("/editReview/:reviewId")
    .get(async (req, res) => {
        const reviewId = req.params.reviewId;
        try {
            const oldReview = await db.query("SELECT * FROM books WHERE id = $1", [reviewId]);
            res.render("add-review.ejs", {oldReview: oldReview.rows[0]})
            console.log(oldReview.rows[0]);
        } catch (error) {
            console.log(error.message);
        }
    })
    .post(async (req, res) => {
        const reviewId = req.params.reviewId;

        const bookTitle = req.body.bookTitle;
        const bookReview = req.body.bookReview;
        const bookRating = parseInt(req.body.bookRating);
        const bookCover = req.body.coverData;

        try {
            const updateReview = await db.query("UPDATE books SET title = $1, description = $2, rating = $3, cover = $4 WHERE books.id = $5", [bookTitle, bookReview, bookRating, bookCover, reviewId]);
            console.log("update: " + JSON.stringify(updateReview));
            res.redirect("/");
        } catch (error) {
           console.log(error.message); 
        }
    });

app.post("/deleteReview", async (req, res) => {
    const reviewId = parseInt(req.body.reviewId);
    try {
        const deleteReview = await db.query("DELETE FROM books WHERE books.id = $1", [reviewId]);
        res.send(deleteReview);
    } catch (error) {
        console.log(error.message);
    }
});

app.get("/books", async (req, res) => {
    const bookName = req.query.bookName;
    if(bookName){
        try {
            const bookQuery = await db.query("SELECT title, cover, id FROM books WHERE title ILIKE '%' || $1 || '%'", [bookName]);
            res.render("books.ejs", {books: bookQuery.rows});
        } catch (error) {
            console.log(error.message);
        }
    }else{
        try {
            const allBooks = await db.query("SELECT title, cover, id FROM books");
            res.render("books.ejs", {books: allBooks.rows});
        } catch (error) {
            console.log(error.message);
        }
    }
});

app.get("/books/:bookId", async (req, res) => {
    const bookId = req.params.bookId;
    try {
        const singleBook = await db.query("SELECT * FROM books b WHERE b.id = $1", [bookId]);
        res.render("single-book.ejs", {bookStats: singleBook.rows[0], });
    } catch (error) {
        console.log(error.message);
    }
});

app.all("*", async (req, res) => {
    res.render("404.ejs");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});